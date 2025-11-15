import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from './_lib/utils';
import { AuthProvider } from './(app)/auth-provider';
import { ThemeProvider } from './_components/theme-provider';
import { MobileBottomNav } from './_components/mobile-bottom-nav';
import { Toaster } from 'sonner';
import { Footer } from './_components/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SSI 1.06 - Sistema de Chamados',
  description: 'Sistema de gestão de chamados de suporte técnico',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.className,
          'pb-16 md:pb-0', // <-- NOVO: Adiciona padding inferior para o menu móvel
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* O Conteúdo da Página */}
            <main>{children}</main>

            <MobileBottomNav />

            <Toaster richColors />
          </ThemeProvider>

          <Footer
            companyName="SSI Tech Support"
            supportEmail="suporte@ssi-techsupport.com"
            showSocial={true}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
