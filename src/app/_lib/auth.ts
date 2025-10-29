// Use o caminho correto para seus helpers
import db from '@/app/_lib/prisma';
import { UserSession } from '@/app/types';
import { Prisma } from '@prisma/client';

/**
 * E-mail do usuário que queremos simular.
 * Este e-mail DEVE existir no seu banco de dados (criado pelo prisma/seed.ts).
 */
const SIMULATED_USER_EMAIL = 'gestor.ti@exemplo.com';

/**
 * getSession (Versão App Router, Corrigida)
 *
 * @description Simula a obtenção de uma sessão de usuário no servidor.
 * Agora, ele busca o usuário no banco de dados pelo e-mail
 * para garantir que os IDs (usuário e área) são válidos.
 *
 * @returns {Promise<{ user: UserSession } | null>}
 */
export async function getSession(): Promise<{ user: UserSession } | null> {
  try {
    const user = await db.user.findUnique({
      where: {
        email: SIMULATED_USER_EMAIL,
      },
    });

    if (!user) {
      console.error(
        `[Auth Simulado] ERRO: O usuário com e-mail "${SIMULATED_USER_EMAIL}" não foi encontrado no banco.`,
      );
      console.error('Execute "npx prisma db seed" para popular o banco.');
      return null;
    }

    // Valida que o usuário tem os dados mínimos para uma sessão
    if (!user.name || !user.email || !user.role) {
      console.error(
        `[Auth Simulado] ERRO: O usuário "${SIMULATED_USER_EMAIL}" está com dados incompletos no banco.`,
      );
      return null;
    }

    // Monta a sessão do usuário com os tipos corretos
    const sessionUser: UserSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role, // O tipo 'Role' já é o enum do Prisma
      areaId: user.areaId, // string | null
      photoUrl: user.photoUrl, // string | null
    };

    return {
      user: sessionUser,
    };
  } catch (error) {
    console.error('[Auth Simulado] Falha ao buscar usuário da sessão:', error);
    return null;
  }
}
