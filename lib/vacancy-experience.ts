/** Infer an explicit requirement; absence of evidence remains unknown. */
export function inferRequiredExperience(text: string): boolean | undefined {
  if (/без\s+досвіду|досвід\s+(?:роботи\s+)?не\s+(?:обов[’'ʼ]?язков|потріб|вимага)|досвід\s+(?:роботи\s+)?(?:вітається|бажан)/iu.test(text)) return false;
  if (/(?:потрібен|необхідний|обов[’'ʼ]?язковий)\s+досвід|досвід\s+(?:роботи\s+)?(?:від\s+\d|\d+|обов[’'ʼ]?язков|потріб|необхід)|з\s+досвідом/iu.test(text)) return true;
  return undefined;
}
