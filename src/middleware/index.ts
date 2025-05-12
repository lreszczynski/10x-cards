import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServerInstance } from '@/db/supabase.server';

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/auth/callback',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/reset-password',
  '/',
];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request, redirect } = context;

  console.log('Request path:', url.pathname);
  console.log('Request method:', request.method);

  // Skip auth check for public paths and all API routes
  if (PUBLIC_PATHS.includes(url.pathname) || url.pathname.startsWith('/api/')) {
    console.log('Skipping auth check for:', url.pathname);
    return next();
  }

  try {
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Auth error in middleware:', error);
    }

    if (!user && !PUBLIC_PATHS.includes(url.pathname)) {
      console.log('No user found, redirecting to login');
      return redirect('/auth/login');
    }

    // Make user and supabase available to all routes
    context.locals.supabase = supabase;
    context.locals.user = user;

    return next();
  } catch (err) {
    console.error('Middleware error:', err);
    return next();
  }
}); 