import "./globals.css";
import { LanguageProvider } from "./i18n";
import { SideDirectory } from "./side-directory";
import { SiteFooter } from "./site-footer";

const montserrat = { variable: "" };

export const metadata = {
  title: "XIAO Landing Page",
  description:
    "A lightweight gateway into the XIAO ecosystem, products, project hub, roadmap, and community resources.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--page-bg)] text-[var(--ink-strong)]">
        <LanguageProvider>
          {children}
          <SiteFooter />
          <SideDirectory />
        </LanguageProvider>
      </body>
    </html>
  );
}
