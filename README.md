# PeerFit

![Deployment](https://img.shields.io/badge/Live-peerfit.co.uk-emerald?style=flat&color=16a34a)
![Stack](https://img.shields.io/badge/Stack-Next.js%20%2B%20Supabase-black)

**[peerfit.co.uk](https://www.peerfit.co.uk)** — Find people. Play sports. Stay active.

PeerFit is a social sports platform for finding local players, joining activities, and building a community around sport. Built with Next.js and Supabase, with a fully responsive interface for browsing sessions, managing friends, and tracking your activity history.

## Features

- Scroll-snapping landing page with sport imagery, how-it-works, and community sections
- Email auth flow — sign up, login, forgot password, reset password, and callback handling
- Activity feed with search, filters, likes, saves, comments, and live activity states
- Create, edit, and delete activities with public or private visibility
- Join request flow for private activities with host approval controls
- Friends system with incoming requests, sent requests, and accepted connections
- Calendar view of upcoming sessions and joined events
- Profile pages with sports, stats, achievements, reviews, and avatar uploads
- Notifications for friend requests and join approvals
- Settings page with light/dark theme support

## How It Works

1. Create an account and set up your profile
2. Browse the feed to find sports activities near you
3. Join a public session instantly or request access to a private one
4. Create your own activity and invite others to join
5. Build your network through friend requests, shared sessions, and reviews

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Supabase (auth, database, storage)
- Tailwind CSS 4
- Radix UI
- Lucide React

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run start
```

## Project Structure

- `app/` — routes, pages, auth flows, and global styles
- `components/` — shared UI, navigation, and calendar components
- `lib/` — Supabase clients and utility helpers
- `public/` — static assets including sport images and the PeerFit logo

## Deployment

Deployed on [Vercel](https://vercel.com) at **[peerfit.co.uk](https://www.peerfit.co.uk)**.

Every push to `main` triggers an automatic production deployment.
