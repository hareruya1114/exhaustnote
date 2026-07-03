import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getManufacturer, getAllManufacturers } from '@/lib/queries';
import { bikePath, manufacturerPath } from '@/lib/site';
import { SelectCard } from '@/components/SelectCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// ISR: 24h
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await getAllManufacturers();
    return rows.map((r) => ({ manufacturer: r.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string };
}): Promise<Metadata> {
  const m = await getManufacturer(params.manufacturer);
  if (!m) return {};
  return {
    title: `${m.name} のマフラー音一覧`,
    description: `${m.name} の車種別に、マフラーの排気音を実際の音源で確認できます。`,
    alternates: { canonical: manufacturerPath(m.slug) },
  };
}

export default async function ManufacturerPage({
  params,
}: {
  params: { manufacturer: string };
}) {
  const m = await getManufacturer(params.manufacturer);
  if (!m) notFound();

  return (
    <div className="px-4 pb-10 pt-4">
      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: m.name, path: manufacturerPath(m.slug) },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">{m.name} の車種</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">
        音を聴きたい車種を選んでください。
      </p>

      <h2 className="mb-2.5 mt-6 text-base font-bold">車種を選ぶ</h2>
      <div className="grid gap-2">
        {m.bikes.map((b) => (
          <SelectCard
            key={b.id}
            href={bikePath(m.slug, b.slug)}
            icon="🏍️"
            title={b.name}
            tags={`マフラー ${b._count.mufflers} 種の音を収録`}
          />
        ))}
        {m.bikes.length === 0 && (
          <p className="text-sm text-titanium-500">
            このメーカーにはまだ車種が登録されていません。
          </p>
        )}
      </div>
    </div>
  );
}
