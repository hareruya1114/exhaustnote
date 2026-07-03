import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { breadcrumbLd, type Crumb } from '@/lib/jsonld';

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="パンくずリスト" className="mb-3 text-[11px] leading-relaxed text-titanium-500">
      <JsonLd data={breadcrumbLd(crumbs)} />
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-1">
              {last ? (
                <span aria-current="page" className="text-titanium-300">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-burnt-400">
                  {c.name}
                </Link>
              )}
              {!last && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
