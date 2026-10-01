# BioMika

PWA personal para seguimiento de composición corporal y bienestar. Datos solo en el dispositivo (IndexedDB / Dexie).

## Desarrollo

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite (ruta base `/BioMika/`).

## Build y GitHub Pages

```bash
npm run build
npm run preview
```

**Producción (GitHub Pages):** cada push a `main` despliega con Actions.

- URL: https://neaf1988.github.io/BioMika/
- Workflow: `.github/workflows/deploy-pages.yml`
- En el repo: **Settings → Pages → Source: GitHub Actions** (si no se activó solo)

La base `/BioMika/` está en `vite.config.ts`.

## Tests

```bash
npm test
```

## Especificación

Ver carpeta `Specs/`.
