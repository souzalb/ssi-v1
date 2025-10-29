// types/index.ts
import { Ticket, User, Area, Role } from '@prisma/client';

/**
 * Define o tipo de dado que nossa API (GET /api/tickets) retorna.
 * O Prisma 'Ticket' é bom, mas a API 'include' adiciona
 * objetos 'requester', 'technician' e 'area'.
 */
export type TicketComIncludes = Ticket & {
  requester: Pick<User, 'name' | 'photoUrl'> | null;
  technician: Pick<User, 'name' | 'photoUrl'> | null;
  area: Pick<Area, 'name'> | null;
};

// Tipo para a sessão do usuário no front-end
export type UserSession = {
  id: string;
  name: string;
  email: string;
  role: Role;
  areaId: string | null;
  photoUrl: string | null;
};
