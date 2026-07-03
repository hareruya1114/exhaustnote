// サイト共通の定数・パスヘルパー

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const CDN_BASE = (process.env.NEXT_PUBLIC_CDN_BASE || '').replace(/\/$/, '');

export const SITE_NAME = 'ExhaustNote';
export const SITE_DESCRIPTION =
  'バイクのマフラー排気音を、メーカー・車種・製品ごとに実際の音源で確認できる音メディア。';

// ISR 再検証秒数（各ページの export const revalidate はリテラルで指定するが、参照用にまとめておく）
export const REVALIDATE = {
  home: 86400, // 24h
  manufacturer: 86400, // 24h
  bike: 86400, // 24h
  muffler: 43200, // 12h
} as const;

export const VENDOR_LABELS: Record<string, string> = {
  AMAZON: 'Amazon',
  RAKUTEN: '楽天',
  WEBIKE: 'Webike',
};

export function manufacturerPath(manufacturerSlug: string): string {
  return `/${manufacturerSlug}`;
}

export function bikePath(manufacturerSlug: string, bikeSlug: string): string {
  return `/${manufacturerSlug}/${bikeSlug}`;
}

export function mufflerPath(manufacturerSlug: string, bikeSlug: string, mufflerSlug: string): string {
  return `/${manufacturerSlug}/${bikeSlug}/${mufflerSlug}`;
}

// 音源URLを組み立てる。絶対URLならそのまま、S3キーなら CDN_BASE を前置。
export function soundSrc(url?: string | null): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const key = url.replace(/^\//, '');
  return CDN_BASE ? `${CDN_BASE}/${key}` : `/${key}`;
}
