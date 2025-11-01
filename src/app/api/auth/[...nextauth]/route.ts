// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

import bcrypt from 'bcryptjs';
import db from '@/app/_lib/prisma';

// Schema para validar o login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  // 1. Provedores de Autenticação
  providers: [
    CredentialsProvider({
      name: 'Credentials', // Um nome para este provedor
      credentials: {
        // Define os campos que esperamos
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      // A lógica de autorização
      async authorize(credentials) {
        // Validar com Zod (credentials pode ser undefined)
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          // Buscar usuário
          const user = await db.user.findUnique({
            where: { email },
          });

          // Se não achar ou não tiver senha
          if (!user || !user.passwordHash) return null;

          // Comparar senhas
          const passwordsMatch = await bcrypt.compare(
            password,
            user.passwordHash,
          );

          if (passwordsMatch) {
            // Retorna o objeto 'user' para os callbacks
            // Importante: Não retorne a senha!
            // O tipo 'User' aqui é o da next-auth, não o do prisma
            // Por isso, fazemos o 'return' com os campos esperados
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              areaId: user.areaId,
              photoUrl: user.photoUrl,
            };
          }
        }

        return null; // Falha na autorização
      },
    }),
  ],

  // 2. Páginas Customizadas
  pages: {
    signIn: '/login',
    // error: '/auth/error', // (Opcional)
  },

  // 3. Estratégia de Sessão
  session: {
    strategy: 'jwt', // Usaremos JWT
  },

  // 4. Callbacks
  callbacks: {
    /**
     * Callback 'jwt'
     * Chamado quando um JWT é criado (login) ou atualizado.
     * 'user' só está disponível no login.
     */
    async jwt({ token, user, trigger, session }) {
      // 1. Na hora do Login (trigger "signIn")
      if (user) {
        // 'user' é o objeto retornado pelo 'authorize'
        token.id = user.id;
        token.role = (user as User).role;
        token.areaId = (user as User).areaId;
        token.photoUrl = (user as User).photoUrl;
        // 'name' e 'email' já são adicionados ao token por padrão
      }

      // 2. Na hora da ATUALIZAÇÃO (trigger "update")
      // 'session' é o payload enviado pela função update()
      // ex: update({ name: "Novo Nome" })
      if (trigger === 'update' && session) {
        // Mescla o payload da atualização (session) com o token existente
        return { ...token, ...session };
      }

      return token;
    },

    /**
     * Callback 'session'
     * Modificado para repassar o 'name' atualizado do token
     */
    async session({ session, token }) {
      if (token) {
        // Passa os dados customizados do token para a sessão
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any;
        session.user.areaId = token.areaId as string | null;
        session.user.photoUrl = token.photoUrl as string | null;

        // --- ATUALIZAÇÃO IMPORTANTE ---
        // Precisamos repassar manualmente os campos
        // que podem ter sido atualizados no token pelo callback 'jwt'
        if (token.name) {
          session.user.name = token.name;
        }
        if (token.email) {
          session.user.email = token.email;
        }
      }
      return session;
    },
  },
};
// 5. Exportação dos Handlers
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
