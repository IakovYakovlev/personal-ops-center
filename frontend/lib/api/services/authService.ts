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

export const authService = {
  /**
   * Отправить запрос логина на сервер
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
        signal: controller.signal,
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
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Login request timed out. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  },

  /**
   * Получить профиль текущего пользователя
   */
  async getCurrentUser(token: string): Promise<UserProfile> {
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
  },

  /**
   * Выйти из аккаунта
   */
  async logout(token: string): Promise<void> {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
  },

  /**
   * Зарегистрироваться
   */
  async register(email: string): Promise<{ message: string }> {
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
  },

  /**
   * Проверить регистрацию по токену
   */
  async verifyRegistration(token: string): Promise<{ message: string }> {
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
  },

  /**
   * Отправить запрос восстановления пароля
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
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
  },

  /**
   * Проверить токен сброса пароля
   */
  async verifyReset(token: string): Promise<{ message: string }> {
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
  },
};
