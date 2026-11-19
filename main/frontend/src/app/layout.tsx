import type { Metadata } from "next";
import Script from "next/script";
import { SiteChrome } from "@/components/site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pavitram India — Intellectual Citizen · Prosperous Family · Self-Reliant Society",
  description:
    "Pavitram India is a cooperative self-reliant community connecting members across daily needs, education, health, real estate and essential services.",
  authors: [{ name: "Pavitram India" }],
  openGraph: {
    title: "Pavitram India",
    description:
      "A cooperative self-reliant community building Intellectual Citizens, Prosperous Families and a Self-Reliant Society.",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
  icons: {
    icon: "/pavitram-logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap"
        />
        <style>{`
          #lovable-badge, [data-lovable-badge], a[href*="lovable.dev"][class*="badge"] { display: none !important; }
          .skiptranslate, .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame {
            display: none !important;
          }
          body {
            top: 0 !important;
          }
        `}</style>
      </head>
      <body>
        <div id="google_translate_element" style={{ display: "none" }} />
        <Script
          id="google-translate-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'hi',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <Script
          src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
