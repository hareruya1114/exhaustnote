import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin, revalidateAll } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSchema = z.object({
  name: z.string().min(1).max(80),
  slug: z.string().min(1).max(80).regex(slugRe, 'slugは半角英数字とハイフンのみ'),
  order: z.number().int().optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(80).optional(),
  slug: z.string().min(1).max(80).regex(slugRe).optional(),
  order: z.number().int().optional(),
});

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const created = await prisma.manufacturer.create({ data: parsed.data });
    revalidateAll();
    return NextResponse.json({ manufacturer: created });
  } catch (e) {
    return NextResponse.json({ error: 'slugが重複している可能性があります' }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, ...data } = parsed.data;
  try {
    const updated = await prisma.manufacturer.update({ where: { id }, data });
    revalidateAll();
    return NextResponse.json({ manufacturer: updated });
  } catch {
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'idが必要です' }, { status: 400 });
  try {
    await prisma.manufacturer.delete({ where: { id: parsed.data.id } });
    revalidateAll();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 400 });
  }
}
