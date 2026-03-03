import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/api/utils/auth';

const DOCS_API_BASE = process.env.NEXT_PUBLIC_DOCS_API_BASE_URL || 'http://localhost:3002';

export async function POST(request: NextRequest) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Missing JWT token' }, { status: 401 });
  }

  const strategy = request.nextUrl.searchParams.get('strategy') || 'async';
  const plan = request.headers.get('plan') || (strategy === 'sync' ? 'free' : 'pro');

  const incomingFormData = await request.formData();
  const formData = new FormData();

  for (const [key, value] of incomingFormData.entries()) {
    formData.append(key, value);
  }

  const response = await fetch(`${DOCS_API_BASE}/upload/file?strategy=${strategy}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      plan,
    },
    body: formData,
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}
