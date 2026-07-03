import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { authOptions } from '@/lib/auth';

// APIルート内で管理者セッションを検証する。未認証なら false。
export async function isAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return Boolean(session);
}

// 公開ページをまとめて再検証（ルートレイアウト配下すべて）。
export function revalidateAll() {
  revalidatePath('/', 'layout');
}
