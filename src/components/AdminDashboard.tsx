'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';

// ---- types (mirror of Prisma models, kept local) ----
type Affiliate = { id: string; vendor: string; url: string; isPrimary: boolean; productId: string };
type Muffler = {
  id: string;
  slug: string;
  name: string;
  brandName: string;
  productType: string;
  material: string | null;
  priceJpy: number | null;
  jmcaApproved: boolean;
  description: string | null;
  soundUrl: string | null;
  soundCaption: string | null;
  order: number;
  bikeModelId: string;
  affiliateLinks: Affiliate[];
};
type Bike = { id: string; slug: string; name: string; order: number; mufflers: Muffler[] };
type Manufacturer = { id: string; slug: string; name: string; order: number; bikes: Bike[] };

type Tab = 'manufacturers' | 'bikes' | 'mufflers';

const VENDORS = ['AMAZON', 'RAKUTEN', 'WEBIKE'] as const;
const VENDOR_LABEL: Record<string, string> = { AMAZON: 'Amazon', RAKUTEN: '楽天', WEBIKE: 'Webike' };

async function api(method: string, path: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof data?.error === 'string'
        ? data.error
        : data?.error
          ? JSON.stringify(data.error)
          : `エラー (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export function AdminDashboard() {
  const [tree, setTree] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('manufacturers');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api('GET', '/api/admin/tree');
      setTree(data.manufacturers ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">
          管理画面 <span className="font-mono text-xs text-titanium-500">ExhaustNote</span>
        </h1>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="rounded-lg border border-asphalt-700 px-3 py-1.5 text-xs text-titanium-300 hover:border-burnt-500"
        >
          ログアウト
        </button>
      </div>

      <div className="mt-4 flex gap-1 overflow-x-auto border-b border-asphalt-700">
        {(
          [
            ['manufacturers', 'メーカー'],
            ['bikes', '車種'],
            ['mufflers', 'マフラー / 音源'],
          ] as [Tab, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`shrink-0 border-b-2 px-3 py-2 text-sm font-bold transition ${
              tab === key ? 'border-burnt-500 text-titanium-100' : 'border-transparent text-titanium-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-tacho/40 bg-tacho/10 px-3 py-2 text-sm text-tacho">{error}</p>
      )}

      {loading ? (
        <p className="mt-6 text-sm text-titanium-500">読み込み中…</p>
      ) : (
        <div className="mt-5">
          {tab === 'manufacturers' && <ManufacturersTab tree={tree} reload={reload} onError={setError} />}
          {tab === 'bikes' && <BikesTab tree={tree} reload={reload} onError={setError} />}
          {tab === 'mufflers' && <MufflersTab tree={tree} reload={reload} onError={setError} />}
        </div>
      )}
    </div>
  );
}

// ---------- shared UI ----------
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-titanium-300">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'rounded-lg border border-asphalt-700 bg-asphalt-950 px-3 py-2 text-titanium-100 outline-none focus:border-burnt-500';

function Btn({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
}) {
  const cls =
    variant === 'primary'
      ? 'bg-burnt-500 text-asphalt-950 hover:brightness-110'
      : variant === 'danger'
        ? 'border border-tacho/50 text-tacho hover:bg-tacho/10'
        : 'border border-asphalt-700 text-titanium-300 hover:border-burnt-500';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg px-3 py-2 text-sm font-bold transition disabled:opacity-50 ${cls}`}
    >
      {children}
    </button>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-asphalt-700 bg-asphalt-900 p-4">{children}</div>;
}

// ---------- Manufacturers ----------
function ManufacturersTab({
  tree,
  reload,
  onError,
}: {
  tree: Manufacturer[];
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!name || !slug) return;
    setBusy(true);
    try {
      await api('POST', '/api/admin/manufacturers', { name, slug, order: tree.length + 1 });
      setName('');
      setSlug('');
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    } finally {
      setBusy(false);
    }
  }

  async function save(m: Manufacturer, patch: Partial<Manufacturer>) {
    try {
      await api('PATCH', '/api/admin/manufacturers', { id: m.id, ...patch });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  async function remove(m: Manufacturer) {
    if (!confirm(`「${m.name}」を削除しますか？配下の車種・マフラーも削除されます。`)) return;
    try {
      await api('DELETE', '/api/admin/manufacturers', { id: m.id });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <p className="mb-3 text-sm font-bold">メーカーを追加</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="表示名（例: Kawasaki）">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="slug（例: kawasaki）">
            <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="半角英数字とハイフン" />
          </Field>
        </div>
        <div className="mt-3">
          <Btn onClick={add} disabled={busy || !name || !slug}>
            追加する
          </Btn>
        </div>
      </Card>

      <div className="grid gap-2">
        {tree.map((m) => (
          <Card key={m.id}>
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <Field label="表示名">
                <input className={inputCls} defaultValue={m.name} onBlur={(e) => e.target.value !== m.name && save(m, { name: e.target.value })} />
              </Field>
              <Field label="slug">
                <input className={inputCls} defaultValue={m.slug} onBlur={(e) => e.target.value !== m.slug && save(m, { slug: e.target.value })} />
              </Field>
              <div className="flex gap-2">
                <Btn variant="danger" onClick={() => remove(m)}>
                  削除
                </Btn>
              </div>
            </div>
            <p className="mt-2 text-xs text-titanium-500">車種 {m.bikes.length} 件</p>
          </Card>
        ))}
        {tree.length === 0 && <p className="text-sm text-titanium-500">メーカーがありません。</p>}
      </div>
    </div>
  );
}

// ---------- Bikes ----------
function BikesTab({
  tree,
  reload,
  onError,
}: {
  tree: Manufacturer[];
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [manufacturerId, setManufacturerId] = useState(tree[0]?.id ?? '');
  const current = useMemo(() => tree.find((m) => m.id === manufacturerId) ?? tree[0], [tree, manufacturerId]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!current || !name || !slug) return;
    setBusy(true);
    try {
      await api('POST', '/api/admin/bikes', {
        manufacturerId: current.id,
        name,
        slug,
        order: (current.bikes.length ?? 0) + 1,
      });
      setName('');
      setSlug('');
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    } finally {
      setBusy(false);
    }
  }

  async function save(b: Bike, patch: Partial<Bike>) {
    try {
      await api('PATCH', '/api/admin/bikes', { id: b.id, ...patch });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  async function remove(b: Bike) {
    if (!confirm(`「${b.name}」を削除しますか？配下のマフラーも削除されます。`)) return;
    try {
      await api('DELETE', '/api/admin/bikes', { id: b.id });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  return (
    <div className="grid gap-4">
      <Field label="メーカーを選択">
        <select className={inputCls} value={current?.id ?? ''} onChange={(e) => setManufacturerId(e.target.value)}>
          {tree.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      {current && (
        <>
          <Card>
            <p className="mb-3 text-sm font-bold">{current.name} に車種を追加</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="表示名（例: Ninja 400）">
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </Field>
              <Field label="slug（例: ninja-400）">
                <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} />
              </Field>
            </div>
            <div className="mt-3">
              <Btn onClick={add} disabled={busy || !name || !slug}>
                追加する
              </Btn>
            </div>
          </Card>

          <div className="grid gap-2">
            {current.bikes.map((b) => (
              <Card key={b.id}>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                  <Field label="表示名">
                    <input className={inputCls} defaultValue={b.name} onBlur={(e) => e.target.value !== b.name && save(b, { name: e.target.value })} />
                  </Field>
                  <Field label="slug">
                    <input className={inputCls} defaultValue={b.slug} onBlur={(e) => e.target.value !== b.slug && save(b, { slug: e.target.value })} />
                  </Field>
                  <div className="flex gap-2">
                    <Btn variant="danger" onClick={() => remove(b)}>
                      削除
                    </Btn>
                  </div>
                </div>
                <p className="mt-2 text-xs text-titanium-500">マフラー {b.mufflers.length} 件</p>
              </Card>
            ))}
            {current.bikes.length === 0 && <p className="text-sm text-titanium-500">車種がありません。</p>}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Mufflers ----------
function MufflersTab({
  tree,
  reload,
  onError,
}: {
  tree: Manufacturer[];
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [manufacturerId, setManufacturerId] = useState(tree[0]?.id ?? '');
  const manufacturer = useMemo(() => tree.find((m) => m.id === manufacturerId) ?? tree[0], [tree, manufacturerId]);
  const [bikeId, setBikeId] = useState('');
  const bike = useMemo(
    () => manufacturer?.bikes.find((b) => b.id === bikeId) ?? manufacturer?.bikes[0],
    [manufacturer, bikeId],
  );

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="メーカー">
          <select
            className={inputCls}
            value={manufacturer?.id ?? ''}
            onChange={(e) => {
              setManufacturerId(e.target.value);
              setBikeId('');
            }}
          >
            {tree.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="車種">
          <select className={inputCls} value={bike?.id ?? ''} onChange={(e) => setBikeId(e.target.value)}>
            {(manufacturer?.bikes ?? []).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {bike ? (
        <>
          <MufflerCreate bikeId={bike.id} order={bike.mufflers.length + 1} reload={reload} onError={onError} />
          <div className="grid gap-3">
            {bike.mufflers.map((m) => (
              <MufflerEditor key={m.id} muffler={m} bikeSlug={bike.slug} reload={reload} onError={onError} />
            ))}
            {bike.mufflers.length === 0 && <p className="text-sm text-titanium-500">マフラーがありません。</p>}
          </div>
        </>
      ) : (
        <p className="text-sm text-titanium-500">先に車種を追加してください。</p>
      )}
    </div>
  );
}

function MufflerCreate({
  bikeId,
  order,
  reload,
  onError,
}: {
  bikeId: string;
  order: number;
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandName, setBrandName] = useState('');
  const [busy, setBusy] = useState(false);

  async function create() {
    if (!name || !slug || !brandName) return;
    setBusy(true);
    try {
      await api('POST', '/api/admin/mufflers', { bikeModelId: bikeId, name, slug, brandName, order });
      setName('');
      setSlug('');
      setBrandName('');
      setOpen(false);
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div>
        <Btn onClick={() => setOpen(true)}>＋ マフラーを追加</Btn>
      </div>
    );
  }

  return (
    <Card>
      <p className="mb-3 text-sm font-bold">マフラーを追加</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="ブランド（例: ヨシムラ）">
          <input className={inputCls} value={brandName} onChange={(e) => setBrandName(e.target.value)} />
        </Field>
        <Field label="製品名（例: Slip-On R-77S）">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="slug（例: yoshimura-r77s）">
          <input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} />
        </Field>
      </div>
      <div className="mt-3 flex gap-2">
        <Btn onClick={create} disabled={busy || !name || !slug || !brandName}>
          追加する
        </Btn>
        <Btn variant="ghost" onClick={() => setOpen(false)}>
          キャンセル
        </Btn>
      </div>
    </Card>
  );
}

function MufflerEditor({
  muffler,
  bikeSlug,
  reload,
  onError,
}: {
  muffler: Muffler;
  bikeSlug: string;
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: muffler.name,
    slug: muffler.slug,
    brandName: muffler.brandName,
    productType: muffler.productType,
    material: muffler.material ?? '',
    priceJpy: muffler.priceJpy?.toString() ?? '',
    jmcaApproved: muffler.jmcaApproved,
    description: muffler.description ?? '',
    soundUrl: muffler.soundUrl ?? '',
    soundCaption: muffler.soundCaption ?? '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setBusy(true);
    try {
      await api('PATCH', '/api/admin/mufflers', {
        id: muffler.id,
        name: form.name,
        slug: form.slug,
        brandName: form.brandName,
        productType: form.productType || 'スリップオン',
        material: form.material,
        priceJpy: form.priceJpy === '' ? null : Number(form.priceJpy),
        jmcaApproved: form.jmcaApproved,
        description: form.description,
        soundUrl: form.soundUrl,
        soundCaption: form.soundCaption,
      });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm(`「${muffler.brandName} ${muffler.name}」を削除しますか？`)) return;
    try {
      await api('DELETE', '/api/admin/mufflers', { id: muffler.id });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  async function onFile(file: File) {
    setUploading(true);
    try {
      const { uploadUrl, key } = await api('POST', '/api/admin/upload', {
        fileName: file.name,
        contentType: file.type || 'audio/mpeg',
        bikeSlug,
        mufflerSlug: form.slug,
      });
      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'audio/mpeg' },
        body: file,
      });
      if (!put.ok) throw new Error('S3へのアップロードに失敗しました');
      set('soundUrl', key);
      onError('');
      alert('アップロード完了。「保存」を押すと反映されます。');
    } catch (e) {
      onError(e instanceof Error ? e.message : 'アップロード失敗');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] text-titanium-500">{muffler.brandName}</p>
          <p className="font-bold">{muffler.name}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? '閉じる' : '編集'}
          </Btn>
        </div>
      </div>

      {open && (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ブランド">
              <input className={inputCls} value={form.brandName} onChange={(e) => set('brandName', e.target.value)} />
            </Field>
            <Field label="製品名">
              <input className={inputCls} value={form.name} onChange={(e) => set('name', e.target.value)} />
            </Field>
            <Field label="slug">
              <input className={inputCls} value={form.slug} onChange={(e) => set('slug', e.target.value)} />
            </Field>
            <Field label="タイプ（スリップオン / フルエキゾースト / 純正）">
              <input className={inputCls} value={form.productType} onChange={(e) => set('productType', e.target.value)} />
            </Field>
            <Field label="材質（例: チタン / ステンレス）">
              <input className={inputCls} value={form.material} onChange={(e) => set('material', e.target.value)} />
            </Field>
            <Field label="参考価格（円・数字のみ / 空欄可）">
              <input
                className={inputCls}
                inputMode="numeric"
                value={form.priceJpy}
                onChange={(e) => set('priceJpy', e.target.value.replace(/[^0-9]/g, ''))}
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.jmcaApproved} onChange={(e) => set('jmcaApproved', e.target.checked)} />
            <span>JMCA認証（車検対応の目安）</span>
          </label>

          <Field label="説明（任意）">
            <textarea
              className={`${inputCls} min-h-[70px]`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </Field>

          <div className="rounded-lg border border-asphalt-700 p-3">
            <p className="text-sm font-bold">音源（1マフラー1本）</p>
            <Field label="音源URL / S3キー">
              <input className={inputCls} value={form.soundUrl} onChange={(e) => set('soundUrl', e.target.value)} placeholder="sounds/... または https://..." />
            </Field>
            <div className="mt-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-asphalt-700 px-3 py-2 text-sm text-titanium-300 hover:border-burnt-500">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                />
                {uploading ? 'アップロード中…' : '音声ファイルをアップロード'}
              </label>
              <p className="mt-1 text-[11px] text-titanium-500">
                S3が未設定の場合は、URLを直接入力してください。
              </p>
            </div>
            <Field label="音源キャプション（任意）">
              <input className={inputCls} value={form.soundCaption} onChange={(e) => set('soundCaption', e.target.value)} />
            </Field>
          </div>

          <div className="flex gap-2">
            <Btn onClick={save} disabled={busy}>
              {busy ? '保存中…' : '保存'}
            </Btn>
            <Btn variant="danger" onClick={remove}>
              削除
            </Btn>
          </div>

          <AffiliateEditor muffler={muffler} reload={reload} onError={onError} />
        </div>
      )}
    </Card>
  );
}

function AffiliateEditor({
  muffler,
  reload,
  onError,
}: {
  muffler: Muffler;
  reload: () => Promise<void>;
  onError: (m: string) => void;
}) {
  const [vendor, setVendor] = useState<(typeof VENDORS)[number]>('AMAZON');
  const [url, setUrl] = useState('');
  const [isPrimary, setIsPrimary] = useState(muffler.affiliateLinks.length === 0);
  const [busy, setBusy] = useState(false);

  async function add() {
    if (!url) return;
    setBusy(true);
    try {
      await api('POST', '/api/admin/affiliates', { productId: muffler.id, vendor, url, isPrimary });
      setUrl('');
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    } finally {
      setBusy(false);
    }
  }

  async function setPrimary(a: Affiliate) {
    try {
      await api('PATCH', '/api/admin/affiliates', { id: a.id, isPrimary: true });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  async function remove(a: Affiliate) {
    try {
      await api('DELETE', '/api/admin/affiliates', { id: a.id });
      await reload();
    } catch (e) {
      onError(e instanceof Error ? e.message : 'エラー');
    }
  }

  return (
    <div className="rounded-lg border border-asphalt-700 p-3">
      <p className="text-sm font-bold">アフィリエイトリンク</p>
      <p className="mb-2 text-[11px] text-titanium-500">「メイン」が購入ボタン（CTA）になります。メインは1つだけ。</p>

      <div className="grid gap-2">
        {muffler.affiliateLinks.map((a) => (
          <div key={a.id} className="flex items-center gap-2 text-sm">
            <span className="w-16 shrink-0 font-mono text-xs text-titanium-300">{VENDOR_LABEL[a.vendor]}</span>
            <span className="min-w-0 flex-1 truncate text-titanium-500">{a.url}</span>
            {a.isPrimary ? (
              <span className="shrink-0 rounded bg-burnt-500 px-2 py-0.5 text-[10px] font-bold text-asphalt-950">メイン</span>
            ) : (
              <button type="button" onClick={() => setPrimary(a)} className="shrink-0 text-xs text-titanium-300 underline">
                メインにする
              </button>
            )}
            <button type="button" onClick={() => remove(a)} className="shrink-0 text-xs text-tacho">
              削除
            </button>
          </div>
        ))}
        {muffler.affiliateLinks.length === 0 && <p className="text-xs text-titanium-500">未登録</p>}
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-[auto_1fr_auto]">
        <select className={inputCls} value={vendor} onChange={(e) => setVendor(e.target.value as (typeof VENDORS)[number])}>
          {VENDORS.map((v) => (
            <option key={v} value={v}>
              {VENDOR_LABEL[v]}
            </option>
          ))}
        </select>
        <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <Btn onClick={add} disabled={busy || !url}>
          追加
        </Btn>
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs text-titanium-300">
        <input type="checkbox" checked={isPrimary} onChange={(e) => setIsPrimary(e.target.checked)} />
        メインCTAにする
      </label>
    </div>
  );
}
