import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const COMMON_ROLE = 'COMMON';
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

export default withAuth(
  function middleware(req: NextRequestWithAuth) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // --- LÓGICA DE REDIRECIONAMENTO DE SESSÃO (CORRETA) ---
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;

    // REGRA 1: Se o usuário for COMMON e tentar aceder ao /dashboard
    if (userRole === COMMON_ROLE && pathname.startsWith('/dashboard')) {
      // Redireciona para /tickets
      return NextResponse.redirect(new URL('/tickets', req.url));
    }

    // REGRA 2 & 3: Proteção de rotas /admin
    if (userRole !== SUPER_ADMIN_ROLE && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Permite o acesso
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  },
);

// O 'matcher' agora isenta as páginas de termos e privacidade.
export const config = {
  matcher: [
    '/((?!api/auth|login|terms|privacy|forgot-password|reset-password|_next/static|_next/image|favicon.ico).*)',
    // Adicione URLs de templates de email aqui se necessário
  ],
};
