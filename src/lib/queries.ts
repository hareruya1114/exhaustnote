import { prisma } from '@/lib/prisma';

export function getManufacturers() {
  return prisma.manufacturer.findMany({
    orderBy: [{ order: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { bikes: true } } },
  });
}

export function getManufacturer(manufacturerSlug: string) {
  return prisma.manufacturer.findUnique({
    where: { slug: manufacturerSlug },
    include: {
      bikes: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { mufflers: true } } },
      },
    },
  });
}

export function getBike(manufacturerSlug: string, bikeSlug: string) {
  return prisma.bikeModel.findFirst({
    where: { slug: bikeSlug, manufacturer: { slug: manufacturerSlug } },
    include: {
      manufacturer: true,
      mufflers: {
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      },
    },
  });
}

export function getMuffler(manufacturerSlug: string, bikeSlug: string, mufflerSlug: string) {
  return prisma.mufflerProduct.findFirst({
    where: {
      slug: mufflerSlug,
      bikeModel: { slug: bikeSlug, manufacturer: { slug: manufacturerSlug } },
    },
    include: {
      affiliateLinks: true,
      bikeModel: {
        include: {
          manufacturer: true,
          // 同じ車種の他マフラー（内部リンク用）
          mufflers: {
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
          },
        },
      },
    },
  });
}

// sitemap / generateStaticParams 用に全パスを取得
export async function getAllMufflerPaths() {
  const rows = await prisma.mufflerProduct.findMany({
    select: {
      slug: true,
      updatedAt: true,
      bikeModel: {
        select: {
          slug: true,
          manufacturer: { select: { slug: true } },
        },
      },
    },
  });
  return rows.map((r) => ({
    manufacturer: r.bikeModel.manufacturer.slug,
    bike: r.bikeModel.slug,
    muffler: r.slug,
    updatedAt: r.updatedAt,
  }));
}

export async function getAllBikePaths() {
  const rows = await prisma.bikeModel.findMany({
    select: {
      slug: true,
      updatedAt: true,
      manufacturer: { select: { slug: true } },
    },
  });
  return rows.map((r) => ({
    manufacturer: r.manufacturer.slug,
    bike: r.slug,
    updatedAt: r.updatedAt,
  }));
}

export function getAllManufacturers() {
  return prisma.manufacturer.findMany({
    select: { slug: true, updatedAt: true },
  });
}
