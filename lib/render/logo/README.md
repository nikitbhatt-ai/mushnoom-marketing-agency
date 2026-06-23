# Brand artwork for rendered posts

Drop the Mushnoom brand files here and the renderer places them on every post
automatically — no code changes needed (see `../logo.ts`).

| Filename | What it is | Where it shows |
|----------|------------|----------------|
| `mushnoom-logo.png` (or `.svg`) | the **white** wordmark | header, top of every page |
| `mushnoom-icon.png` (or `.svg`) | the **white** icon mark | bottom-right corner |

Notes:
- Use the **white / light** versions — they sit on the dark Black Olive
  (`#262E29`) background. The Green Gray and Black Olive versions would vanish.
- `.svg` is sharper at any size and takes priority over `.png` if both exist.
- Until a file is added, posts fall back to the plain-text "mushnoom" wordmark
  and simply omit the corner icon.
