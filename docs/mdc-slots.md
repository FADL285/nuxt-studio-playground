# MDC Slots: Define & Use

How to **define** slots in Vue components used by MDC and how to **fill** them in Markdown.

Nuxt Content (via `@nuxtjs/mdc`) provides **`<MDCSlot>`** (sometimes exposed as `<ContentSlot>`): bind a slot with `:use="$slots.default"` or `:use="$slots.title"` and use `unwrap="p"` to remove Markdown’s `<p>` wrapper.

## 1. In the Vue component (define slots)

Put the component in `app/components/content/` so it’s available in MDC.

### Default slot only

```vue
<!-- app/components/content/Callout.vue -->
<template>
  <div class="callout rounded-lg border p-4">
    <MDCSlot :use="$slots.default" unwrap="p" />
  </div>
</template>
```

- `:use="$slots.default"` binds the default slot content from MDC.
- `unwrap="p"` strips the `<p>` tag Markdown adds around the content.

### Named slots

Use `:use="$slots.slotName"` for each named slot. Example: optional `title` + default body.

```vue
<!-- app/components/content/Callout.vue -->
<template>
  <div class="callout rounded-lg border p-4">
    <h3 v-if="$slots.title" class="font-semibold mb-2">
      <MDCSlot :use="$slots.title" unwrap="p" />
    </h3>
    <MDCSlot :use="$slots.default" unwrap="p" />
  </div>
</template>
```

## 2. In the Markdown file (use slots)

Use a **block** component with `::ComponentName` … `::`. Inside the block:

- **Default slot**: content at the top of the block, or explicitly under `#default`.
- **Named slot**: a line starting with `#slotname` (e.g. `#title`), then the content for that slot. The next `#slotname` or `::` ends it.

### Example: default slot only

```mdc
::callout
This is the **default slot** content. It can be Markdown.
::
```

### Example: default + named slot

```mdc
::callout
#title
Please be careful!

#default
Using MDC & Vue components is addictive.
::
```

Order of `#title` and `#default` in the file doesn’t change which slot they fill; the **name** (`#title` vs `#default`) decides.

### Example: with props (optional)

```mdc
::callout{type="warning"}
#title
Warning

#default
Do not skip this step.
::
```

## 3. Summary

| Where        | What |
|-------------|------|
| **Vue (define)** | `<MDCSlot :use="$slots.default" unwrap="p" />` or `:use="$slots.title"` for named slots. |
| **Markdown (use)** | `::ComponentName` … `::`. Default slot = content under `#default` or at top level. Named slot = line `#slotname` then content. |

## 4. Adding slots when editing in Nuxt Studio

**TipTap** (WYSIWYG) does not preserve raw MDC syntax like `#title` and `#default`. To edit content with named slots:

1. **Switch to Monaco in Studio** – If your `.md` file opens in TipTap, use the editor switcher in Studio to open it in Monaco (raw markdown).

2. **Edit the raw MDC** – In Monaco, add or change slot content:

   ```mdc
   ::callout{type="info"}
   #title
   Your title here

   #default
   Your body here.
   ::
   ```

3. **Alternative** – Edit the file directly in your repo (e.g. `content/en/showcase.md`) and commit changes.

## References

- [Nuxt Content – Slot component](https://content.nuxt.com/docs/components/slot)
- [Nuxt Content – Markdown (MDC syntax)](https://content.nuxt.com/docs/files/markdown)
