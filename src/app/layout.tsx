import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — バイクのマフラー排気音を聴いて選ぶ`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;500;700;900&family=IBM+Plex+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-asphalt-700 bg-asphalt-950/95 px-4 py-3 backdrop-blur">
            <Link href="/" className="text-lg font-black tracking-tight">
              Exhaust<span className="text-burnt-400">Note</span>
            </Link>
            <span className="text-[10px] text-titanium-500">※アフィリエイト広告を含みます</span>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-10 border-t border-asphalt-800 px-4 py-6 text-[11px] leading-relaxed text-titanium-500">
            <p>
              当サイトはアフィリエイト広告（Amazon / 楽天 / Webike）を利用しています。掲載している音源・価格・スペックは変更される場合があります。車検適合は年式・保安基準により異なるため、装着前に必ず最新の基準をご確認ください。
            </p>
            <p className="mt-2">© {new Date().getFullYear()} {SITE_NAME}</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
