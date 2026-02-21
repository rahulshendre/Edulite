# EduLite

Offline-first learning PWA with Study and School flows.

## Regional language (translation)

Content is in English by default. If the device language is a supported regional language (e.g. Hindi, Marathi, Tamil), packet content is translated via RapidAPI Google Translate and cached in IndexedDB for offline use. Read-aloud (TTS) uses the same locale.

**Setup:** Copy `.env.example` to `.env` and set your RapidAPI key and host (from your [RapidAPI](https://rapidapi.com) Google Translate subscription). Without these, the app runs in English only.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
