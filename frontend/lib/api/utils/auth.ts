import { cookies } from 'next/headers';

import { jwtDecode } from 'jwt-decode';
const TOKEN_KEY = 'auth_token';
const FALLBACK_MAX_AGE_SECONDS = 3 * 60 * 60;

interface DecodedJwtPayload {
  exp?: number;
}

export interface AuthToken {
  accessToken: string;
  expiresAt: number;
}

/**
 * Сохранить JWT токен в cookies на сервере
 */
export async function setAuthToken(token: string) {
  // Если не удалось прочитать exp из токена, используем безопасный fallback.
  let maxAge = FALLBACK_MAX_AGE_SECONDS;
  let expiresAt = Date.now() + maxAge * 1000;

  try {
    // jwtDecode не валидирует подпись, только декодирует payload
    const decoded = jwtDecode<DecodedJwtPayload>(token);
    if (typeof decoded.exp === 'number') {
      const nowSec = Math.floor(Date.now() / 1000);
      // Не даем maxAge уйти в отрицательное значение для cookie.
      maxAge = Math.max(decoded.exp - nowSec, 0);
      expiresAt = decoded.exp * 1000;
    }
  } catch {}
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
    path: '/',
  });
  return expiresAt;
}

/**
 * Получить JWT токен из cookies на сервере
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY);
  return token?.value || null;
}

/**
 * Удалить JWT токен из cookies на сервере
 */
export async function clearAuthToken() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_KEY);
}

/**
 * Проверить валидность токена на клиенте (только для проверки истечения)
 * Полная проверка выполняется на сервере
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Получить токен из cookies на клиенте (для использования в fetch запросах)
 */
export async function getTokenForRequest(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    // На клиенте мы не можем получить httpOnly cookies
    // Используем обращение к API endpoint который вернет информацию
    return null;
  }
  return getAuthToken();
}
