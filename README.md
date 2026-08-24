# Pomodoro Timer

A clean, single-page Pomodoro timer with Focus / Short Break / Long Break modes, multi-language support, and multiple themes.  
**Product by Tonder Tech · v1.0**

## Features

- **Modes**
  - Focus (default 25 min)
  - Short Break (default 5 min)
  - Long Break (default 15 min)
  - Configurable long-break interval (every N focus sessions)
- **Progress ring** with smooth countdown
- **Stats** – completed sessions, total focus minutes, daily streak (persisted)
- **Auto-start** next session option
- **4 themes** – Dark, Light, Black (OLED), Green
- **3 languages** – English, فارسی (Persian), العربية (Arabic) — with full RTL support
- Settings and stats persist in the browser (`localStorage`)
- Keyboard shortcuts: Space (start/pause), R (reset), S (skip)
- Optional browser notifications + subtle beep on session end
- **PWA / mobile** – installable on Android & iOS (Add to Home Screen), works offline
- Compact Tonder Tech branding + logo in footer

## Mobile install (PWA)

1. Serve the folder over **HTTPS** (or `localhost`).
2. Open in Chrome / Safari / Edge on your phone.
3. **Android (Chrome):** menu → “Install app” or “Add to Home screen”.
4. **iOS (Safari):** Share → “Add to Home Screen”.

The app runs in standalone mode with its own icon.

## Tech stack

- Vanilla HTML, CSS, and JavaScript
- Web App Manifest + Service Worker (offline cache)
- No frameworks, no build step
- CSS custom properties for theming
- Simple i18n object for translations

## How to run

Open `index.html` in any modern browser, or serve locally:

```bash
python -m http.server 8080
# or
npx serve .
```

Then visit `http://localhost:8080`.

## Project structure

```
pomodoro/
├── index.html
├── style.css
├── app.js
├── manifest.json
├── sw.js
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── logo.png
│   └── logo-footer.png
└── README.md
```

## Storage

- Settings (language, theme, durations, auto-start): `pomodoro-settings`
- Stats (sessions, focus minutes, streak): `pomodoro-stats`

## License

MIT – free to use and modify.

© 2026 Tondar Tech. All rights reserved.
