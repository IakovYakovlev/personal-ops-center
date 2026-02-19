import { LoginForm } from '@/components/login-form';
import { getAuthToken } from '@/lib/auth';
import { redirect } from 'next/dist/client/components/navigation';

export default async function LoginPage() {
  const token = await getAuthToken();

  // Если есть токен, перенаправить на dashboard
  if (token) {
    redirect('/dashboard');
  }

  return <LoginForm />;
}
