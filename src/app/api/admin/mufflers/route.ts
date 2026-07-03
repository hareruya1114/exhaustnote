import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin, revalidateAll } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// 空文字を null に正規化するヘルパー
const nullableString = z
  .string()
  .max(2000)
  .optional()
  .transform((v) => (v && v.trim() !== '' ? v : null));

const createSchema = z.object({
  bikeModelId: z.string().min(1),
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(120).regex(slugRe, 'slugは半角英数字とハイフンのみ'),
  brandName: z.string().min(1).max(80),
  productType: z.string().min(1).max(40).optional(),
  material: nullableString,
  priceJpy: z.number().int().nonnegative().nullable().optional(),
  jmcaApproved: z.boolean().optional(),
  description: nullableString,
  soundUrl: nullableString,
  soundCaption: nullableString,
  order: z.number().int().optional(),
});

const updateSchema = createSchema.partial().extend({ id: z.string().min(1) }).omit({ bikeModelId: true });

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    const created = await prisma.mufflerProduct.create({ data: parsed.data });
    revalidateAll();
    return NextResponse.json({ muffler: created });
  } catch {
    return NextResponse.json({ error: '同じ車種内でslugが重複しています' }, { status: 409 });
  }
}

export async function PATCH(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, ...data } = parsed.data;
  try {
    const updated = await prisma.mufflerProduct.update({ where: { id }, data });
    revalidateAll();
    return NextResponse.json({ muffler: updated });
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
    await prisma.mufflerProduct.delete({ where: { id: parsed.data.id } });
    revalidateAll();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 400 });
  }
}
