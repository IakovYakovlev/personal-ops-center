'use server';

import { authService } from '@/lib/api/services/auth-service';

export async function registerAction(email: string) {
  try {
    const response = await authService.register(email);
    return { success: true, message: response.message };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}
