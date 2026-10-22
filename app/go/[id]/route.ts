import { getOutboundDestination, isTelegramDestination, normalizeSource, telegramTrackedDestination } from "@/lib/outbound-links";
import { ALL_VACANCIES } from "@/lib/data";

export const dynamic = "force-dynamic";

const headers = {
  "Cache-Control": "no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "Referrer-Policy": "no-referrer",
};

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let destination = getOutboundDestination(id);
  const source = /^source-([1-9]\d{0,15})$/.exec(id);
  if (source) {
    const record = ALL_VACANCIES.find((vacancy) => String(vacancy.id) === source[1]);
    if (record?.sourceUrl) {
      try {
        const url = new URL(record.sourceUrl);
        if (url.protocol === "https:" && !url.username && !url.password && !url.port &&
          ["www.work.ua", "robota.ua", "www.dcz.gov.ua"].includes(url.hostname)) {
          destination = url.href;
        }
      } catch { /* Invalid source records cannot become redirects. */ }
    }
  }
  if (!destination) return new Response("Not found", { status: 404, headers });
  if (isTelegramDestination(destination)) {
    const query = new URL(request.url).searchParams;
    const suppliedToken = query.get("rtk") ?? "";
    const token = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(suppliedToken)
      ? suppliedToken : crypto.randomUUID();
    destination = telegramTrackedDestination(destination, normalizeSource(query.get("s") ?? "unknown"), token);
  }
  return new Response(null, { status: 302, headers: { ...headers, Location: destination } });
}

export const HEAD = GET;
