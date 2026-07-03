import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMuffler, getAllMufflerPaths } from '@/lib/queries';
import { bikePath, manufacturerPath, mufflerPath, soundSrc } from '@/lib/site';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { SoundPlayer } from '@/components/SoundPlayer';
import { AffiliateCTA } from '@/components/AffiliateCTA';
import { SelectCard } from '@/components/SelectCard';
import { JsonLd } from '@/components/JsonLd';
import { productLd } from '@/lib/jsonld';

// ISR: 12h
export const revalidate = 43200;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const rows = await getAllMufflerPaths();
    return rows.map((r) => ({ manufacturer: r.manufacturer, bike: r.bike, muffler: r.muffler }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { manufacturer: string; bike: string; muffler: string };
}): Promise<Metadata> {
  const m = await getMuffler(params.manufacturer, params.bike, params.muffler);
  if (!m) return {};
  const bikeName = `${m.bikeModel.manufacturer.name} ${m.bikeModel.name}`;
  const title = `${bikeName} ${m.brandName} ${m.name} の排気音`;
  const description =
    m.description ??
    `${bikeName} に装着した ${m.brandName} ${m.name} の排気音を実際の音源で確認できます。`;
  return {
    title,
    description,
    alternates: { canonical: mufflerPath(params.manufacturer, params.bike, params.muffler) },
    openGraph: { title, description, type: 'article' },
  };
}

export default async function MufflerPage({
  params,
}: {
  params: { manufacturer: string; bike: string; muffler: string };
}) {
  const m = await getMuffler(params.manufacturer, params.bike, params.muffler);
  if (!m) notFound();

  const manufacturer = m.bikeModel.manufacturer;
  const bike = m.bikeModel;
  const bikeName = `${manufacturer.name} ${bike.name}`;
  const src = soundSrc(m.soundUrl);

  const primaryAffiliate = m.affiliateLinks.find((l) => l.isPrimary) ?? m.affiliateLinks[0];
  const siblings = bike.mufflers.filter((s) => s.id !== m.id);

  return (
    <div className="px-4 pb-10 pt-4">
      <JsonLd
        data={productLd({
          name: `${bikeName} ${m.brandName} ${m.name}`,
          brandName: m.brandName,
          url: mufflerPath(params.manufacturer, params.bike, params.muffler),
          priceJpy: m.priceJpy,
          offerUrl: primaryAffiliate?.url ?? null,
          description: m.description,
        })}
      />

      <Breadcrumbs
        crumbs={[
          { name: 'HOME', path: '/' },
          { name: manufacturer.name, path: manufacturerPath(params.manufacturer) },
          { name: bike.name, path: bikePath(params.manufacturer, params.bike) },
          { name: `${m.brandName} ${m.name}`, path: mufflerPath(params.manufacturer, params.bike, params.muffler) },
        ]}
      />

      <h1 className="text-2xl font-black leading-tight">
        {bikeName}
        <br />
        {m.brandName} {m.name}
        <br />
        の排気音
      </h1>
      {m.description && (
        <p className="mt-2 text-[13px] leading-relaxed text-titanium-300">{m.description}</p>
      )}

      <SoundPlayer src={src} brandLabel={`${m.brandName} / ${bike.name}`} caption={m.soundCaption} />

      <h2 className="mb-2.5 mt-6 text-base font-bold">製品スペック</h2>
      <dl className="overflow-hidden rounded-xl border border-asphalt-700 text-[13px]">
        <SpecRow label="ブランド" value={m.brandName} />
        <SpecRow label="タイプ" value={m.productType} />
        {m.material && <SpecRow label="材質" value={m.material} />}
        <SpecRow
          label="車検"
          value={
            m.jmcaApproved ? (
              <span className="text-[#5fd39a]">✓ JMCA認証（車検対応の目安）</span>
            ) : (
              <span className="text-burnt-400">△ 車検適合は要確認</span>
            )
          }
        />
        {m.priceJpy && m.priceJpy > 0 && (
          <SpecRow label="参考価格" value={`¥${m.priceJpy.toLocaleString('ja-JP')}（税込）`} />
        )}
      </dl>

      <AffiliateCTA links={m.affiliateLinks} />

      {siblings.length > 0 && (
        <>
          <h2 className="mb-2.5 mt-6 text-base font-bold">{bike.name} の他のマフラー</h2>
          <div className="grid gap-2">
            {siblings.map((s) => (
              <SelectCard
                key={s.id}
                href={mufflerPath(params.manufacturer, params.bike, s.slug)}
                icon="🔊"
                overline={s.brandName}
                title={s.name}
                tags={s.jmcaApproved ? '車検◎' : '車検△'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex border-b border-asphalt-800 last:border-b-0">
      <dt className="w-[38%] shrink-0 bg-asphalt-800 px-3 py-2.5 font-bold text-titanium-300">{label}</dt>
      <dd className="flex-1 px-3 py-2.5">{value}</dd>
    </div>
  );
}
