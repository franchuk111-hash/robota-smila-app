"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TelegramLogin from "@/components/TelegramLogin";
import Emblem from "@/components/Emblem";

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="container">
        <div className="auth-card">
          <div className="brand" style={{ justifyContent: "center", marginBottom: 22 }}>
            <Emblem size={56} />
            <div className="txt">
              <span className="wm">Робота <b>Сміла</b></span>
              <span className="brand-tag">Знайди роботу в Смілі. Розвивай місто разом із нами.</span>
            </div>
          </div>
          <h1>Вхід та реєстрація</h1>
          <p>Увійдіть, щоб зберігати вакансії та швидко відгукуватися</p>

          <button className="auth-btn" onClick={() => signIn("google", { callbackUrl: "/" })}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.4 30.2 0 24 0 14.6 0 6.4 5.4 2.5 13.3l7.8 6.1C12.2 13.2 17.6 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.5z"/>
              <path fill="#FBBC05" d="M10.3 28.6c-.5-1.4-.7-2.9-.7-4.6s.3-3.2.7-4.6l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.5 10.7l7.8-6.1z"/>
              <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.1 2.2-6.4 0-11.8-3.7-13.7-9.9l-7.8 6.1C6.4 42.6 14.6 48 24 48z"/>
            </svg>
            Продовжити з Google
          </button>

          <TelegramLogin />

          <p style={{ fontSize: 13, marginTop: 20, marginBottom: 0 }}>
            Реєструючись, ви погоджуєтесь з умовами використання сайту.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
