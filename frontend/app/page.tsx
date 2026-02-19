import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const token = await getAuthToken();

  // Если есть токен, перенаправить на dashboard
  if (token) {
    redirect('/dashboard');
  }

  // Если токена нет, перенаправить на логин
  redirect('/login');
}
