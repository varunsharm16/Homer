# Homer

Homer helps families and couples turn home ideas and floor plans into editable 3D spaces. The React / Three.js app is in [`3d-home-designer`](./3d-home-designer).

```sh
cd 3d-home-designer
npm install
npm run dev
```

The local editor includes independent homes and floors, 3D object editing, material controls, elastic floor navigation, first-person exploration, product references and browser-local saving with JSON backups. AI floor-plan tracing and natural-language editing need configured server-side OpenAI access; image-to-3D generation and user-funded authorization are not connected.

See the [app README](./3d-home-designer/README.md) for actual integration status, persistence, verification, deployment requirements and the current OpenAI authorization/billing research.

An [owner-only hosted preview](https://homer-studio-preview-a12c88.lilacpear64.chatgpt.site) is available for browser review. It includes the local editor and saving; server AI routes are not deployed on this preview.
