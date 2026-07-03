import type { MetadataRoute } from 'next';
import { getAllManufacturers, getAllBikePaths, getAllMufflerPaths } from '@/lib/queries';
import { SITE_URL, manufacturerPath, bikePath, mufflerPath } from '@/lib/site';

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: 'weekly', priority: 1 },
  ];

  try {
    const [makers, bikes, mufflers] = await Promise.all([
      getAllManufacturers(),
      getAllBikePaths(),
      getAllMufflerPaths(),
    ]);

    for (const m of makers) {
      entries.push({
        url: `${SITE_URL}${manufacturerPath(m.slug)}`,
        lastModified: m.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
    for (const b of bikes) {
      entries.push({
        url: `${SITE_URL}${bikePath(b.manufacturer, b.bike)}`,
        lastModified: b.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }
    for (const p of mufflers) {
      entries.push({
        url: `${SITE_URL}${mufflerPath(p.manufacturer, p.bike, p.muffler)}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } catch {
    // DB未接続時はトップのみ返す
  }

  return entries;
}
