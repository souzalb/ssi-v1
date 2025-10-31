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
    async jwt({ token, user }) {
      // O 'user' aqui é o objeto retornado pelo 'authorize'
      if (user) {
        // Estamos "injetando" o ID e a Role no token
        token.id = user.id;
        token.role = (user as User).role; // Cast para o tipo do Prisma/NextAuth
      }
      return token;
    },

    /**
     * Callback 'session'
     * Chamado quando a sessão é acessada.
     * Recebe o 'token' (processado pelo 'jwt' callback).
     */
    async session({ session, token }) {
      // Passamos os dados do token (id e role) para a sessão
      // que será exposta ao cliente
      if (token) {
        session.user.id = token.id as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any; // Use 'as Role' se importado
      }
      return session;
    },
  },
};

// 5. Exportação dos Handlers
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
