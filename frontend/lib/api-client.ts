const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface LoginResponse {
  accessToken: string;
}

interface UserProfile {
  id: string;
  email: string;
  createdAt: string;
}

export class RateLimitError extends Error {
  constructor(
    public retryAfter: number,
    message: string,
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Отправить запрос логина на сервер
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });

  if (response.status === 429) {
    const error = await response.json().catch(() => ({}));
    throw new RateLimitError(
      error.retryAfter || 60,
      error.message || 'Too many login attempts. Please try again later.',
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
}

/**
 * Получить профиль текущего пользователя
 */
export async function getCurrentUser(token: string): Promise<UserProfile> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

/**
 * Выйти из аккаунта
 */
export async function logout(token: string): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
}

/**
 * Зарегистрироваться
 */
export async function register(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

/**
 * Проверить регистрацию по токену
 */
export async function verifyRegistration(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/verify-registration?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Verification failed');
  }

  return response.json();
}

/**
 * Отправить запрос восстановления пароля
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
    credentials: 'include',
  });

  if (response.status === 429) {
    const error = await response.json().catch(() => ({}));
    throw new RateLimitError(
      error.retryAfter || 60,
      error.message || 'Too many password reset requests. Please try again later.',
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Forgot password request failed');
  }

  return response.json();
}

/**
 * Проверить токен сброса пароля
 */
export async function verifyReset(token: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/auth/verify-reset?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Reset verification failed');
  }

  return response.json();
}
