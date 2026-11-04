// Compatibility entry point: use the same source deduplication and photo template.
// Never resend the latest five vacancies merely because they are recent.
import { runPipeline } from './vacancy-pipeline';
import fs from 'node:fs';
if ((!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) && fs.existsSync('.dev.vars')) process.loadEnvFile('.dev.vars');
runPipeline({dryRun: process.argv.includes('--dry-run')}).catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
