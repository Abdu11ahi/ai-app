# AI App

A modern Next.js 14 application built with TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- shadcn/ui components
- Supabase Authentication with Social Providers (Google, Apple, GitHub)
- Vercel deployment ready

## Getting Started

### Development

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
# or
bun build
```

## Setting Up OAuth Providers in Supabase

To enable social login with Google, Apple, and GitHub, you need to configure these providers in your Supabase project:

1. Go to your Supabase dashboard: https://app.supabase.com/
2. Select your project
3. Navigate to Authentication → Providers
4. Enable and configure each provider:

### Google OAuth Setup
1. Enable Google provider in Supabase
2. Create a Google Cloud project: https://console.cloud.google.com/
3. Set up OAuth consent screen
4. Create OAuth credentials (Web application type)
5. Add authorized redirect URI: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
6. Copy the Client ID and Client Secret to Supabase

### Apple OAuth Setup
1. Enable Apple provider in Supabase
2. Create an App ID in the Apple Developer portal
3. Add the "Sign in with Apple" capability
4. Create a Services ID with the "Sign in with Apple" enabled
5. Set up your domain and callback URL: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
6. Generate a key and download it
7. Copy the necessary credentials to Supabase

### GitHub OAuth Setup
1. Enable GitHub provider in Supabase
2. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
3. Set Homepage URL to your app's URL
4. Set Authorization callback URL to: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret to Supabase

## Deploying to Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

Steps to deploy:

1. Push your code to a GitHub repository
2. Import your repository to Vercel: https://vercel.com/new
3. Vercel will automatically detect that you're using Next.js and will set up the optimal build settings for you.
4. Your application will be deployed and available at a unique URL immediately.

Alternatively, you can deploy directly from the command line:

```bash
npm i -g vercel
vercel
```

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
