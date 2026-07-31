import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./i18n";
import { SideDirectory } from "./side-directory";
import CustomCursor from "./CustomCursor";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: "XIAO Landing Page",
  description:
    "A lightweight gateway into the XIAO ecosystem, products, project hub, roadmap, and community resources.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--page-bg)] text-[var(--ink-strong)]">
        <LanguageProvider>
          {children}
          <SideDirectory />
          <CustomCursor />
        </LanguageProvider>
      </body>
    </html>
  );
}
