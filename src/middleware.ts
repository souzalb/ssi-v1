// middleware.ts (na raiz do projeto)
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  // `withAuth` atualiza o request com os dados do usuário
  // e redireciona se não estiver logado.
  function middleware() {
    // Você pode adicionar lógicas de autorização aqui se quiser
    // Ex: verificar se req.nextauth.token.role === 'ADMIN'
    // Por enquanto, apenas proteger a rota já é o suficiente.
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Só está autorizado se o token existir
    },
    pages: {
      signIn: '/login', // Para onde redirecionar se não estiver autorizado
    },
  },
);

// O 'matcher' define quais rotas serão protegidas
export const config = {
  matcher: [
    // Protege todas as rotas, exceto:
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
    // Adicione outras rotas públicas se necessário
  ],
};
