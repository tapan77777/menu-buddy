// app/layout.js
import Head from 'next/head';
import './globals.css';

export const metadata = {
  title: 'Menu-buddy',
  description: 'Digital menu board for restaurants',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Head>
        {/* Canonical link */}
        <link rel="canonical" href="https://menubuddy.co.in/" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.png" sizes="any" />

        {/* Open Graph tags */}
        <meta property="og:site_name" content="MenuBuddy" />
        <meta property="og:title" content="MenuBuddy - Digital menu board for restaurants" />
        <meta property="og:description" content="Digital menu board for restaurants" />
        <meta
          property="og:image"
          content="https://menubuddy.co.in/images/menubuddy-logo.png"
        />

        {/* JSON-LD for Organization & Logo */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'MenuBuddy',
              url: 'https://menubuddy.co.in',
              logo: 'https://menubuddy.co.in/images/menubuddy-logo.png'
            })
          }}
        />

        {/* ✅ Google Tag Manager Code */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-QSYL461LLW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-QSYL461LLW');
            `,
          }}
        />
      </Head>
      <body>{children}</body>
    </html>
  );
}
