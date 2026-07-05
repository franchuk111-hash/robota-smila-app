"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import Emblem from "./Emblem";

export default function Header({ employer = false }: { employer?: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/vakansii?q=" + encodeURIComponent(q.trim()));
  };

  return (
    <header className={"site" + (scrolled ? " scrolled" : "")}>
      <div className="container nav">
        <Link href="/" className="logo" onClick={() => setMenu(false)}>
          <Emblem size={38} />
          <span className="word">Робота&nbsp;<b>Сміла</b></span>
        </Link>

        <div className="toggle">
          <Link href="/" className={employer ? "" : "active"}>Шукачам</Link>
          <Link href="/rabotodavtsyam" className={employer ? "active" : ""}>Роботодавцям</Link>
        </div>

        <form className="search" onSubmit={go}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Пошук: продавець, водій, без досвіду…"
          />
        </form>

        <nav className="nav-links">
          <Link href="/vakansii">Вакансії</Link>
          <Link href="/kompanii">Компанії</Link>
          <Link href="/rezume">Резюме</Link>
          <Link href="/blog">Блог</Link>
        </nav>

        {session?.user ? (
          <div className="hdr-auth">
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
          <Link href="/uvijty" className="btn hdr-login">Увійти</Link>
        )}

        <button
          className="burger"
          aria-label="Меню"
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
        >
          {menu ? "✕" : "☰"}
        </button>
      </div>

      <AnimatePresence>
        {menu && (
          <motion.nav
            className="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMenu(false)}
          >
            <Link href="/vakansii">Вакансії</Link>
            <Link href="/kompanii">Компанії</Link>
            <Link href="/rezume">Резюме</Link>
            <Link href="/zarplatomir">Зарплатомір</Link>
            <Link href="/kalendar">Виробничий календар</Link>
            <Link href="/blog">Блог</Link>
            <Link href="/rabotodavtsyam">Роботодавцям</Link>
            {session?.user ? (
              <>
                <Link href="/profil">Профіль</Link>
                <button className="btn ghost" onClick={() => signOut({ callbackUrl: "/" })}>
                  Вийти
                </button>
              </>
            ) : (
              <Link href="/uvijty" className="btn">Увійти</Link>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
