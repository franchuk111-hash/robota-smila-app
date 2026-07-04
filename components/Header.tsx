"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header({ employer = false }: { employer?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <header className="site">
      <div className="container nav">
        <Link href="/" className="logo">
          <span className="mark">
            <i></i><i></i><i></i><i></i>
          </span>{" "}
          robota-<b>smila</b>
        </Link>

        <div className="toggle">
          <Link href="/" className={employer ? "" : "active"}>Шукачам</Link>
          <Link href="/rabotodavtsyam" className={employer ? "active" : ""}>Роботодавцям</Link>
        </div>

        <form
          className="search"
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/vakansii?q=" + encodeURIComponent(q.trim()));
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук: продавець, водій, без досвіду…"
          />
        </form>

        <nav className="nav-links">
          <Link href="/vakansii">Вакансії</Link>
          <Link href="/kompanii">Компанії</Link>
          <Link href="/blog">Блог</Link>
        </nav>

        {session?.user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link href="/profil" className="user-chip">
              {session.user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" />
              ) : null}
              <span>{session.user.name?.split(" ")[0] || "Профіль"}</span>
            </Link>
            <button className="btn ghost" onClick={() => signOut({ callbackUrl: "/" })}>
              Вийти
            </button>
          </div>
        ) : (
          <Link href="/uvijty" className="btn">Увійти</Link>
        )}
      </div>
    </header>
  );
}
