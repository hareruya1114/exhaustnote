import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-mono text-5xl font-bold text-asphalt-700">404</p>
      <h1 className="mt-4 text-lg font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-titanium-300">
        お探しのページは移動または削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-burnt-500 px-5 py-3 text-sm font-bold text-asphalt-950 transition hover:brightness-110"
      >
        トップへ戻る
      </Link>
    </div>
  );
}
