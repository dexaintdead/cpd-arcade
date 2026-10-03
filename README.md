# ContentPad Arcade — arcade.contentpad.io

Static site (GitHub Pages). No build step, no new database tables.

- `index.html` — front page (featured game, Play now, Coming soon, Make a game)
- `play.html?g=<slug>` — the player page (game in a sandboxed frame, full screen, share, your best score)
- `games.js` — the catalog. Add a game = add an entry + a `<slug>.html` file at the top level
- `skyline-dash.html` — Maverick: Skyline Dash (house game #1)
- `arcade.css` — shared styles

Game art and music live in Dex's ContentPad Vault. Sprites load through `link.contentpad.io/dl`
(ContentPad-only hosts, CORS-enabled) because the game cuts the green screen out in the browser.

Rule: member-submitted games will run on a SEPARATE origin (never this one, never app.contentpad.io).
