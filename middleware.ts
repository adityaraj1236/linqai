// middleware.ts — ROOT mein rakho (app/ ke bahar, same level pe)

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Yeh routes protect honge — bina login ke access nahi milega
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/api/workflows(.*)',
  '/api/runs(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth();

    if (!userId) {
      // API request hai toh 401 return karo
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized — please sign in' }, { status: 401 });
      }
      // Page request hai toh sign-in pe redirect karo
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};