export function formatBoardPrice(price, lang = "en") {
  if (!price) return null;
  return new Intl.NumberFormat(lang === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: price.currency,
  }).format(price.price);
}
