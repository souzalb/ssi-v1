import { PrismaClient, AreaName } from '@prisma/client'; // <-- CORREÇÃO: Importar AreaName
import * as bcrypt from 'bcryptjs';

// Inicializa o cliente do Prisma
const db = new PrismaClient();

async function main() {
  console.log('Iniciando o povoamento (seeding)...');

  try {
    // --- 1. Limpeza do Banco (em ordem de dependência) ---
    // Deleta registros que dependem de outros primeiro
    console.log('Limpando dados antigos...');
    await db.comment.deleteMany();
    await db.ticket.deleteMany();
    await db.user.deleteMany();
    await db.area.deleteMany();

    // --- 2. Criação das Áreas de Manutenção ---
    console.log('Criando Áreas...');
    const areaTI = await db.area.create({
      // --- CORREÇÃO: Usar o enum 'AreaName.IT' em vez da string 'IT' ---
      data: { name: AreaName.TI }, // Tecnologia da Informação
    });

    const areaPredial = await db.area.create({
      // --- CORREÇÃO: Usar o enum 'AreaName.BUILDING' ---
      data: { name: AreaName.BUILDING }, // Manutenção Predial
    });

    const areaEletrica = await db.area.create({
      // --- CORREÇÃO: Usar o enum 'AreaName.ELECTRICAL' ---
      data: { name: AreaName.ELECTRICAL }, // Elétrica
    });

    // --- 3. Criação de Usuários ---
    console.log('Criando Usuários...');
    // Senha padrão "123456" para todos os usuários de teste
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Usuário 1: Comum
    const userComum = await db.user.create({
      data: {
        email: 'comum@exemplo.com',
        name: 'Ana Silva (Comum)',
        // --- CORREÇÃO: O campo é 'passwordHash', não 'password' ---
        passwordHash: hashedPassword,
        role: 'COMMON',
        photoUrl: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AS',
      },
    });

    // Usuário 2: Gestor de TI
    const gestorTI = await db.user.create({
      data: {
        email: 'gestor.ti@exemplo.com',
        name: 'Carlos Mendes (Gestor TI)',
        // --- CORREÇÃO: O campo é 'passwordHash', não 'password' ---
        passwordHash: hashedPassword,
        role: 'MANAGER',
        areaId: areaTI.id, // Associado à área de TI
        photoUrl: 'https://placehold.co/100x100/D4F1F4/003366?text=CM',
      },
    });

    // Usuário 3: Técnico de TI
    const tecnicoTI = await db.user.create({
      data: {
        email: 'tecnico.ti@exemplo.com',
        name: 'Mariana Lima (Técnico TI)',
        // --- CORREÇÃO: O campo é 'passwordHash', não 'password' ---
        passwordHash: hashedPassword,
        role: 'TECHNICIAN',
        areaId: areaTI.id, // Associada à área de TI
        photoUrl: 'https://placehold.co/100x100/FEE2E2/991B1B?text=ML',
      },
    });

    // Usuário 4: Técnico Predial
    const tecnicoPredial = await db.user.create({
      data: {
        email: 'tecnico.predial@exemplo.com',
        name: 'Bruno Costa (Técnico Predial)',
        // --- CORREÇÃO: O campo é 'passwordHash', não 'password' ---
        passwordHash: hashedPassword,
        role: 'TECHNICIAN',
        areaId: areaPredial.id, // Associado à área Predial
        photoUrl: 'https://placehold.co/100x100/FEF9C3/9A3412?text=BC',
      },
    });

    // Usuário 5: Super Admin
    const superAdmin = await db.user.create({
      data: {
        email: 'admin@exemplo.com',
        name: 'Admin Global',
        // --- CORREÇÃO: O campo é 'passwordHash', não 'password' ---
        passwordHash: hashedPassword,
        role: 'SUPER_ADMIN',
        photoUrl: 'https://placehold.co/100x100/1D2E5C/FFFFFF?text=AD',
      },
    });

    // --- 4. Criação de Chamados (Tickets) ---
    console.log('Criando Chamados de Teste...');

    // Chamado 1: TI (Aberto) - Deve aparecer para o Gestor de TI
    await db.ticket.create({
      data: {
        title: 'Mouse parou de funcionar',
        description:
          'O mouse óptico do meu computador não acende a luz e não move o cursor.',
        status: 'OPEN',
        priority: 'MEDIUM',
        areaId: areaTI.id,
        requesterId: userComum.id,
        // Detalhes extras
        location: 'Mesa A-10',
        equipment: 'Mouse USB',
        model: 'Logitech M90',
        assetTag: 'PAT-10023',
      },
    });

    // Chamado 2: TI (Atribuído) - Deve aparecer para o Gestor de TI
    await db.ticket.create({
      data: {
        title: 'Monitor piscando (Sala de Reunião)',
        description:
          'A TV da sala de reunião "Alfa" fica piscando quando conectamos o notebook via HDMI.',
        status: 'ASSIGNED',
        priority: 'HIGH',
        areaId: areaTI.id,
        requesterId: gestorTI.id, // O próprio gestor abriu
        technicianId: tecnicoTI.id, // Já atribuído para a Mariana
        location: 'Sala Alfa',
        equipment: 'TV/Monitor',
        model: 'Samsung QLED 55"',
        assetTag: 'PAT-50001',
      },
    });

    // Chamado 3: PREDIAL (Aberto) - NÃO deve aparecer para o Gestor de TI
    await db.ticket.create({
      data: {
        title: 'Lâmpada queimada no corredor',
        description: 'A lâmpada perto do bebedouro do 3º andar queimou.',
        status: 'OPEN',
        priority: 'LOW',
        areaId: areaPredial.id,
        requesterId: userComum.id,
        location: '3º Andar - Corredor B',
        equipment: 'Iluminação',
        // --- CORREÇÃO: Adicionando campos obrigatórios ---
        model: 'Lâmpada LED',
        assetTag: 'N/A', // Não aplicável
      },
    });

    // Chamado 4: TI (Resolvido) - Deve aparecer para o Gestor de TI
    await db.ticket.create({
      data: {
        title: 'Teclado com tecla "Enter" falhando',
        description:
          'O teclado do meu computador está com a tecla Enter muito dura.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        areaId: areaTI.id,
        requesterId: userComum.id,
        technicianId: tecnicoTI.id,
        location: 'Mesa B-05',
        equipment: 'Teclado USB',
        // --- CORREÇÃO: Adicionando campo 'model' que faltava ---
        model: 'Dell KB216',
        assetTag: 'PAT-10045',
      },
    });

    // Chamado 5: ELÉTRICA (Aberto) - NÃO deve aparecer para o Gestor de TI
    await db.ticket.create({
      data: {
        title: 'Tomada 220V sem energia',
        description:
          'A tomada vermelha (220V) ao lado da impressora de etiquetas não está funcionando.',
        status: 'OPEN',
        priority: 'HIGH',
        areaId: areaEletrica.id,
        requesterId: userComum.id,
        location: 'Galpão - Expedição',
        equipment: 'Tomada 220V',
        // --- CORREÇÃO: Adicionando campos obrigatórios ---
        model: 'Tomada Industrial',
        assetTag: 'N/A', // Não aplicável
      },
    });

    console.log('Povoamento (seeding) concluído com sucesso!');
  } catch (e) {
    console.error('Erro durante o povoamento:', e);
    // process.exit(1) é usado em scripts para indicar que houve um erro
    process.exit(1);
  } finally {
    // Garante que a conexão com o banco de dados seja fechada
    await db.$disconnect();
  }
}

// Executa a função principal
main();
