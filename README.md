# RetroCode Studio — Standalone

A Windows 95-styled, in-browser HTML/CSS/JS editor with live preview, DOM inspector, e-reader mode, and security toggles. **No build step, no dependencies, no framework** — just plain HTML, CSS, and JavaScript.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Entry document; loads the scripts in order |
| `styles.css` | Windows 95 theme + app layout |
| `w95.js` | UI helpers (buttons, menus, status bar, title bars) |
| `explorer.js` | File explorer panel |
| `editor.js` | Three-pane code editor (HTML / CSS / JS) |
| `preview.js` | Live preview iframe + document builder |
| `inspector.js` | DOM tree inspector |
| `reader.js` | E-reader mode (themes, font sizing, text-to-speech) |
| `outline.js` | Heading outline / table of contents |
| `app.js` | Main orchestration & state |

## Run

Open `index.html` in any modern browser. No server required.

## Features

- Three-pane editor (HTML, CSS, JavaScript) with line numbers
- Live preview in a sandboxed iframe
- JavaScript kill-switch and network isolation (CSP) toggles
- Responsive viewport sizes (desktop / tablet / mobile)
- DOM tree inspector
- E-reader mode with dark, sepia, cyberpunk, and default themes
- Heading outline / table of contents
- Asset extraction (images, inline styles, scripts, stylesheet links)
- Open local files, save as HTML, open in `about:blank`
- Full keyboard shortcuts (Ctrl+N / O / S)

## Deploy to GitHub Pages

1. Create a new repository and push all the files above to it.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*.
4. Choose the `main` (or `master`) branch and the `/ (root)` folder.
5. Save. Your studio will be live at `https://<your-username>.github.io/<repo-name>/`.