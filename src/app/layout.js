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
