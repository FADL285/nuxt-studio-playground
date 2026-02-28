interface StudioAuthUser {
  email: string
}

export default defineNitroPlugin((nitroApp) => {
  // nuxt-studio custom hooks - not in NitroRuntimeHooks
  // @ts-expect-error studio:auth hooks are provided by nuxt-studio at runtime
  nitroApp.hooks.hook('studio:auth:login', (payload: { user: StudioAuthUser }) => {
    console.log(`[Studio] Login: ${payload.user.email} at ${new Date().toISOString()}`)
  })

  // @ts-expect-error studio:auth hooks are provided by nuxt-studio at runtime
  nitroApp.hooks.hook('studio:auth:logout', (payload: { user: StudioAuthUser }) => {
    console.log(`[Studio] Logout: ${payload.user.email} at ${new Date().toISOString()}`)
  })
})
