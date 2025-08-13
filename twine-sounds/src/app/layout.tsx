import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400','600','700'], variable: '--font-poppins' });

export const metadata: Metadata = {
  title: 'Twine Sounds — Creative Audio Agency',
  description: 'Voice overs, audio branding, jingles, podcast production, and sound design for brands and agencies.',
  metadataBase: new URL('https://twinesounds.com'),
  openGraph: {
    title: 'Twine Sounds — Creative Audio Agency',
    description: 'Voice overs, audio branding, jingles, podcast production, and sound design for brands and agencies.',
    url: 'https://twinesounds.com',
    siteName: 'Twine Sounds',
    images: [
      { url: '/og.png', width: 1200, height: 630, alt: 'Twine Sounds' }
    ],
    locale: 'en_US',
    type: 'website'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}