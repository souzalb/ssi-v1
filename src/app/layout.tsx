import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { cn } from './_lib/utils';
import { AuthProvider } from './(app)/auth-provider';
import { ThemeProvider } from './_components/theme-provider';
import { Header } from './_components/header';
import { MobileBottomNav } from './_components/mobile-bottom-nav';
import { Toaster } from 'sonner';

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
  // O layout precisa de buscar a sessão para passar a role para o MobileBottomNav
  const session = await getServerSession(authOptions); // Certifique-se de importar authOptions

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

            {/* O Menu Inferior (visível apenas em mobile) */}
            {session?.user && ( // Só renderiza se houver utilizador logado
              <MobileBottomNav userRole={session.user.role} />
            )}

            <Toaster richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
