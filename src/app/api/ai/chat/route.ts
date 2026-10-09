import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getSession } from '@/lib/auth/requireAdmin';
import { handleChatMessage } from '@/lib/ai/chatService';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

const chatRequestSchema = z.object({
  sessionId: z.string().optional(),
  laundromatId: z.string().optional(),
  // Length-capped so a user can't balloon the prompt (cost/abuse control) -
  // this is also part of the prompt-injection defense: a huge message can't
  // be used to bury/obscure an injection attempt either.
  message: z.string().trim().min(1).max(1000),
});

const RATE_LIMIT = 20;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  const session = await getSession();
  const rateLimitKey = session?.sub ?? getClientIp(request);
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMIT, RATE_LIMIT_WINDOW_MS);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds ?? 60) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '요청 형식이 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const result = await handleChatMessage({
      sessionId: parsed.data.sessionId,
      laundromatId: parsed.data.laundromatId,
      userId: session?.sub,
      message: parsed.data.message,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[ai/chat] failed', error);
    return NextResponse.json({ message: 'AI 응답을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.' }, { status: 502 });
  }
}
