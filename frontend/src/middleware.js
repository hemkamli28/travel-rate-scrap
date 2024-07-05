import { NextResponse } from 'next/server';

export function middleware(request) {
  const accessToken = request.cookies.get('access-token');

  console.log('fromMiddleware', !!accessToken);

  if (!accessToken && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (accessToken && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard, /history'],
};
