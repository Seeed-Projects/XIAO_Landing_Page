"use client";

import Script from "next/script";
import { useEffect } from "react";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || "";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
const VALID_GTM_ID = /^GTM-[A-Z0-9]+$/i.test(GTM_ID) ? GTM_ID : "";
const VALID_GA_ID = /^G-[A-Z0-9]+$/i.test(GA_ID) ? GA_ID : "";
const CLICKABLE_SELECTOR = [
  "button",
  "a[href]",
  "[role='button']",
  "input[type='button']",
  "input[type='submit']",
  "input[type='reset']",
  "summary",
].join(",");

function cleanText(value, fallback = "unknown") {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  return (normalized || fallback).slice(0, 120);
}

function elementLabel(element) {
  const imageAlt = element.querySelector?.("img[alt]")?.getAttribute("alt");
  return cleanText(
    element.dataset.trackLabel ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      element.value ||
      element.textContent ||
      imageAlt ||
      element.getAttribute("name") ||
      element.id
  );
}

function destinationFor(element) {
  const href = element.getAttribute("href");
  if (!href) return "";
  if (/^(mailto|tel):/i.test(href)) return href.split(":", 1)[0].toLowerCase();
  try {
    const url = new URL(href, window.location.href);
    return `${url.origin}${url.pathname}${url.hash}`.slice(0, 300);
  } catch {
    return href.slice(0, 300);
  }
}

function sectionFor(element) {
  const owner = element.closest("[data-track-section], section[id], header[id], footer[id], aside[id], nav[aria-label], main[id]");
  return cleanText(
    owner?.dataset.trackSection || owner?.id || owner?.getAttribute("aria-label"),
    "page"
  );
}

function sendClickEvent(element, frameTitle = "") {
  if (
    element.matches(":disabled") ||
    element.getAttribute("aria-disabled") === "true" ||
    element.closest("[data-track-ignore]")
  ) return;

  const destination = destinationFor(element);
  const label = elementLabel(element);
  const section = sectionFor(element);
  const params = new URLSearchParams(window.location.search);
  const payload = {
    interaction_id: cleanText(element.dataset.trackId || `${section}:${label}`),
    interaction_label: label,
    interaction_type: element.tagName.toLowerCase() === "a" ? "link" : "button",
    section_id: section,
    destination,
    outbound: destination ? !destination.startsWith(window.location.origin) : false,
    opens_new_tab: element.getAttribute("target") === "_blank",
    page_path: window.location.pathname,
    page_title: document.title,
    page_language: document.documentElement.lang || "en",
    frame_title: cleanText(frameTitle, "top"),
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
  };

  window.dispatchEvent(new CustomEvent("xiao:analytics", {
    detail: { event: "xiao_click", ...payload },
  }));

  if (typeof window.gtag === "function" && !VALID_GTM_ID) {
    window.gtag("event", "xiao_click", payload);
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "xiao_click", ...payload });
}

export function InteractionAnalytics() {
  useEffect(() => {
    const registeredDocuments = new WeakSet();
    const registeredFrames = new WeakSet();
    const cleanups = [];

    const registerDocument = (targetDocument, frameTitle = "") => {
      if (!targetDocument || registeredDocuments.has(targetDocument)) return;
      registeredDocuments.add(targetDocument);
      const onClick = (event) => {
        const target = event.target instanceof Element ? event.target.closest(CLICKABLE_SELECTOR) : null;
        if (target) sendClickEvent(target, frameTitle);
      };
      targetDocument.addEventListener("click", onClick, true);
      cleanups.push(() => targetDocument.removeEventListener("click", onClick, true));
    };

    const registerFrame = (frame) => {
      if (registeredFrames.has(frame)) return;
      registeredFrames.add(frame);
      const attach = () => {
        try {
          registerDocument(frame.contentDocument, frame.title || frame.getAttribute("aria-label") || "iframe");
        } catch {
          // Cross-origin frames cannot be inspected; their provider owns those interactions.
        }
      };
      frame.addEventListener("load", attach);
      cleanups.push(() => frame.removeEventListener("load", attach));
      attach();
    };

    registerDocument(document);
    document.querySelectorAll("iframe").forEach(registerFrame);

    const observer = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches("iframe")) registerFrame(node);
        node.querySelectorAll?.("iframe").forEach(registerFrame);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <>
      {VALID_GTM_ID && (
        <Script id="xiao-gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${VALID_GTM_ID}');`}
        </Script>
      )}
      {!VALID_GTM_ID && VALID_GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${VALID_GA_ID}`} strategy="afterInteractive" />
          <Script id="xiao-ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${VALID_GA_ID}');`}
          </Script>
        </>
      )}
    </>
  );
}
