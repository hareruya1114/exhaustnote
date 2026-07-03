import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const region = process.env.AWS_REGION || 'ap-northeast-1';
const bucket = process.env.S3_BUCKET || '';

let client: S3Client | null = null;
function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }
  return client;
}

export function isS3Configured(): boolean {
  return Boolean(bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

/**
 * 音源アップロード用のプリサインドPUT URLを発行する。
 * key はS3上のオブジェクトキー（そのままDBの soundUrl に保存し、CDN_BASE と組み合わせて配信）。
 */
export async function createUploadUrl(params: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string; key: string }> {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });
  const uploadUrl = await getSignedUrl(getClient(), cmd, { expiresIn: 600 });
  return { uploadUrl, key: params.key };
}
