# AslLive

Mobile-first social and live commerce starter for Uzbekistan and cross-border sellers. Posts are captured in-app; post creation intentionally has no gallery/file upload control. Stack: Next.js 15, TypeScript, Tailwind, Supabase, LiveKit.

## Run locally

1. Install Node.js 20+ and create a Supabase project.
2. Copy `.env.example` to `.env.local`; set the Supabase URL and anon key. Add the service-role key only for the server-side order endpoint. Keep it secret.
3. Run `supabase/schema.sql` in the Supabase SQL Editor.
4. Configure Supabase Auth email redirect URL to `http://localhost:3000/auth/callback`.
5. `npm install && npm run dev`, then open http://localhost:3000. Camera access requires HTTPS except localhost.
6. For live streaming, configure LiveKit env vars. Without them the room explains that streaming is not configured.

## Implemented MVP paths

- `/`, `/explore`, `/create`, `/orders`, `/profile`, `/profile/products`, `/auth`
- `/live/[roomName]`: LiveKit room, chat via Supabase Realtime, seller pin-product selector.
- `POST /api/orders`: server validates product, seller, stock, minimum quantity and current price before recording a guest or logged-in order. Requires `SUPABASE_SERVICE_ROLE_KEY`.
- `POST /api/live/token`: authenticated seller/viewer LiveKit access token.
- Camera snapshots are resized to max 1080px and JPEG quality 0.72 before Storage upload. Video uses camera MediaRecorder; the client never reads a gallery file.

## Important production setup

- Add Supabase Auth email templates, allowed redirect URLs, and production HTTPS origins.
- Confirm policies and guest-order privacy against your operational requirements. Guest order creation is routed through a server endpoint; protect it with rate limiting/CAPTCHA before public launch.
- LiveKit token route checks Supabase auth and seller ownership for publishing. Configure LiveKit Cloud/self-hosted credentials and test Safari device support.
- Supabase Storage bucket is public-read by design for feed media. Use moderation, retention controls, abuse reporting, backups and legal/privacy notices before launch.
- This is an MVP foundation, not a payment processor or fulfillment system. Orders are requests; sellers confirm and arrange payment/delivery externally.
