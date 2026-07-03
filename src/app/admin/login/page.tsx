'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const callbackUrl = search.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    setError('');
    const res = await signIn('credentials', { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError('メールアドレスまたはパスワードが正しくありません。');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-black">管理ログイン</h1>
      <p className="mt-2 text-[13px] text-titanium-300">ExhaustNote 管理画面</p>

      <div className="mt-6 grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-titanium-300">メールアドレス</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-asphalt-700 bg-asphalt-900 px-3 py-2.5 text-titanium-100 outline-none focus:border-burnt-500"
            autoComplete="username"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-titanium-300">パスワード</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
            className="rounded-lg border border-asphalt-700 bg-asphalt-900 px-3 py-2.5 text-titanium-100 outline-none focus:border-burnt-500"
            autoComplete="current-password"
          />
        </label>

        {error && <p className="text-sm text-tacho">{error}</p>}

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="mt-2 rounded-lg bg-burnt-500 px-4 py-3 text-sm font-bold text-asphalt-950 transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? 'ログイン中…' : 'ログイン'}
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-sm text-titanium-500">読み込み中…</div>}>
      <LoginForm />
    </Suspense>
  );
}
