## 2026-05-02 - Focus Management in Game Loops

**Learning:** In fast-paced or repetitive game loops (like answering questions sequentially), maintaining focus on the primary input is critical for UX. Without explicit focus management, users may need to manually click or tab back to the input after each interaction, breaking the "flow" of the game.
**Action:** Use Svelte's `$effect` combined with `bind:ref` to programmatically restore focus to the main interaction element whenever the state (e.g., current question index) changes.

## 2026-05-02 - Semantic Context for Screen Readers

**Learning:** While `aria-live="polite"` helps announce content changes, it doesn't always provide sufficient context for form inputs that depend on that content.
**Action:** Use `aria-describedby` to explicitly link an input with its description (e.g., a game question or definition), ensuring screen reader users hear the context when the input is focused.
