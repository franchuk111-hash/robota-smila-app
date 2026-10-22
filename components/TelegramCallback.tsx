'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { signIn } from 'next-auth/react';
import { completeTelegramCallback } from '@/lib/telegram-callback';

export default function TelegramCallback() {
  const started = useRef(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void completeTelegramCallback(
      window.location.href,
      path => window.history.replaceState(null, '', path),
      payload => signIn('telegram', { payload, redirect: false }),
      path => window.location.replace(path),
    ).then(ok => { if (!ok) setFailed(true); });
  }, []);
  return (
    <main className="container">
      <div className="auth-card">
        <h1>Вхід через Telegram</h1>
        <p role="status">{failed ? 'Не вдалося підтвердити вхід. Спробуйте ще раз.' : 'Підтверджуємо вхід…'}</p>
        {failed && <Link className="btn" href="/uvijty">Повернутися до входу</Link>}
      </div>
    </main>
  );
}
