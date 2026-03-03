import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/api/utils/auth';

const DOCS_API_BASE = process.env.NEXT_PUBLIC_DOCS_API_BASE_URL || 'http://localhost:3002';

type Params = {
  params: Promise<{ jobId: string }>;
};

export async function GET(request: NextRequest, { params }: Params) {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Missing JWT token' }, { status: 401 });
  }

  const { jobId } = await params;
  const plan = request.headers.get('plan') || 'pro';

  const response = await fetch(`${DOCS_API_BASE}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      plan,
    },
  });

  const responseBody = await response.text();

  return new NextResponse(responseBody, {
    status: response.status,
    headers: {
      'Content-Type': response.headers.get('Content-Type') || 'application/json',
    },
  });
}
