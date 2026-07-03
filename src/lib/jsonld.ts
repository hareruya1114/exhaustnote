import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from '@/lib/site';

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
}

export type Crumb = { name: string; path: string };

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

export function productLd(params: {
  name: string;
  brandName: string;
  url: string;
  priceJpy?: number | null;
  offerUrl?: string | null;
  description?: string | null;
}) {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: params.name,
    brand: { '@type': 'Brand', name: params.brandName },
    url: `${SITE_URL}${params.url}`,
  };
  if (params.description) ld.description = params.description;
  if (params.priceJpy && params.priceJpy > 0) {
    ld.offers = {
      '@type': 'Offer',
      price: params.priceJpy,
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
      ...(params.offerUrl ? { url: params.offerUrl } : {}),
    };
  }
  return ld;
}
