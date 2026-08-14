"use client";

import { ScrollBand } from "./scroll-band";

/**
 * MediaReviewsSection —— 外部媒体/社区 review 精选，横向自动循环滚动带（复用 ScrollBand）。
 * 卡片：顶部文章头图（无图用渐变占位+媒体名）+ 媒体标签 + 引文 + 文章标题 + 出处日期，
 * 整卡可点击跳转原文；进入视口自动匀速滚动，悬停暂停。
 */
const MEDIA_REVIEWS = [
  {
    media: "Seeed Blog",
    image: "https://media-cdn.seeedstudio.com/media/catalog/product/cache/7f7f32ef807b8c2c2215b49801c56084/2/-/2-113991115-xiao-esp32-s3-sense_1.jpg",
    quote:
      "Science features Seeed Studio XIAO ESP32S3 Sense and its TinyML breakthrough in the Global South — a $14, thumbnail-sized board running AI algorithms from detecting plant diseases and abnormal heart rhythms to tracking wildlife or environmental pollution.",
    article: "Science Features Seeed Studio XIAO ESP32S3 Sense and TinyML Breakthrough in Global South",
    detail: "Seeed Studio Blog · Feb 26, 2025",
    url: "https://www.seeedstudio.com/blog/2025/02/26/science-features-seeed-studio-xiao-esp32s3-sense-and-tinyml-breakthrough-in-global-south/",
  },
  {
    media: "Electromaker",
    image: "https://www.electromaker.io/uploads/images/blog/thumb/V2_Seeeduino_Thumbnail.jpg",
    quote:
      "Choosing the XIAO boards comes with a plethora of benefits: Consistent Shape, Uniform Profile, Standardized Pinout. These advantages underscore the XIAO range's commitment to providing a user-friendly and efficient microcontroller experience.",
    article: "Seeed XIAO Microcontroller Boards: The Ultimate Guide for Makers",
    detail: "22nd September 2023",
    url: "https://www.electromaker.io/blog/article/seeed-studio-xiao-review",
  },
  {
    media: "Hackster",
    image: "https://hackster.imgix.net/uploads/attachments/1905347/_VvwOcXnzjV.blob?auto=compress%2Cformat&w=600&h=450&fit=min",
    quote:
      "The Seeed Studio Vibration Anomaly Detection Kit is ideal for those looking for real-world use-cases for tinyML, turning a XIAO ESP32-S3 and accelerometer into a flexible vibration sensor capable of monitoring motors and other moving devices for indications of impending failure.",
    article: "Hackster's Gift Guide 2025",
    detail: "15th November 2025",
    url: "https://www.hackster.io/news/hackster-s-gift-guide-2025-the-best-new-sbcs-dev-boards-ai-hardware-and-more-bafba8c685d6",
  },
  {
    media: "Make:",
    image: "https://i0.wp.com/makezine.com/wp-content/uploads/2020/11/Seeeduino-Xiao-Feat.png?fit=1909%2C1355&ssl=1",
    quote:
      "The Seeeduino Xiao boasts an impressively compact size, low price tag, and formidable hardware. It is hard not to be a fan of Seeed after having used the Xiao.",
    article: "Boards Guide: Seeeduino Xiao",
    detail: "November 23rd, 2020",
    url: "https://makezine.com/products/boards/seeeduino-xiao/",
  },
  {
    media: "DroneBot Workshop",
    image: "https://i0.wp.com/dronebotworkshop.com/wp-content/uploads/2026/01/XIAO-ESP32-C5_1080.jpg?fit=1024%2C576&ssl=1",
    quote:
      "The XIAO ESP32-C5 represents a significant leap forward for compact IoT development. By bringing dual-band WiFi 6 to the XIAO form factor, Seeed Studio has created a board that's truly future-proof, ready for the increasingly congested wireless environments of tomorrow.",
    article: "Dual-Band WiFi 6 in the Palm of Your Hand",
    detail: "January 27, 2026",
    url: "https://dronebotworkshop.com/xiao-esp32-c5/",
  },
  {
    media: "Tom's Hardware",
    image: "https://cdn.mos.cms.futurecdn.net/kpuNBhM2T3awKAddg8ABZ8-2560-80.jpg",
    quote:
      "Seeed's XIAO RP2040 is a diminutive board. It looks too small to be useful, but appearances can be deceptive.",
    article: "Seeed XIAO RP2040 Review: $5 Brain Food",
    detail: "25 September 2021",
    url: "https://www.tomshardware.com/reviews/seeed-xiao-rp2040-review-dollar5-brain-food",
  },
  {
    media: "Elektor Magazine",
    image: "https://cdn.xingosoftware.com/elektor/images/fetch/dpr_2/https%3A%2F%2Fwww.elektormagazine.com%2Fassets%2Fupload%2Fimages%2F42%2F20250210203750_RISC-V-Main-img.png",
    quote:
      "One of the best options is the Seeed Studio XIAO ESP32C3, equipped with the ESP32-C3 SoC, combining 400-KB SRAM and 4-MB Flash in a compact thumb-sized design. It is ideal for the IoT, wearables, and low-power networking.",
    article: "The RISC-V Architecture: 16 Boards and MCUs You Should Know",
    detail: "February 17, 2025",
    url: "https://www.elektormagazine.com/articles/the-risc-v-architecture-16-boards-mcus",
  },
];

export function MediaReviewsSection() {
  return (
    <ScrollBand
      items={MEDIA_REVIEWS}
      hrefFor={(item) => item.url || "#"}
      renderCard={(r) => (
        <>
          {/* 文章头图（无图则渐变占位 + 媒体名 wordmark） */}
          <div
            className="relative aspect-[4/3] w-full overflow-hidden rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,73,102,0.95), rgba(8,102,126,0.9), rgba(143,195,31,0.85))",
            }}
          >
            {r.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={r.image}
                alt={`${r.media} — ${r.article}`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4 text-center">
                <span className="font-display text-base font-semibold leading-snug tracking-tight text-white/90">
                  {r.article}
                </span>
              </div>
            )}
            {/* 媒体名角标 */}
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {r.media}
            </span>
          </div>

          {/* 引文 + 出处 */}
          <div className="mt-4 flex flex-1 flex-col">
            <p className="flex-1 text-sm leading-6 text-[var(--ink-body)] line-clamp-3">
              <span className="font-display text-xl leading-[0] text-[var(--brand-green)] align-top mr-0.5">
                &ldquo;
              </span>
              {r.quote}
            </p>
            <div className="mt-4 border-t border-[var(--line-soft)] pt-3">
              <p className="text-sm font-semibold leading-snug text-[var(--ink-strong)] line-clamp-2">
                {r.article}
              </p>
              <p className="mt-1 text-xs text-[var(--ink-muted)]">{r.detail}</p>
            </div>
          </div>
        </>
      )}
    />
  );
}
