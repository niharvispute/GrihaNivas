import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bricksmumbai.com';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Bricks — Mumbai Real Estate',
    template: '%s | Bricks Mumbai',
  },
  description:
    'Discover flats, villas, and commercial properties across Mumbai. Buy, rent, or invest with Bricks — your trusted Mumbai real estate platform.',
  keywords: ['Mumbai real estate', 'flats in Mumbai', 'buy property Mumbai', 'rent apartment Mumbai', 'new launch Mumbai'],
  authors: [{ name: 'Bricks Mumbai' }],
  creator: 'Bricks Mumbai',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'Bricks Mumbai',
    title: 'Bricks — Mumbai Real Estate',
    description:
      'Discover flats, villas, and commercial properties across Mumbai. Buy, rent, or invest with Bricks.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'Bricks Mumbai Real Estate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bricks — Mumbai Real Estate',
    description: 'Discover flats, villas, and commercial properties across Mumbai.',
    images: ['/og-default.jpg'],
  },
  robots: { index: true, follow: true },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,0..1,0&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <AuthModal />
        </Providers>
      </body>
    </html>
  );
}
