# PeerFit

![Deployment](https://img.shields.io/badge/Deployment-Coming%20Soon-lightgrey)

PeerFit is a social sports app for finding people to play with, joining local activities, and staying active through community. It is built with Next.js and Supabase, with a mobile-friendly interface for browsing sessions, managing friends, and tracking your activity.

## Features

- Landing page with PeerFit branding, product messaging, and activity previews.
- Email auth flow with sign up, login, forgot password, reset password, and callback handling.
- Activity feed with search, filters, likes, saves, comments, and live activity states.
- Create, edit, delete, and join activities with public or private visibility.
- Join request flow for private activities with host approval controls.
- Friends system with incoming requests, sent requests, and accepted connections.
- Calendar-based activities view for upcoming sessions and joined events.
- Profile pages with sports, stats, achievements, reviews, and avatar uploads.
- Settings page and theme support.

## How It Works

1. Create an account and set up your profile.
2. Browse the feed to find sports activities near you.
3. Join a public session instantly or request access to a private one.
4. Create your own activity and invite others to join.
5. Build your network through friend requests, shared sessions, and reviews.

## Tech Stack

- Next.js 15
- React 18
- TypeScript
- Supabase
- Tailwind CSS 4
- Radix UI
- Lucide React

## Development

From the project folder:

```bash
npm install
npm run dev
```

Production commands:

```bash
npm run build
npm run start
```

## Project Structure

- `app/` - app routes, pages, auth flows, and global styles
- `components/` - shared UI, navigation, and calendar components
- `lib/` - Supabase clients and utility helpers
- `public/` - static assets including the PeerFit logo
- `styles/` - additional styling assets

## Notes

- PeerFit is not deployed publicly yet, but deployment is planned soon.
- The app uses Supabase for authentication, storage, and app data.
- `node_modules/` and `.next/` are local generated folders and not part of the product source.
