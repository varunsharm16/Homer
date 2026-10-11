# Homer

A calm, contemporary home editor built with React, Vite, React Three Fiber, Three.js and Zustand. The original procedural furniture library and server-side OpenAI routes are retained.

## Run

Use Node 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm run build
npm run lint
npm test
```

The editor works without credentials. Open http://localhost:5173. Optional AI uses a **server-only** `OPENAI_API_KEY` in `.env.local` or the deployment environment. `HOMER_AI_KEY` is also supported by local development. Restart after changing credentials. Never use a `VITE_` prefix for a secret. Vite development includes a local adapter for the existing edge routes; Vercel serves `api/` in deployment.

## Working editor

- Independent homes with unlimited UI-added floors, names and a floor-plan image per floor. New homes/floors start with an explicitly labeled example layout.
- Interactive 3D and overhead views; orbit, pan, zoom controls, camera reset. Walls, floor surfaces and furniture can be selected.
- Move, rotate and resize object gizmos, numeric position/rotation/scale controls, colors, procedural wood/tile/plaster/fabric finishes, object deletion, undo/redo.
- Wall-mounted art can be assigned to a wall and centered horizontally or vertically.
- Elastic scroll-to-floor navigation: resistance accumulates, release below threshold restores the floor, crossing the threshold changes one floor, and a cooldown rejects momentum. Grey minor ticks separate long floor ticks; the active white tick is at the viewport's vertical midpoint. Direct sidebar/rail floor selection and reduced-motion support are included.
- Click an uncovered floor location and choose **Explore from here**, or use **Walk through**. Drag for full horizontal looking and vertical pitch; WASD/arrows move; Escape or Back to editor exits. This is a free exploration camera, without collision detection.
- Search the local reference library across paint, furniture, appliances, accessories, decoration and surfaces. Retailer links and Google Shopping open externally. Illustrations and editable geometry are approximations, not retailer-provided models, stock or pricing.
- Import a product image/link, choose its approximate shape manually, and save its reference. Reference images are visible in Selection. No image-to-3D generation is claimed.
- Attach PNG/JPEG/WebP floor plans (up to 1 MB each). Overall width/depth measurements rescale current room/wall geometry and object positions. They do not trace an image.
- Responsive panels and keyboard-accessible controls. No login required.

## Persistence

Zustand persists projects in browser `localStorage` under `homer-editor-v1`. Export a home as JSON and restore through Your workspace → Import a home backup. Backups are validated before being accepted. Storage-full errors remain visible; export retains the latest in-memory changes.

This is appropriate for a single-device prototype. No database, account, cross-device synchronization or collaboration has been added. Browser storage has finite capacity and can be cleared by the browser/user. A database and object storage become appropriate when accounts, shared homes or larger image libraries are introduced.

## AI integration status

| Capability | Status |
| --- | --- |
| Geometry/object/material editing | Runs locally |
| Floor-plan attachment and manual scale | Runs locally |
| Product image/link reference + manual approximation | Runs locally |
| AI floor-plan tracing | Existing OpenAI route connected to editor; needs a server API key and model access |
| Natural-language object/material edits | Existing OpenAI route connected; needs a server API key and model access |
| Product image → reconstructed 3D asset | Not connected; needs an external modeling service |
| Automatic retailer search/scraping/import | Not connected; current links open retailer/search pages |
| User-funded ChatGPT authorization | Not connected; commercial partner access must be confirmed |
| Cross-floor scale/alignment/staircase compatibility | Deferred |

`GET /api/status` reports credential configuration, not a successful live-model test. Missing credentials return 503. Non-JSON static-host responses, malformed/empty geometry and unsupported operations are rejected. AI results show a geometry preview and summary before explicit application; edits can be undone. Proposals cannot overwrite a floor changed since the request. The UI does not substitute demo geometry when a service fails.

Floor-plan route output uses **feet**; the editor validates and converts it to **meters** and recenters its origin. The current renderer handles rectangular rooms and continuous walls. Detected door/window openings are not cut into the walls. They, staircase positions, ambiguous dimensions and floor alignment require review. Floor-plan analysis replaces the selected floor's geometry and objects after review. Scene commands receive meters and support validated add/remove-object and material operations.

API requests currently use the application's server key and its billing. Before making these unauthenticated paid routes publicly available, introduce access controls, quotas/rate limits and spending controls. Authentication can remain deferred for local editing. An owner-only static preview is deployed at https://homer-studio-preview-a12c88.lilacpear64.chatgpt.site. Its server AI routes are not deployed; they remain available in local development and a configured Vercel deployment. No user billing connection was performed.

## User-funded AI research

Checked official OpenAI help documentation on 2026-10-11:

- [Using your ChatGPT plan in other apps and sites](https://help.openai.com/en/articles/20001542-using-your-chatgpt-plan-in-other-apps-and-sites): participating commercial apps can separately request permission to use eligible Go/Plus/Pro plan usage. Users can set app usage limits; credit use is a separate opt-in. This flow does not require users to share API keys. Commercial integration launched with limited partners and requires the interest/partner process.
- [Sign in with ChatGPT](https://help.openai.com/en/articles/20001410-sign-in-with-chatgpt): identity sign-in and permission to use plan usage are separate. Identity authorization alone does not grant billing/usage access.
- [API usage and ChatGPT subscriptions](https://help.openai.com/en/articles/8156019-is-api-usage-included-in-chatgpt-subscriptions): ordinary API service billing is separate from ChatGPT billing.

This is a promising eventual path, **not a confirmed entitlement for Homer**. Confirm commercial eligibility, developer registration/authorization requirements, vision/model capabilities and usage accounting before choosing an implementation. Do not reuse undocumented Codex authorization endpoints or assume arbitrary API calls can be charged to a signed-in ChatGPT user. No browser API-key collection has been introduced.

## Later floor compatibility work

Compare each floor in a common meter-based coordinate system, with a known origin, orientation and reference measurement. Today imported floors are centered independently; that is useful for editing but does not guarantee correct building alignment. Future work should preserve source transforms, compare footprints and floor heights, match staircase start/end locations across adjacent floors, and flag inconsistent scale or unsupported connections before stacking the house.

## Verification

`npm test` covers unit conversion, invalid/empty geometry rejection, atomic AI edit validation, malformed backup rejection, static-host HTML handling and explicit missing-credential responses. Browser checks cover object editing, undo/redo, wall centering, floor switching and alignment, walkthrough exit, home isolation, plan imports, local persistence, product links, reduced motion and mobile layout. Successful AI responses in browser verification use fixtures; live OpenAI generation and paid billing have not been verified.
