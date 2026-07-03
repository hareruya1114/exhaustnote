import Link from 'next/link';

export function SelectCard({
  href,
  icon,
  overline,
  title,
  tags,
}: {
  href: string;
  icon?: string;
  overline?: string;
  title: string;
  tags?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-asphalt-700 bg-asphalt-900 p-3.5 transition hover:border-burnt-500"
    >
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-asphalt-800 text-lg">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        {overline && <span className="block font-mono text-[11px] text-titanium-500">{overline}</span>}
        <span className="mt-0.5 block font-bold leading-snug">{title}</span>
        {tags && <span className="mt-0.5 block text-[11px] text-titanium-300">{tags}</span>}
      </span>
      <span aria-hidden="true" className="shrink-0 text-lg text-titanium-500">
        ›
      </span>
    </Link>
  );
}
