import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Note: Domain redirects (non-www → www) are handled in next.config.mjs
  // HTTPS is automatically enforced by Vercel
  
  // Check if coming soon mode is enabled
  const isComingSoon = process.env.COMING_SOON === "true";
  
  // Public paths that don't require authentication (even in coming soon mode)
  const publicPaths = [
    '/api/auth',
    '/api/coming-soon',
    '/api/health',
    '/_next',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ];
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // If coming soon is enabled and this is not a public path, require authentication
  if (isComingSoon && !isPublicPath) {
    // Check for auth token in cookies
    const sessionToken = request.cookies.get('next-auth.session-token') || 
                         request.cookies.get('__Secure-next-auth.session-token');
    
    // If no session token, redirect to home which will show sign in modal
    if (!sessionToken && pathname !== '/') {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  // Security: Add rate limiting headers (basic implementation)
  const response = NextResponse.next();
  
  // Add custom security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  // CORS for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  }
  
  // Performance: Prefetch DNS for external domains
  response.headers.set('Link', '</fonts.googleapis.com>; rel=dns-prefetch, </fonts.gstatic.com>; rel=dns-prefetch');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

