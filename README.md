# slop-police-kubk-pet-projects

Opinionated [slop-police](https://github.com/kubk/slop-police) rules shared across my pet projects.

## Principles

- **Catch what agents write.** Each rule targets a pattern AI agents keep adding: `as any`, aria attributes, `cn()` around a single string, pixel sizes.
- **Run in slop-police, not in oxlint JS plugins.** As soon as its config loads a JS plugin, oxlint reserves 6 GiB of address space per thread and aborts on machines with less RAM plus swap ([oxc#20331](https://github.com/oxc-project/oxc/issues/20331)).

## Install

```sh
pnpm add -D slop-police slop-police-kubk-pet-projects
```

Load the plugin in `slop-police.json` and turn on the rules the project wants. Plugin rules stay off until they're listed in `rules`:

```json
{
  "projects": ["tsconfig.json"],
  "plugins": ["slop-police-kubk-pet-projects"],
  "rules": {
    "no-any-assertion": "error",
    "no-aria-attributes": "error",
    "no-redundant-cn": "error"
  }
}
```

A project's own rules go in another plugin next to this one: `"plugins": ["slop-police-kubk-pet-projects", "./tools/slop-police/rules.ts"]`. Requires slop-police 0.3.19 or later.

## Rules

### no-any-assertion

An assertion to `any`.

```ts
const user = response as any;
const user = <any>response;
```

### no-aria-attributes

An `aria-*` attribute in JSX. Agents add aria attributes without hearing what they do, and bad aria is worse than none: an `aria-label` replaces the visible text, and `aria-live` interrupts with every update. Native elements already give screen readers what they need. Accessibility needs its own testing session with VoiceOver.

```tsx
<button aria-label="Close" onClick={close} />
```

### no-redundant-cn

A `cn()` call with a single string or template, which has nothing to merge.

```tsx
<div className={cn("flex gap-2")} />
```

### no-px-lengths

A length over 2px in a string or template, a `size` prop or an `svg` `width` or `height` over 2, or a length in a `style` object. Pixel sizes don't follow the app's text size setting. Lengths up to 2px (borders, outlines) and media queries are allowed.

```tsx
<div className="mt-[12px]" />
<ChevronIcon size={16} />
<div style={{ width: 24 }} />
```

Made for apps with a text size setting, so turn it on only there. Option: `onlyIn`, a path prefix relative to `slop-police.json` (default: every file).

```json
"no-px-lengths": ["error", { "onlyIn": "packages/frontend/src/" }]
```
