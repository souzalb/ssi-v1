import { PrismaClient, Role, Status, Priority, AreaName } from '@prisma/client';
import { hashSync } from 'bcryptjs';
import { addBusinessDays, subDays } from 'date-fns';

/* eslint-disable */
const prisma = new PrismaClient();

// Gera uma senha hash padrão para todos
const defaultPassword = hashSync('123456', 10);

/**
 * Função auxiliar para criar um chamado de forma inteligente.
 * Ela trata da geração do ticketId, incremento do contador e cálculo de datas.
 */
async function createTicket(
  area: { id: string; code: string },
  priority: Priority,
  status: Status,
  requesterId: string,
  title: string,
  daysAgo: number, // Há quantos dias foi criado
  technicianId?: string,
  rating?: number,
) {
  // 1. Atualiza o contador da Área e obtém o novo número
  const updatedArea = await prisma.area.update({
    where: { id: area.id },
    data: { ticketCounter: { increment: 1 } },
    select: { ticketCounter: true },
  });
  // O primeiro ticket será 1000 + 1 = 1001
  const newTicketNumber = 1000 + updatedArea.ticketCounter;

  // 2. Formata o ticketId legível (ex: "TI-1001")
  const customTicketId = `${area.code}-${newTicketNumber}`;

  // 3. Calcula as datas
  const now = new Date();
  const createdAt = subDays(now, daysAgo); // Data de criação no passado
  let resolvedAt: Date | null = null;
  let slaDeadline: Date | null = null;

  // Define o prazo de SLA (em dias úteis)
  switch (priority) {
    case Priority.URGENT:
      slaDeadline = addBusinessDays(createdAt, 1);
      break;
    case Priority.HIGH:
      slaDeadline = addBusinessDays(createdAt, 3);
      break;
    case Priority.MEDIUM:
      slaDeadline = addBusinessDays(createdAt, 5);
      break;
    case Priority.LOW:
      slaDeadline = addBusinessDays(createdAt, 10);
      break;
  }

  // Se o chamado estiver Resolvido ou Fechado, define uma data de resolução
  if (status === Status.RESOLVED || status === Status.CLOSED) {
    // Simula a resolução (X dias após a criação)
    resolvedAt = addBusinessDays(createdAt, Math.floor(daysAgo / 2) + 1);

    // Simula se falhou o SLA
    if (resolvedAt > slaDeadline) {
      console.log(`WARN: Ticket ${customTicketId} (Resolvido) falhou o SLA.`);
    }
  }

  console.log(`Criando Ticket: ${customTicketId} - ${title}`);

  // 4. Cria o chamado
  return prisma.ticket.create({
    data: {
      ticketId: customTicketId,
      title,
      description: 'Descrição de teste detalhada para o chamado: ' + title,
      location: 'Sala 502, Bloco A',
      equipment: 'Computador Desktop',
      model: 'Dell Optiplex 7010',
      assetTag: `ASSET-${Math.floor(Math.random() * 10000)}`,
      priority,
      status,
      createdAt,
      resolvedAt,
      satisfactionRating: rating,
      slaDeadline,
      areaId: area.id,
      requesterId,
      technicianId,
    },
  });
}

async function main() {
  console.log('Iniciando o processo de seed...');

  // 1. Limpar a base de dados (ordem inversa das relações)
  console.log('Limpando a base de dados...');
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();
  await prisma.area.deleteMany();

  // 2. Criar Áreas
  console.log('Criando Áreas...');
  const tiArea = await prisma.area.create({
    data: { name: AreaName.TI, code: 'TI' },
  });
  const buildingArea = await prisma.area.create({
    data: { name: AreaName.BUILDING, code: 'BLD' },
  });
  const electricalArea = await prisma.area.create({
    data: { name: AreaName.ELECTRICAL, code: 'ELT' },
  });
  console.log('Áreas criadas.');

  // 3. Criar Utilizadores
  console.log('Criando Utilizadores...');
  // Super Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@app.com',
      name: 'Super Admin',
      passwordHash: defaultPassword,
      role: Role.SUPER_ADMIN,
    },
  });

  // Gestores (Managers)
  const managerTI = await prisma.user.create({
    data: {
      email: 'gestor.ti@app.com',
      name: 'Gestor (TI)',
      passwordHash: defaultPassword,
      role: Role.MANAGER,
      areaId: tiArea.id,
    },
  });
  const managerBLD = await prisma.user.create({
    data: {
      email: 'gestor.bld@app.com',
      name: 'Gestora (Prédio)',
      passwordHash: defaultPassword,
      role: Role.MANAGER,
      areaId: buildingArea.id,
    },
  });

  // Técnicos
  const techTI_1 = await prisma.user.create({
    data: {
      email: 'tecnico1.ti@app.com',
      name: 'Carlos (Técnico TI)',
      passwordHash: defaultPassword,
      role: Role.TECHNICIAN,
      areaId: tiArea.id,
      photoUrl: 'https://i.pravatar.cc/150?img=1',
    },
  });
  const techTI_2 = await prisma.user.create({
    data: {
      email: 'tecnico2.ti@app.com',
      name: 'Ana (Técnica TI)',
      passwordHash: defaultPassword,
      role: Role.TECHNICIAN,
      areaId: tiArea.id,
      photoUrl: 'https://i.pravatar.cc/150?img=2',
    },
  });
  const techBLD_1 = await prisma.user.create({
    data: {
      email: 'tecnico1.bld@app.com',
      name: 'Pedro (Técnico Prédio)',
      passwordHash: defaultPassword,
      role: Role.TECHNICIAN,
      areaId: buildingArea.id,
      photoUrl: 'https://i.pravatar.cc/150?img=3',
    },
  });
  const techELT_1 = await prisma.user.create({
    data: {
      email: 'tecnico1.elt@app.com',
      name: 'Maria (Técnica Eletro)',
      passwordHash: defaultPassword,
      role: Role.TECHNICIAN,
      areaId: electricalArea.id,
      photoUrl: 'https://i.pravatar.cc/150?img=4',
    },
  });

  // Utilizadores Comuns
  const user1 = await prisma.user.create({
    data: {
      email: 'user1@app.com',
      name: 'Utilizador Comum 1',
      passwordHash: defaultPassword,
      role: Role.COMMON,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'user2@app.com',
      name: 'Utilizador Comum 2',
      passwordHash: defaultPassword,
      role: Role.COMMON,
    },
  });
  console.log('Utilizadores criados.');

  // 4. Criar Chamados (Tickets)
  console.log('Criando Chamados...');

  // Chamados de TI (para user1)
  const t1 = await createTicket(
    tiArea,
    Priority.HIGH,
    Status.RESOLVED,
    user1.id,
    'Computador não liga (Tela Azul)',
    30,
    techTI_1.id,
    5,
  );
  const t2 = await createTicket(
    tiArea,
    Priority.MEDIUM,
    Status.IN_PROGRESS,
    user1.id,
    'Impressora não imprime colorido',
    3,
    techTI_2.id,
  );
  const t3 = await createTicket(
    tiArea,
    Priority.LOW,
    Status.OPEN,
    user1.id,
    'Pedido de novo rato',
    1,
  );

  // Chamados de PRÉDIO (para user2)
  const t4 = await createTicket(
    buildingArea,
    Priority.URGENT,
    Status.ASSIGNED,
    user2.id,
    'Infiltração grave na sala 101',
    1,
    techBLD_1.id,
  );
  const t5 = await createTicket(
    buildingArea,
    Priority.LOW,
    Status.CLOSED,
    user2.id,
    'Lâmpada queimada no corredor',
    45,
    techBLD_1.id,
    4,
  );

  // Chamados de ELÉTRICA (para user1)
  const t6 = await createTicket(
    electricalArea,
    Priority.MEDIUM,
    Status.ON_HOLD,
    user1.id,
    'Tomada 220V sem energia',
    10,
    techELT_1.id,
  );

  // Criar mais 14 chamados (para volume no gráfico)
  for (let i = 0; i < 14; i++) {
    const daysAgo = Math.floor(Math.random() * 180) + 2; // 2 a 180 dias atrás
    await createTicket(
      tiArea,
      Priority.MEDIUM,
      Status.CLOSED,
      user2.id,
      `Chamado antigo de teste ${i + 1}`,
      daysAgo,
      techTI_1.id,
      Math.floor(Math.random() * 3) + 3, // Nota 3, 4 ou 5
    );
  }

  console.log('Chamados criados.');

  // 5. Criar Comentários
  console.log('Criando Comentários...');
  await prisma.comment.create({
    data: {
      text: 'O técnico Carlos está a verificar o problema. Parece ser a fonte de alimentação.',
      isInternal: false,
      ticketId: t1.id,
      userId: managerTI.id, // Comentário do Gestor
      areaId: tiArea.id,
    },
  });
  await prisma.comment.create({
    data: {
      text: 'Fonte de alimentação trocada. A fechar o chamado.',
      isInternal: true, // Comentário interno
      ticketId: t1.id,
      userId: techTI_1.id, // Comentário do Técnico
      areaId: tiArea.id,
    },
  });
  await prisma.comment.create({
    data: {
      text: 'Estou a verificar os cartuchos da impressora.',
      isInternal: false,
      ticketId: t2.id,
      userId: techTI_2.id,
      areaId: tiArea.id,
    },
  });
  console.log('Comentários criados.');

  // 6. Criar Anexos
  console.log('Criando Anexos...');
  await prisma.attachment.create({
    data: {
      filename: 'foto_tela_azul.png',
      url: 'https://i.imgur.com/example.png', // Use um link real ou placeholder
      fileType: 'image/png',
      size: 102400,
      ticketId: t1.id,
      uploaderId: user1.id,
    },
  });
  await prisma.attachment.create({
    data: {
      filename: 'foto_infiltracao.jpg',
      url: 'https://i.imgur.com/example2.jpg',
      fileType: 'image/jpeg',
      size: 204800,
      ticketId: t4.id,
      uploaderId: user2.id,
    },
  });
  console.log('Anexos criados.');

  console.log('✨ Processo de Seed concluído com sucesso! ✨');
}

main()
  .catch((e) => {
    console.error('Ocorreu um erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
