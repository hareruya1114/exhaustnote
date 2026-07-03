import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// 外部から特定パスのISRを再検証するためのエンドポイント。
// ヘッダ x-revalidate-secret が REVALIDATE_SECRET と一致する場合のみ実行。
export async function POST(req: Request) {
  const secret = req.headers.get('x-revalidate-secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let body: { paths?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid json' }, { status: 400 });
  }

  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === 'string') : [];
  if (paths.length === 0) {
    revalidatePath('/', 'layout');
    return NextResponse.json({ ok: true, revalidated: 'all' });
  }

  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ ok: true, revalidated: paths });
}
