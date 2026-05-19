import { NextResponse } from 'next/server';

const REDIRECT_TARGET = 'https://vs-furniture.ae/';

const SOURCE_HOSTS = new Set([
  'vsme.ae',
  'www.vsme.ae',
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname !== '/') {
    return NextResponse.next();
  }

  const host = (request.headers.get('host') || '').toLowerCase();

  if (!SOURCE_HOSTS.has(host)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(REDIRECT_TARGET, 307);
}

export const config = {
  matcher: ['/'],
};
