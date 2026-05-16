/* // middleware.ts (project root)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

// Do NOT include '/' here, or everything becomes public
const PUBLIC = ['/login', '/admin/login', '/schools/login']
// Exact match only
const isPublic = (p: string) => PUBLIC.includes(p)

async function getRole(req: NextRequest): Promise<'admin'|'school'|null> {
  const t = req.cookies.get('token')?.value
  if (!t) return null
  try {
    const { payload } = await jwtVerify(t, secret)
    return (payload.role as any) ?? null
  } catch { return null }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  if (isPublic(pathname)) return NextResponse.next()

  const role = await getRole(req)
  const inAdmin = pathname.startsWith('/admin')

  // Only admins can access /admin/**
  if (inAdmin) {
    if (role === 'admin') return NextResponse.next()
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + search)}`
    return NextResponse.redirect(url)
  }

  // Admins cannot access non-admin routes (e.g., /settings)
  if (role === 'admin') {
    const url = req.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // Non-admins proceed for non-admin pages
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} */


// middleware.ts 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

const PUBLIC = ['/login', '/admin/login', '/schools/login'];
const isPublic = (p: string) => PUBLIC.includes(p);

async function getRole(req: NextRequest): Promise<'admin' | 'school' | null> {
  const t = req.cookies.get('token')?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret, { algorithms: ['HS256'] });
    return payload.role as 'admin' | 'school' ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (req.headers.get('x-middleware-subrequest')) {
    return new NextResponse('Forbidden', { status: 403 });
  }
  // Public routes
  if (isPublic(pathname)) {
    const res = NextResponse.next();
    addSecurityHeaders(res);
    return res;
  }

  const role = await getRole(req);

  // ADMIN ROUTES: /admin/*
  if (pathname.startsWith('/admin')) {
    if (role === 'admin') {
      const res = NextResponse.next();
      addSecurityHeaders(res);
      return res;
    }
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    return NextResponse.redirect(url);
  }

  // SCHOOL ROUTES: /dashboard, /students, /teachers, /classes, etc.
  const schoolPaths = ['/dashboard', '/students', '/teachers', '/classes', '/levels', '/tasks', "/add"];
  const isSchoolPath = schoolPaths.some(path => pathname.startsWith(path));

  if (isSchoolPath) {
    if (role === 'school') {
      const res = NextResponse.next();
      addSecurityHeaders(res);
      return res;
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login'; // School login
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  // Admins can't access school routes
  if (role === 'admin') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/dashboard';
    return NextResponse.redirect(url);
  }

  // Default redirect
  const url = req.nextUrl.clone();
  url.pathname = '/login';
  return NextResponse.redirect(url);
}

//  CSP + Security Headers
function addSecurityHeaders(res: NextResponse) {
  res.headers.set('Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: blob: https://*.s3.amazonaws.com https://*.amazonaws.com; " +
    "font-src 'self' data:; " +
    "connect-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'self'; " +
    "upgrade-insecure-requests;"
  );
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

