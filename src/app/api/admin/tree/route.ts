import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: {
      bikes: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: {
          mufflers: {
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            include: { affiliateLinks: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ manufacturers });
}
