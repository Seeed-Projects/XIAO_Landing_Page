"use client";

import { useEffect, useRef, useState } from "react";
import { homepageSections } from "./site-data";
import { useLang } from "./i18n";
import { partnerLogoSizes, partnerLoop } from "./partner-marquee-layout.mjs";

function PartnerLogo({ partner }) {
  const [failed, setFailed] = useState(false);
  const src = partner.logo || `https://favicon.yandex.net/favicon/${new URL(partner.url).host}`;
  const [width, height] = partnerLogoSizes[partner.name] || [34, 34];

  return (
    <span className="partner-brand" data-long-name={partner.name.length > 15}>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="eager"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ width, height }}
          className="partner-logo"
        />
      )}
      {(!partner.wordmark || failed) && <span className="partner-name">{partner.name}</span>}
    </span>
  );
}

// Each half contains the same full cycles, including the trailing spacing.
// 两段轨道包含相同的完整循环及尾部间距。
function PartnerRow({ group, label, index }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const duration = group.partners.length * partnerLoop.copiesPerHalf * partnerLoop.slotWidth / partnerLoop.pixelsPerSecond;

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="partner-row" data-visible={visible}>
      <h3 id={`partner-category-${index}`} className="home-type-subtitle partner-category">{label}</h3>
      <div className="partner-window" role="group" aria-labelledby={`partner-category-${index}`}>
        <div className="partner-track" style={{ animationDuration: `${duration}s` }}>
          {[0, 1].map((half) => (
            <div key={half} className="partner-half">
              {Array.from({ length: partnerLoop.copiesPerHalf }, (_, copy) => (
                <div key={copy} className="partner-cycle" data-copy={half !== 0 || copy !== 0} aria-hidden={half !== 0 || copy !== 0 ? true : undefined}>
                  {group.partners.map((partner) => (
                    <a key={partner.name} className="partner-slot" href={partner.url} target="_blank" rel="noopener noreferrer" aria-label={partner.name} tabIndex={half !== 0 || copy !== 0 ? -1 : undefined}>
                      <PartnerLogo partner={partner} />
                    </a>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PartnerMarquee() {
  const { t } = useLang();

  return (
    <div className="partner-network" style={{ "--partner-slot-width": `${partnerLoop.slotWidth}px` }}>
      {homepageSections.partnerGroups.map((group, index) => (
        <PartnerRow key={group.label} group={group} label={t.developer.groupLabels[index] ?? group.label} index={index} />
      ))}
    </div>
  );
}
