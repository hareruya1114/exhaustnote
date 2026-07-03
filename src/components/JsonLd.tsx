export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD は信頼できる自前データのみを出力
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
