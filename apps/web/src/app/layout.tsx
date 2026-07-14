import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BizOptics - Business Opportunity Intelligence Platform',
    template: '%s | BizOptics',
  },
  description:
    'Identify businesses that need website development, workflow automation, and AI agents. Score opportunities and generate intelligent recommendations with BizOptics.',
  keywords: [
    'business intelligence',
    'lead generation',
    'website development leads',
    'automation opportunities',
    'AI agent opportunities',
    'business scoring',
    'SaaS platform',
  ],
  authors: [{ name: 'BizOptics Team' }],
  creator: 'BizOptics',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'BizOptics',
    title: 'BizOptics - Business Opportunity Intelligence Platform',
    description: 'Identify and score business opportunities for website development, automation, and AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizOptics - Business Opportunity Intelligence Platform',
    description: 'Identify and score business opportunities for website development, automation, and AI.',
    creator: '@bizoptics',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
