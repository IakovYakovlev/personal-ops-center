'use server';

import { authService, RateLimitError } from '@/lib/api/services/authService';

export async function forgotPasswordAction(email: string) {
  try {
    const response = await authService.forgotPassword(email);
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
