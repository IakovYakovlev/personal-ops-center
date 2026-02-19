'use client';

import { useState } from 'react';
import { forgotPasswordAction } from '@/app/actions/forgot-password';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { RateLimitDialog } from './rate-limit-dialog';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rateLimitOpen, setRateLimitOpen] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await forgotPasswordAction(email);

      // Если результат содержит ошибку
      if (result?.error) {
        console.log('-->> Forgot password result:', result);
        if (result.isRateLimit) {
          console.log('-->> Rate limit error:');
          setRateLimitMessage(result.message);
          setRateLimitOpen(true);
        } else {
          toast.error(result.message);
        }
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      setEmail('');
      toast.success(result.message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Request failed';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 to-slate-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email to receive password reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4 text-sm text-green-700">
                  <p className="font-semibold">Email sent!</p>
                  <p className="mt-2">Check your email for password reset instructions.</p>
                </div>
                <Button onClick={() => setIsSubmitted(false)} variant="outline" className="w-full">
                  Send another reset link
                </Button>
              </div>
            )}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Remember your password?{' '}
              <a href="/login" className="text-primary hover:underline">
                Login
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      <RateLimitDialog
        open={rateLimitOpen}
        onOpenChange={setRateLimitOpen}
        message={rateLimitMessage}
      />
    </>
  );
}
