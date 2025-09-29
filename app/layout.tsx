import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/language-context";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find Verified International Buyers | ITAI Export Assistant",
  description: "ITAI finds verified international buyers and decision‑maker contacts so manufacturers book meetings and win export deals faster.",
  icons: {
    icon: "/logo.png",
  },
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: "Find Verified International Buyers | ITAI Export Assistant",
    description: "ITAI finds verified international buyers and decision‑maker contacts so manufacturers book meetings and win export deals faster.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find Verified International Buyers | ITAI Export Assistant",
    description: "ITAI finds verified international buyers and decision‑maker contacts so manufacturers book meetings and win export deals faster.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        
        {/* Schema.org markup for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "ITAI - International Trade AI",
              "url": "https://www.itai.com",
              "logo": "https://www.itai.com/logo.png",
              "description": "ITAI finds verified international buyers and decision‑maker contacts so manufacturers book meetings and win export deals faster.",
              "sameAs": [
                "https://www.instagram.com/internationaltradeai",
                "https://www.linkedin.com/company/ınternationaltradeai",
                "https://www.youtube.com/shorts/g6MUnSki9I0"
              ]
            })
          }}
        />
        
        {/* Schema.org markup for Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ITAI Export Assistant",
              "url": "https://www.itai.com",
              "description": "Find verified international buyers and decision‑maker contacts to win export deals faster."
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-75NPC5F8WZ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-75NPC5F8WZ');
          `}
        </Script>
        
        <LanguageProvider>
          <div className="min-h-screen bg-white">
            <main>{children}</main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
