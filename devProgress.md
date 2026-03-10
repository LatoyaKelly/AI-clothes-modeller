# AI Clothes Modeller — Development Progress

## Architecture
- **Frontend**: Next.js + React + Tailwind CSS, static export
- **AI Backend**: Hugging Face Space `yisol/IDM-VTON` via `@gradio/client` (browser → WebSocket)
- **Hosting**: Vercel (free tier)
- **Cost**: $0
- **Live URL**: https://ai-clothes-modeller.vercel.app
- **GitHub**: https://github.com/LatoyaKelly/AI-clothes-modeller

## Phases

### Phase 1: Scaffold — DONE
- [x] Initialize npm project with Next.js, React, TypeScript, Tailwind
- [x] Install `@gradio/client`
- [x] Configure `next.config.js` with `output: 'export'` and `images: { unoptimized: true }`
- [x] Create `staticwebapp.config.json` with navigation fallback and CSP headers

### Phase 2: Utilities — DONE
- [x] `src/lib/image-utils.ts` — `resizeImage()` (canvas → JPEG 0.9, max 1024px) and `validateImage()` (type + size checks)
- [x] `src/lib/gradio-client.ts` — Singleton `Client.connect()` with 3 retries (10s/20s/40s backoff)

### Phase 3: Core Hook — DONE
- [x] `src/hooks/useTryOn.ts` — Submits to `/tryon` with ImageEditor format, streams status events, 120s timeout, cancel support

### Phase 4: UI Components — DONE
- [x] `src/components/ImageUploader.tsx` — Drag-and-drop, click to browse, mobile camera capture, preview
- [x] `src/components/TryOnButton.tsx` — Submit with disabled state, cancel during processing
- [x] `src/components/ProgressIndicator.tsx` — 4-step visual: Connecting → In Queue → Processing → Done
- [x] `src/components/ResultDisplay.tsx` — Result image with Download and Try Another buttons
- [x] `src/components/ErrorBanner.tsx` — Dismissible error with categorized messages and retry
- [x] `src/components/Header.tsx` — App title and description

### Phase 5: Main Page — DONE
- [x] `src/app/page.tsx` — Three-column desktop layout (Person | Garment | Result), stacked on mobile
- [x] `src/app/layout.tsx` — Root layout with metadata
- [x] `src/app/globals.css` — Tailwind import

### Phase 6: Deployment — DONE
- [x] Create GitHub repo and push code (`LatoyaKelly/AI-clothes-modeller`)
- [x] Deploy to Vercel (switched from Azure SWA for simplicity)
- [x] Production URL live: https://ai-clothes-modeller.vercel.app
- [ ] Test end-to-end with real images on live URL

## Build Status
- `npm run build` — Passing (output: 1MB in `out/`)
- `npm run dev` — Passing (200 OK on localhost:3333)
- Vercel production build — Passing (deployed in 38s)

## Deployment
- **Platform**: Vercel (free Hobby plan)
- **Redeploy**: `vercel --prod` from project root
- **Vercel project**: `lkellys-projects/ai-clothes-modeller`
- Azure SWA workflow file kept in `.github/workflows/` as alternative option

## Key Technical Decisions
- Person image sent in ImageEditor format: `{ background: handle_file(blob), layers: [], composite: null }`
- API params: `[editorData, garmentHandle, "A garment", true, true, 30, 42]` (auto-mask, auto-crop, 30 denoise steps, seed 42)
- Client-side resize before upload to keep payloads small
- Gradio `submit()` (not `predict()`) for streaming queue/progress events

## Known Risks
- ImageEditor parameter format may need adjustment if HF Space API changes
- Free HF Spaces can sleep after inactivity (handled with retry + backoff)
- Queue times vary based on demand

## Testing Checklist
- [ ] Upload person photo + garment → get result
- [ ] Test with upper body garment
- [ ] Test with full dress
- [ ] Test on mobile browser
- [ ] Verify no CSP violations in console on Vercel deploy
- [ ] Test error states: offline, timeout, invalid image format
