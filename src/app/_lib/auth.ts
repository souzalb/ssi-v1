import { PrismaClient, Role } from '@prisma/client';
import { UserSession } from '@/app/types'; // Certifique-se que o caminho está correto

/**
 * Representa a "sessão" simulada.
 * No App Router, não podemos mais depender de um 'req' em 'getSession'
 * como fazíamos no Pages Router.
 *
 * Esta nova abordagem simula o usuário diretamente no servidor.
 * Quando migrarmos para uma solução real (NextAuth.js),
 * substituiremos esta função por 'auth()' ou 'getServerSession()'.
 */

// Este é o nosso usuário simulado.
// Ele é um GESTOR de TI (MANAGER, area 'it').
const simulatedUser: UserSession = {
  id: 'clx01m4330000u8xth3d4c5c6', // ID do Gestor de TI (do seu seed)
  name: 'Ana Silva (Gestora TI)',
  email: 'gestor.ti@empresa.com',
  role: 'MANAGER',
  areaId: 'clx01m1ss0001u8xtf7a9d0b1', // ID da Área de TI (do seu seed)
  photoUrl: null,
};

/**
 * getSession (Versão App Router)
 *
 * @description Simula a obtenção de uma sessão de usuário no servidor.
 * Retorna diretamente o nosso usuário simulado.
 *
 * @returns {Promise<{ user: UserSession } | null>}
 */
export async function getSession(): Promise<{ user: UserSession } | null> {
  // Em um app real, aqui você usaria o NextAuth.js:
  // const session = await auth(); // (Exemplo com NextAuth/Auth.js)
  // if (!session?.user) return null;
  // return session;

  // Por enquanto, apenas retornamos nosso usuário simulado:
  return {
    user: simulatedUser,
  };
}
