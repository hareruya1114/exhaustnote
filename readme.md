ExhaustNote
バイクのマフラー排気音メディアサイト。メーカー → 車種 → マフラーとドリルダウンし、各マフラーの専用ページで**実際の排気音（1製品1音源）**を聴けます。SEO重視・日本語UI。
Next.js 14（App Router）/ TypeScript
Prisma + PostgreSQL
NextAuth（Credentials）による管理画面
音源は S3 + CloudFront 配信（管理画面からプリサインドURLで直接アップロード）
セットアップ（ローカル開発）
前提: Node.js 18.18 以上、稼働中の PostgreSQL。
# 1. 依存関係
npm install

# 2. 環境変数（.env.example をコピーして値を設定）
cp .env.example .env
#   最低限: DATABASE_URL / NEXTAUTH_SECRET / ADMIN_EMAIL / ADMIN_PASSWORD

# 3. DBスキーマを反映
npm run db:push

# 4. 初期データ投入（管理者 + Kawasaki Ninja 400 + マフラー3種）
npm run db:seed

# 5. 開発サーバー起動
npm run dev
公開サイト: http://localhost:3000
管理画面: http://localhost:3000/admin （.env の ADMIN_EMAIL / ADMIN_PASSWORD でログイン）
ビルド（npm run build）とホーム等の静的生成は DBに接続できる状態で実行してください。DBが無い場合、generateStaticParams は空配列にフォールバックし、各ページはリクエスト時に描画されます（ISR）。
URL 構成（ドリルダウン）
URL
内容
ISR
/
メーカー一覧
24h
/[manufacturer]
車種一覧（例 /kawasaki）
24h
/[manufacturer]/[bike]
マフラー一覧（例 /kawasaki/ninja-400）
24h
/[manufacturer]/[bike]/[muffler]
マフラー専用ページ・排気音（例 /kawasaki/ninja-400/yoshimura-r77s）
12h
/admin
管理画面（noindex・要ログイン）
—
/sitemap.xml, /robots.txt
SEO
—
比較機能・回転数ごとの音源分割・音の特徴スコアは持ちません。1マフラー = 1ページ = 1音源です。
管理画面でできること
/admin から、コードを触らずに以下を操作できます。
メーカータブ: 追加 / 名称・slug 変更 / 削除
車種タブ: メーカーを選んで 追加 / 変更 / 削除
マフラー / 音源タブ: メーカー・車種を選んで
マフラーの追加・削除
製品スペック変更（ブランド / 製品名 / slug / タイプ / 材質 / 参考価格 / JMCA(車検) / 説明）
音源のアップロード（S3へ直接PUT）または 音源URLの直接入力・差し替え
アフィリエイトリンク（Amazon / 楽天 / Webike）の登録・削除、メインCTAの切替（メインは1つ）
保存すると該当ページの ISR が自動で再検証され、公開ページに反映されます。
本番構成（AWS 想定）
DB: Aurora Serverless v2 (PostgreSQL) → DATABASE_URL
音源配信: S3（非公開バケット）+ CloudFront
CDN_HOSTNAME: CloudFrontのホスト名（例 media.exhaustnote.com）
NEXT_PUBLIC_CDN_BASE: 音源のベースURL（例 https://media.exhaustnote.com）
アップロード: 管理画面 → /api/admin/upload がプリサインドPUT URLを発行 → ブラウザから直接S3へPUT。DBにはS3キーを soundUrl として保存し、公開側で NEXT_PUBLIC_CDN_BASE と結合して配信します。
必要な環境変数: AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / S3_BUCKET
S3側で、管理者オリジンからの PUT を許可する CORS 設定が必要です。
オンデマンド再検証: /api/revalidate に x-revalidate-secret: $REVALIDATE_SECRET ヘッダ付きで {"paths":["/kawasaki/ninja-400"]} をPOST（paths 省略時は全再検証）。
主なコマンド
コマンド
内容
npm run dev
開発サーバー
npm run build
prisma generate + 本番ビルド
npm start
本番サーバー
npm run db:push
スキーマをDBへ反映
npm run db:seed
初期データ投入
ディレクトリ構成（抜粋）
prisma/            schema.prisma / seed.ts
src/lib/           prisma / auth / queries / jsonld / site / admin / s3
src/app/           公開ページ(ドリルダウン) / admin / api
src/components/    SoundPlayer / AffiliateCTA / SelectCard / Breadcrumbs / AdminDashboard
注意点
seedの音源URL・アフィリエイトURLはサンプルです。実運用では管理画面から差し替えてください。
車検適合（JMCA）は目安です。年式・保安基準により異なります。
