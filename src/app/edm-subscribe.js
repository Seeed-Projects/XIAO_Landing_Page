"use client";

import { useState } from "react";
import { withBase } from "../lib/basePath";

const SUBSCRIBE_URL = "https://mailchi.mp/seeed/xiao";

export function EdmSubscribe() {
  const [email, setEmail] = useState("");

  // 提交即跳转到 Mailchimp 订阅页（新标签打开）
  const onSubmit = (ev) => {
    ev.preventDefault();
    window.open(SUBSCRIBE_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="relative min-h-[500px] overflow-hidden bg-[#5d4c3e] bg-cover bg-center shadow-[0_12px_32px_rgba(31,42,48,.16)] sm:min-h-[560px]"
      style={{ backgroundImage: `url("${withBase("/home/xiao-newsletter-bg.jpeg")}")` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,28,31,.08)_0%,rgba(17,28,31,.14)_42%,rgba(17,28,31,.66)_100%)]" />
      <div
        className="relative z-10 ml-auto flex min-h-[500px] w-full items-center px-7 py-12 sm:min-h-[560px] sm:px-12 lg:w-[52%] lg:px-16"
      >
        <form onSubmit={onSubmit} noValidate className="w-full max-w-[660px]">
          <h3 className="text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">XIAO Newsletter</h3>
          <p className="mt-5 max-w-xl text-xl leading-[1.35] text-white sm:text-2xl">
            Bi-weekly updates on products, Projects,<br className="hidden sm:block" /> news, early adopter program and more
          </p>
          <div className="mt-10 flex items-center gap-3 rounded-xl border-2 border-black/55 bg-white/70 px-5 py-4 backdrop-blur-[2px] focus-within:bg-white/85 sm:px-7 sm:py-5">
            <svg className="h-6 w-6 shrink-0 text-[#667883]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3 7 12 13 21 7" />
            </svg>
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              placeholder="Your email here"
              aria-label="Your email here"
              className="min-w-0 flex-1 bg-transparent text-xl text-black outline-none placeholder:text-black/90 sm:text-2xl"
            />
          </div>
          <button type="submit" className="mt-8 inline-flex min-w-[250px] items-center justify-center rounded-full bg-[#9dce35] px-12 py-4 text-xl font-bold text-black transition hover:bg-[#8abd26] sm:text-2xl">
            Subscribe
          </button>
        </form>
      </div>
    </div>
  );
}
