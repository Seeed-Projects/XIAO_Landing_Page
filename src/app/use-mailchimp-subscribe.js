"use client";

import { useCallback, useState } from "react";

/**
 * useMailchimpSubscribe —— Mailchimp JSONP 内联订阅（无需后端、绕过 CORS）。
 * 拿到的是 XIAO 邮件列表的 embedded form 端点（u/id 来自 mailchi.mp 托管表单的 action）。
 * 提交时把 /post? 换成 /post-json? + &c=<回调>，作为 <script> 加载，
 * Mailchimp 回调 callback({result,msg})，据此判断成功/失败。
 */
const MC_U = "0c272aa6642cc5d058579205f";
const MC_ID = "2753109419";
const HONEYPOT = `b_${MC_U}_${MC_ID}`;
const MC_JSONP = `https://seeedstudio.us11.list-manage.com/subscribe/post-json?u=${MC_U}&id=${MC_ID}`;

// Mailchimp 返回的 msg 可能带 HTML 标签，错误信息里去掉标签再展示
function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/^\s*0\s*-\s*/, "")
    .trim();
}

export function useMailchimpSubscribe() {
  // status: idle | loading | success | error
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const subscribe = useCallback((email) => {
    setStatus("loading");
    setMessage("");
    return new Promise((resolve) => {
      const cb = `mc_cb_${Math.round(Math.random() * 1e9)}`;
      let scriptEl = null;
      let done = false;

      const cleanup = () => {
        if (scriptEl) {
          scriptEl.remove();
          scriptEl = null;
        }
        delete window[cb];
      };

      window[cb] = (data) => {
        if (done) return;
        done = true;
        cleanup();
        if (data && data.result === "success") {
          setStatus("success");
          setMessage(stripHtml(data.msg));
        } else {
          setStatus("error");
          setMessage(stripHtml((data && data.msg) || "") || "Subscription failed. Please try again.");
        }
        resolve(data);
      };

      const params = new URLSearchParams();
      params.append("EMAIL", email);
      params.append(HONEYPOT, ""); // honeypot 反机器人，必须留空
      params.append("subscribe", ""); // 模拟 submit 按钮

      scriptEl = document.createElement("script");
      scriptEl.onerror = () => {
        if (done) return;
        done = true;
        cleanup();
        setStatus("error");
        setMessage("Network error. Please try again later.");
        resolve(null);
      };
      scriptEl.src = `${MC_JSONP}&c=${cb}&${params.toString()}`;
      document.body.appendChild(scriptEl);

      // 超时兜底
      setTimeout(() => {
        if (done) return;
        done = true;
        cleanup();
        setStatus("error");
        setMessage("Request timed out. Please try again.");
        resolve(null);
      }, 15000);
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage("");
  }, []);

  return { status, message, subscribe, reset };
}
