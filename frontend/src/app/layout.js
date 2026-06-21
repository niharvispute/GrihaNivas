import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/providers/Providers";
import AuthModal from "@/components/auth/AuthModal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.grihanivas.in';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'GrihaNivas — Mumbai Real Estate',
    template: '%s | GrihaNivas',
  },
  description:
    'Discover flats, villas, and commercial properties across Mumbai. Buy, rent, or invest with GrihaNivas — your trusted Mumbai real estate platform.',
  keywords: ['Mumbai real estate', 'flats in Mumbai', 'buy property Mumbai', 'rent apartment Mumbai', 'new launch Mumbai'],
  authors: [{ name: 'GrihaNivas' }],
  creator: 'GrihaNivas',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    siteName: 'GrihaNivas',
    title: 'GrihaNivas — Mumbai Real Estate',
    description:
      'Discover flats, villas, and commercial properties across Mumbai. Buy, rent, or invest with GrihaNivas.',
    images: [{ url: '/og-default.jpg', width: 1200, height: 630, alt: 'GrihaNivas Mumbai Real Estate' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrihaNivas — Mumbai Real Estate',
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
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
