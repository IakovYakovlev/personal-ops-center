import { cookies } from 'next/headers';

const TOKEN_KEY = 'auth_token';
const COOKIE_MAX_AGE = 15 * 60; // 15 minutes

export interface AuthToken {
  accessToken: string;
  expiresAt: number;
}

/**
 * Сохранить JWT токен в cookies на сервере
 */
export async function setAuthToken(token: string) {
  const expiresAt = Date.now() + COOKIE_MAX_AGE * 1000;
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_KEY, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
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
