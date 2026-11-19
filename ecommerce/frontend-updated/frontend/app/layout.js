import "./globals.css";
import { StoreProvider } from "@/lib/store";
import Toaster from "@/components/Toaster";
import ChatWidget from "@/components/ChatWidget";

export const metadata = {
  title: "Pavitram — Hybrid B2B & B2C Commerce Platform",
  description:
    "One catalog, two ways to trade: instant retail checkout for consumers and structured RFQ-to-invoice procurement for business buyers.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <StoreProvider>
          {children}
          <Toaster />
          <ChatWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
