import { CATEGORIES } from "@/lib/data";

export default function StatsMotion({ vacancyCount, companyCount }: { vacancyCount: number; companyCount: number }) {
  return (
    <dl className="home-hero-stats" aria-label="Статистика добірки">
      {[[vacancyCount, "вакансій у добірці"], [companyCount, "роботодавців у добірці"], [CATEGORIES.length, "категорій вакансій"]].map(([value, label]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
