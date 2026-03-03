
import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
    manifest: "/manifest.json",
      themeColor: "#16a34a",
  title: 'MyIslamic - Sahabat Spiritual Anda',
  description: 'Kelola ibadah harian, baca Al-Quran, dan pantau aktivitas ibadah dengan gaya modern.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="max-w-screen-xl mx-auto min-h-screen bg-background relative shadow-2xl overflow-hidden md:border-x border-border/50 lg:max-w-2xl">
            {children}
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
