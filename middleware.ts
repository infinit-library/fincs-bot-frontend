import { NextResponse, type NextRequest } from 'next/server';

const username = process.env.BASIC_AUTH_USER;
const password = process.env.BASIC_AUTH_PASS;

function unauthorized() {
  return new NextResponse('Auth required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="FincsOps"' },
  });
}

export function middleware(request: NextRequest) {
  if (!username || !password) return NextResponse.next();

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Basic ')) return unauthorized();

  const base64 = authHeader.replace('Basic ', '');
  const decoded = atob(base64);
  const [user, pass] = decoded.split(':');

  if (user === username && pass === password) return NextResponse.next();
  return unauthorized();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
