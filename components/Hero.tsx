import StatsMotion from "./StatsMotion";
import SubscribeCTA from "./SubscribeCTA";
import HeroPhoneVideo from "./HeroPhoneVideo";

export default function Hero({ vacancyCount, companyCount }: { vacancyCount: number; companyCount: number }) {
  return (
    <section className="home-hero" aria-labelledby="home-heading">
      <div className="home-hero-grid">
        <div className="home-hero-copy">
          <h1 id="home-heading" className="home-hero-title">Робота <span>у Смілі</span></h1>
          <p className="home-hero-intro">Порівнюйте вакансії, зарплати та графіки. Оберіть пропозицію й дізнайтеся, як зв’язатися з роботодавцем.</p>
          <form className="home-hero-search" action="/vakansii" method="get" role="search">
            <label className="home-hero-field">
              <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" />
              </svg>
              <input type="search" name="q" aria-label="Пошук вакансій" placeholder="Посада чи компанія" />
            </label>
            <button type="submit" aria-label="Знайти вакансію">Знайти<span className="home-hero-search-object"> вакансію</span></button>
          </form>
          <div className="home-hero-subscribe">
            <SubscribeCTA source="homepage_hero" label="Підписатись у Telegram" />
          </div>
          <StatsMotion vacancyCount={vacancyCount} companyCount={companyCount} />
        </div>
        <div className="home-hero-stage">
          <HeroPhoneVideo />
        </div>
      </div>
    </section>
  );
}
