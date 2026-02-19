'use server';

import { register as apiRegister } from '@/lib/api-client';

export async function registerAction(email: string) {
  try {
    const response = await apiRegister(email);
    return { success: true, message: response.message };
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Registration failed');
  }
}
