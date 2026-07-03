import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isAdmin, revalidateAll } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const vendor = z.enum(['AMAZON', 'RAKUTEN', 'WEBIKE']);

const createSchema = z.object({
  productId: z.string().min(1),
  vendor,
  url: z.string().url().max(2000),
  isPrimary: z.boolean().optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  vendor: vendor.optional(),
  url: z.string().url().max(2000).optional(),
  isPrimary: z.boolean().optional(),
});

async function guard() {
  return (await isAdmin()) ? null : NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

// 指定商品で1本だけを isPrimary=true にする
async function enforceSinglePrimary(productId: string, primaryId: string) {
  await prisma.affiliateLink.updateMany({
    where: { productId, NOT: { id: primaryId } },
    data: { isPrimary: false },
  });
}

export async function POST(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const created = await prisma.affiliateLink.create({ data: parsed.data });
  if (created.isPrimary) await enforceSinglePrimary(created.productId, created.id);
  revalidateAll();
  return NextResponse.json({ affiliate: created });
}

export async function PATCH(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { id, ...data } = parsed.data;
  const updated = await prisma.affiliateLink.update({ where: { id }, data });
  if (updated.isPrimary) await enforceSinglePrimary(updated.productId, updated.id);
  revalidateAll();
  return NextResponse.json({ affiliate: updated });
}

export async function DELETE(req: Request) {
  const g = await guard();
  if (g) return g;
  const parsed = z.object({ id: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'idが必要です' }, { status: 400 });
  try {
    await prisma.affiliateLink.delete({ where: { id: parsed.data.id } });
    revalidateAll();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: '削除に失敗しました' }, { status: 400 });
  }
}
