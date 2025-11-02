import './globals.css';

export const metadata = { title: 'CrawlIQ', description: 'SEO audit + chat' };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-dvh antialiased selection:bg-neutral-900/80 selection:text-white dark:selection:bg-white/80 dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
