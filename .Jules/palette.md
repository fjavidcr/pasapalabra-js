## 2026-03-22 - Semantics for non-interactive elements

**Learning:** Screen readers may ignore `aria-label` and `aria-current` attributes on generic, non-interactive tags like `<div>`. To ensure they are read out, you must provide a semantic context such as `role="list"` for the parent and `role="listitem"` for the children.
**Action:** Use semantic HTML elements (like `<ul>` and `<li>`) or ARIA roles (`role="list"`, `role="listitem"`) when adding labels or current indicators to non-interactive containers.
