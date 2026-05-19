import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/api/utils/auth';
import type { ChatListItem } from '@/lib/api/types/chat-list';
import type { ApiErrorResponse } from '@/lib/api/types/neural-assistant';

const NEURAL_ASSISTANT_API_BASE =
  process.env.NEXT_PUBLIC_NEURAL_ASSISTANT_API_BASE_URL || 'http://localhost:3003';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ChatListItem | ApiErrorResponse>> {
  const token = await getAuthToken();
  const { id } = await params;

  if (!token) {
    return NextResponse.json<ApiErrorResponse>({ message: 'Missing JWT token' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);

  const response = await fetch(`${NEURAL_ASSISTANT_API_BASE}/chat-list/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : `neural-assistant request failed (${response.status})`;

    return NextResponse.json<ApiErrorResponse>({ message }, { status: response.status });
  }

  return NextResponse.json<ChatListItem>(responseBody as ChatListItem, {
    status: response.status,
  });
}
