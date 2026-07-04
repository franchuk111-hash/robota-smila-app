"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VacCard from "@/components/VacCard";
import { getFavorites } from "@/components/FavButton";
import { VACANCIES } from "@/lib/data";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [favIds, setFavIds] = useState<number[]>([]);
  useEffect(() => setFavIds(getFavorites()), []);

  const saved = VACANCIES.filter((v) => favIds.includes(v.id));

  return (
    <>
      <Header />
      <div className="container">
        <nav className="crumbs">
          <Link href="/">Головна</Link> › Профіль
        </nav>

        {status === "loading" ? (
          <p className="sub">Завантаження…</p>
        ) : session?.user ? (
          <>
            <div className="detail" style={{ marginBottom: 26 }}>
              <div className="user-chip" style={{ fontSize: 22 }}>
                {session.user.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="" style={{ width: 54, height: 54 }} />
                )}
                <div>
                  <div>{session.user.name}</div>
                  {session.user.email && (
                    <div style={{ color: "var(--muted)", fontSize: 15, fontWeight: 400 }}>
                      {session.user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <h2 className="title" style={{ fontSize: 26 }}>
              Збережені вакансії ({saved.length})
            </h2>
            {saved.length ? (
              <div className="grid3">
                {saved.map((v) => (
                  <VacCard key={v.id} v={v} />
                ))}
              </div>
            ) : (
              <p className="sub">
                Ви ще не зберегли жодної вакансії. Натискайте ♡ на картці вакансії, щоб
                додати її сюди.
              </p>
            )}
          </>
        ) : (
          <div className="auth-card">
            <h1>Потрібен вхід</h1>
            <p>Увійдіть, щоб побачити свій профіль і збережені вакансії.</p>
            <button className="btn" onClick={() => signIn(undefined, { callbackUrl: "/profil" })}>
              Увійти
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
