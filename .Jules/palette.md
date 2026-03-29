## 2024-05-24 - Screen Readers and Non-Interactive Elements

**Learning:** Screen readers often ignore `aria-label` attributes when they are applied to non-interactive, generic elements like `<div>` or `<span>`. When we want to provide an accessible label for a visual element without an intrinsic role, `aria-label` might be silently ignored.
**Action:** When adding accessible text to visual elements, either give the element a semantic tag or role (like `<ul>` / `<li>` or `role="list"` / `role="listitem"`), or use a combination of `aria-hidden="true"` on the visual element alongside a visually hidden `<span class="sr-only">` element containing the readable text.
