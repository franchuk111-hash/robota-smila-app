// Prefer the occupation to the employer's industry: a supermarket loader is not a cashier.
export function vacancyCategory(title: string, industry = ''): { cat: string; catName: string } {
  const rules: Array<[RegExp, string, string]> = [
    [/(?:^|[^\p{L}])(?:воді(?:й|я|єві|єм|ї|їв|ям|ями|ях)|водитель)(?=$|[^\p{L}])/u, 'voditel', 'Водії'],
    [/продав|касир/, 'prodavets', 'Продавці / касири'],
    [/будівельн.*робіт|муляр|покрів|плиточ|фасад|маляр|штукатур/, 'budivnyctvo', 'Будівництво'],
    [/вантаж|швач|звар|слюсар|електромонт|пакув|комірник|оператор.*(ліні|вироб)|робіт|різнороб/, 'robitnyk', 'Робітники / виробництво'],
    [/кухар|офіціант|бариста|пекар/, 'horeca', 'Кафе / ресторани'],
    [/охорон|сторож/, 'ohorona', 'Охорона'],
    [/муляр|покрів|будівель|маляр|штукатур/, 'budivnyctvo', 'Будівництво'],
    [/менедж|[bв]2[bв]|торгов.*представ|представ.*торгов|фахівець.*продаж|спеціаліст.*продаж|бухгалтер|юрист|економіст/, 'office', 'Офіс / фінанси'],
  ];
  const match = rules.find(([pattern]) => pattern.test(title.toLowerCase()));
  if (match) return { cat: match[1], catName: match[2] };
  const fallback: Array<[RegExp, string, string]> = [
    [/вироб|промис/, 'robitnyk', 'Робітники / виробництво'],
    [/ресторан|кафе|horeca/, 'horeca', 'Кафе / ресторани'],
    [/будів|ремонт/, 'budivnyctvo', 'Будівництво'],
    [/офіс|фінанс|банк/, 'office', 'Офіс / фінанси'],
  ];
  const branch = fallback.find(([pattern]) => pattern.test(industry.toLowerCase()));
  return branch ? { cat: branch[1], catName: branch[2] } : { cat: 'other', catName: 'Інше' };
}
