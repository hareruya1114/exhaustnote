import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/admin';
import { createUploadUrl, isS3Configured } from '@/lib/s3';

export const dynamic = 'force-dynamic';

const schema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  bikeSlug: z.string().max(120).optional(),
  mufflerSlug: z.string().max(120).optional(),
});

function safeName(name: string): string {
  const ext = name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '';
  const base = name
    .slice(0, name.length - ext.length)
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .slice(0, 60);
  return `${base || 'audio'}${ext}`;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  if (!isS3Configured()) {
    return NextResponse.json(
      { error: 'S3が未設定です。.env の AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / S3_BUCKET を設定してください。' },
      { status: 400 },
    );
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const dir = ['sounds', parsed.data.bikeSlug, parsed.data.mufflerSlug].filter(Boolean).join('/');
  const key = `${dir}/${Date.now()}-${safeName(parsed.data.fileName)}`;

  try {
    const { uploadUrl } = await createUploadUrl({ key, contentType: parsed.data.contentType });
    // key を soundUrl として保存すれば、公開側で CDN_BASE と結合して配信される
    return NextResponse.json({ uploadUrl, key });
  } catch {
    return NextResponse.json({ error: 'アップロードURLの発行に失敗しました' }, { status: 500 });
  }
}
