import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/api/utils/auth';
import type { ChatItem } from '@/lib/api/types/chat-item';
import type { ApiErrorResponse } from '@/lib/api/types/neural-assistant';

const NEURAL_ASSISTANT_API_BASE =
  process.env.NEXT_PUBLIC_NEURAL_ASSISTANT_API_BASE_URL || 'http://localhost:3003';

export async function GET(request: Request): Promise<NextResponse<ChatItem[] | ApiErrorResponse>> {
  const { searchParams } = new URL(request.url);
  const chatListId = searchParams.get('chatListId');
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json<ApiErrorResponse>({ message: 'Missing JWT token' }, { status: 401 });
  }
  if (!chatListId) {
    return NextResponse.json<ApiErrorResponse>(
      { message: 'chatListId is required' },
      { status: 400 },
    );
  }

  const response = await fetch(`${NEURAL_ASSISTANT_API_BASE}/chat?chatListId=${chatListId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : `neural-assistant request failed (${response.status})`;

    return NextResponse.json<ApiErrorResponse>({ message }, { status: response.status });
  }

  return NextResponse.json<ChatItem[]>(responseBody as ChatItem[], {
    status: response.status,
  });
}
