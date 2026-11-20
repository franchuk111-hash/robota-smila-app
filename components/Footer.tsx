"use client";
import { usePathname } from "next/navigation";
import { getOutboundHref, OUTBOUND_DESTINATIONS, OUTBOUND_REL } from "@/lib/outbound-links";
import Link from "next/link";
import Emblem from "./Emblem";
import { IconTikTok, IconYouTube, IconTelegram } from "./SocialIcons";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";

export default function Footer() {
  const pathname = usePathname();
  return (
    <footer className="site">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-wordmark">
              <Emblem size={40} />
              <span>Робота <b>Сміла</b></span>
            </div>
            <p>Знайди роботу в Смілі. Розвивай місто разом із нами.</p>
          </div>
          <div className="footer-connect">
            <a
              className="footer-channel"
              href={getOutboundHref(OUTBOUND_DESTINATIONS["telegram-channel"], pathname)}
              target="_blank"
              rel={OUTBOUND_REL}
              onClick={() => trackEvent(GA4_EVENTS.TELEGRAM_SUBSCRIBE, { source: "footer" })}
            >
              <IconTelegram size={32} />
              <span>Вакансії в Telegram<small>@robota_smila</small></span>
              <span aria-hidden="true">↗</span>
            </a>
            <div className="socials">
              <a className="soc" href={getOutboundHref("https://www.tiktok.com/@robota_smila")} target="_blank" rel={OUTBOUND_REL} aria-label="TikTok">
                <IconTikTok size={28} />
              </a>
              <a className="soc" href={getOutboundHref("https://www.youtube.com/@Robota-smila")} target="_blank" rel={OUTBOUND_REL} aria-label="YouTube">
                <IconYouTube size={28} />
              </a>
            </div>
          </div>
        </div>
        <div className="fcols">
          <div>
            <h4>Шукачам</h4>
            <Link href="/vakansii">Всі вакансії</Link>
            <Link href="/robota-bez-dosvidu">Робота без досвіду</Link>
            <Link href="/pidrobitok">Підробіток у Смілі</Link>
            <Link href="/robota-dlya-studentiv">Робота для студентів</Link>
            <Link href="/terminovi-vakansii">Термінові вакансії</Link>
            <Link href="/robota-z-shchodennoyu-oplatoyu">Робота з щоденною оплатою</Link>
            <Link href="/rezume">Приклад резюме</Link>
            <Link href="/zarplatomir">Зарплатомір</Link>
            <Link href="/kalendar">Виробничий календар</Link>
            <Link href="/start-kariery">Старт кар&apos;єри</Link>
          </div>
          <div>
            <h4>Роботодавцям</h4>
            <Link href="/rabotodavtsyam">Розмістити вакансію</Link>
            <Link href="/kompanii">Каталог компаній</Link>
          </div>
          <div>
            <h4>Інформація</h4>
            <Link href="/pro-proiekt">Про проєкт</Link>
            <Link href="/aktsiya">🎁 Розіграш для підписників</Link>
            <Link href="/blog">Блог</Link>
            <a
              href={getOutboundHref("https://t.me/Smila_admin", pathname)}
              target="_blank"
              rel={OUTBOUND_REL}
            >
              Зв&apos;язок: @Smila_admin
            </a>
            <a
              href="https://search.google.com/local/writereview?placeid=ChIJiU080ehB0UARKN0Knb2MH4A"
              target="_blank"
              rel="noopener noreferrer"
            >
              ⭐ Залишити відгук на Google
            </a>
          </div>
          <div>
            <h4>Правова інформація</h4>
            <Link href="/polityka-konfidentsiynosti">Політика конфіденційності</Link>
            <Link href="/umovy-korystuvannya">Умови користування</Link>
            <Link href="/polityka-cookie">Політика cookie</Link>
          </div>
        </div>
        <div className="fbottom">
          © 2026 robota-smila.com.ua — Робота у Смілі. Всі права захищені.
          <br />
          Сайт є інформаційним посередником і не є стороною трудових відносин.
        </div>
      </div>
    </footer>
  );
}
