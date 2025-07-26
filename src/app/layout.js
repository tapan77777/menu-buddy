import './globals.css';

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
        <meta name="theme-color" content="#4CAF50" />
        <link rel="apple-touch-icon" href="icon-192x192.png" />
        
      </head>
      <body>
        {children}
        

      </body>
    </html>
  );
}
