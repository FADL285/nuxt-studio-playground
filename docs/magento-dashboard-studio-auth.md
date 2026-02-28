# Integrating Nuxt Studio with Magento Admin Dashboard Session

How to let Magento admin panel users access `/_studio` using their **Dashboard login** (not storefront).

## The Challenge

Magento Admin Panel sessions are:

- PHP server-side sessions with an `adminhtml` cookie scoped to `/admin` path
- On the Magento domain (different from Nuxt frontend domain)
- Not directly accessible from Nuxt (different origin, HttpOnly)

**You cannot directly reuse the Magento admin session cookie.** Instead, we bridge the two systems via admin API tokens.

## Architecture

```
Magento Admin Panel                        Nuxt Frontend
┌────────────────────┐                    ┌─────────────────────┐
│                    │                    │                     │
│  Admin logs in     │                    │  /_studio           │
│  (username+pass)   │                    │  Login form         │
│       │            │                    │       │             │
│       ▼            │    REST API        │       ▼             │
│  Admin session     │◄──────────────────►│  Validate token     │
│  (PHP, adminhtml)  │  POST /V1/inte-    │  via Magento API    │
│                    │  gration/admin/    │       │             │
│  Custom module:    │  token             │       ▼             │
│  "Open Studio"     │                    │  setStudioUser-     │
│  button in admin   │                    │  Session()          │
│                    │                    │       │             │
└────────────────────┘                    │       ▼             │
                                          │  Studio editor      │
                                          │  activates          │
                                          └─────────────────────┘
```

## Strategy A: Admin Username/Password Login (Simplest)

The admin enters their Magento dashboard credentials in the Studio login form. The Nuxt server validates them against Magento's admin token API.

### How It Works

1. Admin navigates to `/_studio`
2. Sees email/password form (same as current implementation)
3. Enters Magento **admin username + password**
4. Nuxt server calls Magento REST API to get an admin token
5. If valid → `setStudioUserSession()` → Studio activates

### Implementation

Replace the allowlist check in `server/api/studio/login.post.ts` with Magento admin token validation:

```ts
// server/api/studio/login.post.ts
export default eventHandler(async (event) => {
  const { email: username, password } = await readBody<{
    email: string
    password: string
  }>(event)

  if (!username || !password) {
    throw createError({ statusCode: 400, message: 'Username and password required' })
  }

  const magentoUrl = process.env.MAGENTO_BASE_URL
  if (!magentoUrl) {
    throw createError({ statusCode: 500, message: 'MAGENTO_BASE_URL not configured' })
  }

  // Step 1: Get admin token from Magento REST API
  // NOTE: This is REST, not GraphQL — Magento admin token endpoint is REST-only
  let adminToken: string
  try {
    adminToken = await $fetch<string>(`${magentoUrl}/rest/V1/integration/admin/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { username, password }
    })
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid admin credentials' })
  }

  // Step 2: Validate token + get admin info by calling a protected endpoint
  // Stock Magento has no /V1/users/me — use store/websites as a lightweight probe
  try {
    await $fetch(`${magentoUrl}/rest/V1/store/websites`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
  } catch {
    throw createError({ statusCode: 401, message: 'Admin token validation failed' })
  }

  // Step 3: Create Studio session
  await setStudioUserSession(event, {
    name: username, // Magento admin username
    email: `${username}@admin.magento`, // Synthetic email for Studio
    providerId: username
  })

  return { ok: true }
})
```

### Getting Real Admin User Info

Stock Magento has no `GET /V1/users/me` for admins. Two options:

**Option 1 — Custom Magento GraphQL Mutation** (recommended since you use GraphQL):

```php
// app/code/Vendor/StudioBridge/etc/schema.graphqls
type Query {
    studioAdminMe: StudioAdminUser @resolver(class: "Vendor\\StudioBridge\\Model\\Resolver\\AdminMe")
}

type StudioAdminUser {
    id: Int
    username: String
    email: String
    firstname: String
    lastname: String
}
```

```php
// app/code/Vendor/StudioBridge/Model/Resolver/AdminMe.php
class AdminMe implements ResolverInterface
{
    public function __construct(
        private \Magento\Integration\Model\Oauth\TokenFactory $tokenFactory,
        private \Magento\User\Model\UserFactory $userFactory
    ) {}

    public function resolve($field, $context, $info, $value = null, $args = null)
    {
        // $context->getUserId() gives the admin user ID from the bearer token
        $userId = $context->getUserId();
        $user = $this->userFactory->create()->load($userId);

        return [
            'id' => $user->getId(),
            'username' => $user->getUserName(),
            'email' => $user->getEmail(),
            'firstname' => $user->getFirstName(),
            'lastname' => $user->getLastName(),
        ];
    }
}
```

Then from Nuxt:

```ts
const adminInfo = await $fetch(`${magentoUrl}/graphql`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  },
  body: {
    query: `query { studioAdminMe { email firstname lastname } }`
  }
})

const { email, firstname, lastname } = adminInfo.data.studioAdminMe
```

**Option 2 — REST search** (no custom module needed):

```ts
// Requires "Magento_User::acl_users" ACL permission
const users = await $fetch(
  `${magentoUrl}/rest/V1/users?searchCriteria[filterGroups][0][filters][0][field]=username&searchCriteria[filterGroups][0][filters][0][value]=${username}`,
  { headers: { Authorization: `Bearer ${adminToken}` } }
)
const admin = users.items?.[0]
// admin.email, admin.firstname, admin.lastname
```

## Strategy B: "Open Studio" Button in Magento Admin (Best UX)

Add a button/menu item to the Magento admin panel that opens `/_studio` with an auto-login token.

### How It Works

1. Admin is already logged into Magento Dashboard
2. Clicks "Open Studio" button in the admin panel
3. Magento generates a short-lived token and redirects to Nuxt:
   `https://frontend.com/_studio/auto-login?token=<admin-token>`
4. Nuxt validates the token → creates Studio session → activates

### Magento Module: "Open Studio" Admin Menu Item

```php
// app/code/Vendor/StudioBridge/etc/adminhtml/menu.xml
<config>
    <menu>
        <add id="Vendor_StudioBridge::studio"
             title="Open Content Studio"
             module="Vendor_StudioBridge"
             action="studioBridge/studio/open"
             resource="Vendor_StudioBridge::studio"
             sortOrder="999" />
    </menu>
</config>
```

```php
// app/code/Vendor/StudioBridge/Controller/Adminhtml/Studio/Open.php
class Open extends \Magento\Backend\App\Action
{
    public function __construct(
        Context $context,
        private \Magento\Integration\Model\Oauth\TokenFactory $tokenFactory,
        private \Magento\Backend\Model\Auth\Session $authSession,
        private \Magento\Framework\App\Config\ScopeConfigInterface $scopeConfig
    ) {
        parent::__construct($context);
    }

    public function execute()
    {
        $adminUser = $this->authSession->getUser();

        // Create a short-lived admin token
        $token = $this->tokenFactory->create();
        $token->createAdminToken($adminUser->getId());

        $studioUrl = $this->scopeConfig->getValue('studio_bridge/general/frontend_url');
        // e.g. https://frontend.com/_studio/auto-login?token=xxx&email=admin@example.com

        $redirect = $studioUrl . '/auto-login?token=' . $token->getToken()
                  . '&email=' . urlencode($adminUser->getEmail())
                  . '&name=' . urlencode($adminUser->getFirstName() . ' ' . $adminUser->getLastName());

        return $this->resultRedirectFactory->create()->setUrl($redirect);
    }
}
```

### Nuxt Auto-Login Route

```ts
// server/routes/_studio/auto-login.get.ts
export default eventHandler(async (event) => {
  const { token, email, name } = getQuery(event)

  if (!token || !email) {
    throw createError({ statusCode: 400, message: 'Missing token or email' })
  }

  const magentoUrl = process.env.MAGENTO_BASE_URL

  // Validate the admin token against Magento
  try {
    await $fetch(`${magentoUrl}/rest/V1/store/websites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid or expired admin token' })
  }

  // Create Studio session
  await setStudioUserSession(event, {
    name: String(name || 'Admin'),
    email: String(email),
    providerId: String(email)
  })

  return sendRedirect(event, '/')
})
```

### Admin Token Lifetime

Default: **4 hours**. Configure in Magento:

```
Stores → Configuration → Services → OAuth → Access Token Expiration
→ Admin Token Lifetime (Hours): 4
```

Set to `0` for never-expire (not recommended for production).

## Strategy C: Shared Cookie Domain (Advanced)

If both Magento and Nuxt are on the **same parent domain**:

```
Magento admin:  admin.example.com
Nuxt frontend:  www.example.com  (or example.com)
```

You can set a shared cookie on `.example.com` from the Magento admin after login, then read it from Nuxt.

### Magento Observer: Set Shared Cookie on Admin Login

```php
// Observer for admin_user_authenticate_after event
class SetStudioCookie implements ObserverInterface
{
    public function execute(Observer $observer)
    {
        $user = $observer->getEvent()->getUser();
        $token = $this->tokenFactory->create()->createAdminToken($user->getId());

        // Set cookie on parent domain, readable by Nuxt
        setcookie('magento_admin_token', $token->getToken(), [
            'expires' => time() + 14400, // 4 hours
            'path' => '/',
            'domain' => '.example.com', // parent domain
            'secure' => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
}
```

### Nuxt Middleware: Auto-Login from Shared Cookie

```ts
// server/routes/_studio.get.ts — add before rendering login page
const adminToken = getCookie(event, 'magento_admin_token')
if (adminToken) {
  // Validate token against Magento
  try {
    await $fetch(`${magentoUrl}/rest/V1/store/websites`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
    // Token valid — auto-login
    await setStudioUserSession(event, { name: 'Admin', email: '...', providerId: '...' })
    return sendRedirect(event, '/')
  } catch {
    // Token expired — fall through to login form
    deleteCookie(event, 'magento_admin_token', { domain: '.example.com' })
  }
}
```

## 2FA Consideration (Magento 2.4+)

Magento 2.4+ has 2FA enabled by default. `POST /V1/integration/admin/token` is **blocked** when 2FA is active.

### Options:

1. **Disable 2FA** (dev only, not recommended for production):
   ```bash
   php bin/magento module:disable Magento_TwoFactorAuth
   ```

2. **Use 2FA-aware endpoint** (Google Authenticator):
   ```
   POST /rest/V1/tfa/provider/google/authenticate
   {"username": "admin", "password": "...", "otp": "123456"}
   ```
   → Add a "2FA Code" field to the Studio login form.

3. **Use Integration Tokens** (bypass 2FA):
   ```bash
   php bin/magento config:set oauth/consumer/enable_integration_as_bearer 1
   ```
   Create a permanent Integration in Magento Admin → System → Integrations.
   The integration token never expires and is not subject to 2FA.

4. **Strategy B (recommended)**: The "Open Studio" button approach bypasses the token API entirely — it creates a token server-side from the existing admin PHP session.

## Recommended Approach

| Scenario | Strategy | Complexity |
|----------|----------|-----------|
| Quick prototype | A (username/password) | Low |
| Best UX for admins | B ("Open Studio" button) | Medium (needs Magento module) |
| Same-domain deploy | C (shared cookie) | Medium (needs Magento observer) |
| Production with 2FA | B | Medium |

**For Oriental Weavers, Strategy B is recommended** — build a small Magento module that adds an "Open Studio" button to the admin panel. Admins click it, get auto-logged into Studio. No extra password entry, no 2FA issues.

## Logout: How Content Editors Sign Out

### Built-in Studio Logout (Inside the Editor)

Studio's editor UI has a **built-in logout button** (log-out icon) in the sidebar. When clicked, it calls:

```
DELETE /__nuxt_studio/auth/session
```

This clears the `studio-session` and `studio-session-check` cookies. The editor is immediately logged out and Studio deactivates. **No custom code needed** — this works automatically.

### Custom Logout Route (Outside the Editor)

Our custom logout API (`POST /api/studio/logout`) calls the same `clearStudioUserSession()` under the hood. Use it from:

- A "Sign out" link on the login page (for users who navigated there while authenticated)
- An external admin panel or dashboard

```ts
// From any client-side code:
await fetch('/api/studio/logout', { method: 'POST' })
window.location.href = '/_studio' // redirects to login form
```

### Logout + Magento Session Cleanup (Strategy B/C)

When using Magento Dashboard integration, you may want to also revoke the Magento admin token on Studio logout:

```ts
// server/plugins/studio-auth.ts — extend the logout hook
nitroApp.hooks.hook('studio:auth:logout', async ({ user }) => {
  console.log(`[Studio] Logout: ${user.email}`)

  // Optional: revoke the Magento admin token
  // This prevents the token from being reused if the shared cookie is still set
  if (user.accessToken && process.env.MAGENTO_BASE_URL) {
    // Magento doesn't have a REST logout — token expires naturally (4h default)
    // For Strategy C (shared cookie), clear the shared cookie:
    // deleteCookie(event, 'magento_admin_token', { domain: '.example.com' })
  }
})
```

### Summary of Logout Endpoints

| Endpoint | Method | Source | When to Use |
|----------|--------|--------|------------|
| `/__nuxt_studio/auth/session` | `DELETE` | Built-in (Studio) | Studio editor UI logout button |
| `/api/studio/logout` | `POST` | Custom (our code) | External logout trigger |

Both call `clearStudioUserSession()` internally — same result.

## Environment Variables

```bash
# Magento base URL (required for all strategies)
MAGENTO_BASE_URL=https://api.orientalweavers.com

# Studio Git backend (always required)
STUDIO_GITLAB_TOKEN=glpat-xxxxxxxxxxxxxxxxxxxx
```
