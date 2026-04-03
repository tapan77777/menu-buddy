import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'MenuBuddy',
  description: 'Digital menu board for restaurants',
  icons: {
    icon: '/favicon-alt.ico'
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#c9dacaff" />
        <link rel="apple-touch-icon" href="icon-192x192.png" />
        
      </head>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XY3FXL05VT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XY3FXL05VT');
          `}
        </Script>
      </body>
    </html>
  );
}
