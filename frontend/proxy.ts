import { NextRequest, NextResponse } from 'next/server';

// Публичные маршруты, которые не требуют аутентификации
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/verify-registration',
  '/forgot-password',
  '/verify-reset',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропустить проверку для публичных маршрутов и статических файлов
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  // Получить токен из cookies
  const token = request.cookies.get('auth_token')?.value;

  // Если токена нет, перенаправить на логин
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Указать, на каких маршрутах применять middleware
export const config = {
  matcher: [
    /*
     * Применить middleware на все маршруты кроме:
     * - api (API маршруты)
     * - _next/static (статические файлы)
     * - _next/image (оптимизированные изображения)
     * - favicon.ico (favicon файл)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
