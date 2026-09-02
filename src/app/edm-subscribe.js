"use client";

import { useCallback, useRef, useState } from "react";
import { withBase } from "../lib/basePath";

// Mailchimp JSONP endpoint —— 页面内提交，无需跳转
const MC_URL =
  "https://seeedstudio.us11.list-manage.com/subscribe/post-json?u=0c272aa6642cc5d058579205f&id=2753109419";

function stripHtml(html) {
  if (typeof window === "undefined") return String(html || "");
  const div = document.createElement("div");
  div.innerHTML = String(html || "");
  return (div.textContent || div.innerText || "").trim();
}

export function EdmSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");
  const cbCounter = useRef(0);

  const onSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      const value = email.trim();
      if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setStatus("error");
        setMsg("Please enter a valid email address.");
        return;
      }
      setStatus("loading");
      setMsg("");

      const cbName = `__mcCb_${Date.now()}_${cbCounter.current++}`;
      const script = document.createElement("script");
      let settled = false;

      const cleanup = () => {
        try {
          delete window[cbName];
        } catch {
          window[cbName] = undefined;
        }
        if (script.parentNode) script.parentNode.removeChild(script);
      };

      window[cbName] = (data) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (data && data.result === "success") {
          setStatus("success");
          setMsg(stripHtml(data.msg));
        } else {
          setStatus("error");
          setMsg(stripHtml((data && data.msg) || "Subscription failed, please try again."));
        }
      };

      // 兜底：15s 超时
      setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        setStatus("error");
        setMsg("Network is a bit slow, please try again.");
      }, 15000);

      const params = new URLSearchParams();
      params.set("EMAIL", value);
      params.set("gdpr[266]", "Y"); // Email 营销同意（GDPR 必填）
      params.set("b_0c272aa6642cc5d058579205f_2753109419", ""); // honeypot
      script.src = `${MC_URL}&c=${cbName}&${params.toString()}`;
      script.async = true;
      document.body.appendChild(script);
    },
    [email]
  );

  const reset = () => {
    setStatus("idle");
    setMsg("");
    setEmail("");
  };

  return (
    <div
      className="relative min-h-[500px] overflow-hidden bg-[#5d4c3e] bg-cover bg-center shadow-[0_12px_32px_rgba(31,42,48,.16)] sm:min-h-[560px]"
      style={{ backgroundImage: `url("${withBase("/home/xiao-newsletter-bg.jpeg")}")` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,28,31,.08)_0%,rgba(17,28,31,.14)_42%,rgba(17,28,31,.66)_100%)]" />
      <div className="relative z-10 ml-auto flex min-h-[500px] w-full items-center px-7 py-12 sm:min-h-[560px] sm:px-12 lg:w-[52%] lg:px-16">
        <div className="w-full max-w-[660px]">
          <h3 className="text-4xl font-bold tracking-[-0.02em] text-white sm:text-5xl">XIAO Newsletter</h3>
          <p className="mt-5 max-w-xl text-xl leading-[1.35] text-white sm:text-2xl">
            Bi-weekly updates on products, Projects,<br className="hidden sm:block" /> news, early adopter program and more
          </p>

          {status === "success" ? (
            <div className="mt-10 rounded-xl border-2 border-black/55 bg-white/85 px-5 py-6 backdrop-blur-[2px] sm:px-7">
              <p className="text-2xl font-bold text-black sm:text-3xl">🎉 You&apos;re subscribed!</p>
              <p className="mt-2 text-base leading-7 text-black/80 sm:text-lg">
                {msg || "Almost done — check your inbox to confirm your subscription."}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-5 inline-flex items-center rounded-full bg-[#9dce35] px-8 py-3 text-base font-bold text-black transition hover:bg-[#8abd26]"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="mt-10">
              <div className="flex items-center gap-3 rounded-xl border-2 border-black/55 bg-white/70 px-5 py-4 backdrop-blur-[2px] focus-within:bg-white/85 sm:px-7 sm:py-5">
                <svg className="h-6 w-6 shrink-0 text-[#667883]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <polyline points="3 7 12 13 21 7" />
                </svg>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(ev) => {
                    setEmail(ev.target.value);
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="Your email here"
                  aria-label="Your email here"
                  disabled={status === "loading"}
                  className="min-w-0 flex-1 bg-transparent text-xl text-black outline-none placeholder:text-black/90 disabled:opacity-60 sm:text-2xl"
                />
              </div>
              {status === "error" && msg && (
                <p className="mt-3 text-sm font-medium text-[#ffd9d9] sm:text-base">{msg}</p>
              )}
              <p className="mt-3 text-xs leading-5 text-white/70 sm:text-sm">
                By subscribing you agree to receive emails from Seeed Studio. You can unsubscribe at any time.
              </p>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-6 inline-flex min-w-[250px] items-center justify-center rounded-full bg-[#9dce35] px-12 py-4 text-xl font-bold text-black transition hover:bg-[#8abd26] disabled:cursor-not-allowed disabled:opacity-60 sm:text-2xl"
              >
                {status === "loading" ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
