import { withAuth, type NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// Não podemos importar 'Role' do Prisma aqui no middleware (Edge Runtime).
// Vamos usar as strings exatas que estão no seu Enum.
const COMMON_ROLE = 'COMMON';
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

export default withAuth(
  // Esta função 'middleware' é chamada APÓS a autenticação ser bem-sucedida
  // (ou seja, se 'authorized' retornar true)
  function middleware(req: NextRequestWithAuth) {
    const { token } = req.nextauth;
    const { pathname } = req.nextUrl;

    // O token é garantido aqui por causa do 'authorized: true'
    // Se (por algum motivo) não existir, o 'withAuth' já redireciona para /login
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const userRole = token.role as string;

    // --- A LÓGICA QUE VOCÊ PEDIU ---

    // REGRA 1: Se o usuário for COMMON e tentar aceder ao /dashboard
    if (userRole === COMMON_ROLE && pathname.startsWith('/dashboard')) {
      // Redireciona-o para a página de /tickets
      return NextResponse.redirect(new URL('/tickets', req.url));
    }

    // REGRA 2: Se o usuário for COMMON e tentar aceder ao /admin
    if (userRole === COMMON_ROLE && pathname.startsWith('/admin')) {
      // Redireciona-o para /tickets
      return NextResponse.redirect(new URL('/tickets', req.url));
    }

    // REGRA 3: Se o usuário NÃO for SUPER_ADMIN e tentar aceder ao /admin
    if (userRole !== SUPER_ADMIN_ROLE && pathname.startsWith('/admin')) {
      // Redireciona-o para o dashboard (que se for COMMON, será redirecionado
      // novamente para /tickets pela REGRA 1)
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Se nenhuma regra de redirecionamento de role for aplicada,
    // permite que o utilizador prossiga para a página que pediu.
    return NextResponse.next();
  },
  {
    callbacks: {
      // O 'authorized' apenas verifica se o token existe.
      // Se 'false', redireciona para 'signIn'
      authorized: ({ token }) => !!token,
    },
    pages: {
      // A página para onde redirecionar se 'authorized' for falso
      signIn: '/login',
    },
  },
);

// O 'matcher' define quais rotas são protegidas pelo middleware
export const config = {
  matcher: [
    // Protege todas as rotas, exceto as que são explicitamente
    // permitidas (api/auth, login, ficheiros estáticos)
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
};
