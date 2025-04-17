import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'node:inspector';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '🔬 NeuroFold',
  description: 'An intellignent protein based drug discovery application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
    </SessionProvider>
  );
}
