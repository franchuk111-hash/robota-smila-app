import type { Metadata } from 'next';
import TelegramCallback from '@/components/TelegramCallback';

export const metadata: Metadata = {
  title: 'Вхід через Telegram — Робота Сміла',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default function TelegramCallbackPage() {
  return <TelegramCallback />;
}
