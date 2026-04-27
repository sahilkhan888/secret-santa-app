import type { Metadata } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import { Snowfall } from '@/components/effects/Snowfall';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Santa',
  description: 'A quiet Secret Santa for the team.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="relative min-h-screen overflow-x-hidden">
        <Snowfall />
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
