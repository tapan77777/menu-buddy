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
      <body>{children}</body>
    </html>
  );
}
