'use server';

import { forgotPassword as apiForgotPassword, RateLimitError } from '@/lib/api-client';

export async function forgotPasswordAction(email: string) {
  try {
    const response = await apiForgotPassword(email);
    return { error: false, success: true, message: response.message };
  } catch (error) {
    // Обработать rate limit ошибку
    if (error instanceof RateLimitError) {
      return {
        error: true,
        message: error.message,
        isRateLimit: true,
      };
    }

    // Остальные ошибки
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to process password reset request';

    return {
      error: true,
      message: errorMessage,
      isRateLimit: false,
    };
  }
}
