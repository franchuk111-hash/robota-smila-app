const BASE = "https://robota-smila.com.ua";

// JSON-LD BreadcrumbList для сторінок із хлібними крихтами
export default function BreadcrumbLd({
  items,
}: {
  items: { name: string; path?: string }[];
}) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: BASE + it.path } : {}),
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
