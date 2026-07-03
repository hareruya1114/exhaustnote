import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBike, getAllBikePaths } from '@/lib/queries';
import { bikePath, manufacturerPath, mufflerPath } from '@/lib/site';
import { SelectCard } from '@/components/SelectCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// ISR: 24h
export const revalidate = 86400;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await getAllBikePaths();
    return rows.map((r) => ({ manufacturer: r.manufacturer, bike: r.bike }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string; bike: string };
}): Promise<Metadata> {
  const bike = await getBike(params.manufacturer, params.bike);
  if (!bike) return {};
  const title = `${bike.manufacturer.name} ${bike.name} のマフラー音一覧`;
  return {
    title,
    description: `${bike.manufacturer.name} ${bike.name} に装着できるマフラーの排気音・スペック・車検適合をまとめています。`,
    alternates: { canonical: bikePath(params.manufacturer, params.bike) },
    openGraph: { title },
  };
}

function tagsFor(m: {
  jmcaApproved: boolean;
  priceJpy: number | null;
  brandName: string;
}): string {
  const parts: string[] = [m.brandName];
  parts.push(m.jmcaApproved ? '車検◎' : '車検△');
  if (m.priceJpy && m.priceJpy > 0) parts.push(`¥${m.priceJpy.toLocaleString('ja-JP')}`);
  return parts.join(' ・ ');
}

export default async function BikePage({
  params,
}: {
  params: { manufacturer: string; bike: string };
}) {
  const bike = await getBike(params.manufacturer, params.bike);
  if (!bike) notFound();

  return (
    <div className="px-4 pb-10 pt-4">
      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: bike.manufacturer.name, path: manufacturerPath(params.manufacturer) },
          { name: bike.name, path: bikePath(params.manufacturer, params.bike) },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">
        {bike.manufacturer.name} {bike.name}
        <br />
        のマフラー
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">
        装着できるマフラーごとに実際の排気音を収録。気になる1本をタップ。
      </p>

      <h2 className="mb-2.5 mt-6 text-base font-bold">マフラーを選ぶ</h2>
      <div className="grid gap-2">
        {bike.mufflers.map((m) => (
          <SelectCard
            key={m.id}
            href={mufflerPath(params.manufacturer, params.bike, m.slug)}
            icon="🔊"
            overline={m.brandName}
            title={m.name}
            tags={tagsFor(m)}
          />
        ))}
        {bike.mufflers.length === 0 && (
          <p className="text-sm text-titanium-500">
            この車種にはまだマフラーが登録されていません。
          </p>
        )}
      </div>
    </div>
  );
}
