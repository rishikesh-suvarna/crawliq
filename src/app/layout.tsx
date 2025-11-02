import { ThemeProvider } from '@/components/ThemeProvider';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata = {
  title: 'CrawlIQ - Advanced SEO Audit Platform',
  description: 'Comprehensive SEO audit and analysis with AI-powered insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased selection:bg-indigo-500/20 dark:selection:bg-purple-500/20 font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
