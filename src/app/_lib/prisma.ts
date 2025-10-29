// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Declara uma variável global para o Prisma (para reuso em dev)
// Isso é necessário no TypeScript para estender o objeto 'globalThis'.
declare global {
  var prisma: PrismaClient | undefined;
}

// Esta é uma boa prática para evitar criar múltiplas conexões
// com o banco de dados em ambiente de desenvolvimento.
const db: PrismaClient =
  globalThis.prisma ||
  new PrismaClient({
    // log: ['query'], // Opcional: descomente para ver as queries SQL no console
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}

export default db;
