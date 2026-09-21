# Album Templates

This folder is **populated at runtime by the Photoshop agent** — the first
`CREATE_ALBUM` job (or `npm run selftest`-style template build) generates, for
every album page:

- `<templateKey>.psd` — the page design built in **Adobe Photoshop 2022**:
  - `DESIGN` group: `Background`, `Flowers`, `Light Effects`, `Frames`, `Decorations`
  - `PHOTOS` group: `PHOTO 01`…`PHOTO 06` **Smart Object** layers
  - `TEXT` group: `TEXT_NAMES`, `TEXT_DATE`, `TEXT_LOCATION`, `TEXT_CAPTION`, `TEXT_TITLE`
- `<templateKey>.json` — the layout spec (slot pixel rects + layer names) used
  to replace Smart Object contents without redesigning the page.

## Using your own designs

Drop your own PSD files here using the same layer/group names and a matching
`<templateKey>.json` spec, and the agent will use them as-is. The generated
defaults are deliberately elegant and minimal — they are real, editable
Photoshop documents, not images baked by the web app.

The web app's Templates page previews the **layout geometry** (from
`packages/config/src/layouts.ts`), which is the same geometry used here.
