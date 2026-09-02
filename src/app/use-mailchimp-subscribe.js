"use client";

import { useCallback, useRef, useState } from "react";

// Mailchimp JSONP endpoint —— 页面内提交，无需跳转
const MC_URL =
  "https://seeedstudio.us11.list-manage.com/subscribe/post-json?u=0c272aa6642cc5d058579205f&id=2753109419";

function stripHtml(html) {
  if (typeof window === "undefined") return String(html || "");
  const div = document.createElement("div");
  div.innerHTML = String(html || "");
  return (div.textContent || div.innerText || "").trim();
}

/**
 * useMailchimpSubscribe —— 在页面内通过 Mailchimp JSONP 完成订阅，不跳转。
 * 返回 { email, setEmail, status, msg, submit, reset }
 * submit 接受可选的 consent 布尔（GDPR gdpr[266]），默认 true
 */
export function useMailchimpSubscribe() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [msg, setMsg] = useState("");
  const cbCounter = useRef(0);

  const submit = useCallback(
    (ev, { consent = true } = {}) => {
      ev?.preventDefault?.();
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

      setTimeout(() => {
        if (settled) return;
        settled = true;
        cleanup();
        setStatus("error");
        setMsg("Network is a bit slow, please try again.");
      }, 15000);

      const params = new URLSearchParams();
      params.set("EMAIL", value);
      if (consent) params.set("gdpr[266]", "Y"); // Email 营销同意（GDPR 必填）
      params.set("b_0c272aa6642cc5d058579205f_2753109419", ""); // honeypot
      script.src = `${MC_URL}&c=${cbName}&${params.toString()}`;
      script.async = true;
      document.body.appendChild(script);
    },
    [email]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setMsg("");
    setEmail("");
  }, []);

  return { email, setEmail, status, msg, submit, reset };
}
