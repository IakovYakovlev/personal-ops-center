'use server';

import { login as apiLogin, logout as apiLogout, RateLimitError } from '@/lib/api-client';
import { setAuthToken, getAuthToken, clearAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function loginAction(email: string, password: string, redirectTo?: string) {
  try {
    // Отправить запрос логина на сервер
    const response = await apiLogin(email, password);

    // Сохранить токен в cookies
    await setAuthToken(response.accessToken);
  } catch (error) {
    // Пробросить RateLimitError
    if (error instanceof RateLimitError) {
      return {
        error: true,
        message: error.message,
        isRateLimit: true,
      };
    }

    // Остальные ошибки
    const errorMessage = error instanceof Error ? error.message : 'Login failed';
    return {
      error: true,
      message: errorMessage,
      isRateLimit: false,
    };
  }

  // Перенаправить на указанный адрес или на главную
  redirect(redirectTo || '/dashboard');
}

export async function logoutAction() {
  try {
    // Получить токен
    const token = await getAuthToken();

    if (!token) {
      throw new Error('No token found');
    }

    // Отправить запрос логаута на сервер
    await apiLogout(token);

    // Удалить токен из cookies
    await clearAuthToken();
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Редиректить на логин
  redirect('/login');
}
