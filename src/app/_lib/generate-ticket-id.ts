import db from './prisma';

export async function generateTicketIdV2(areaId: string): Promise<string> {
  // Incrementar atomicamente o contador da área
  const area = await db.area.update({
    where: { id: areaId },
    data: {
      ticketCounter: {
        increment: 1,
      },
    },
    select: {
      code: true,
      ticketCounter: true,
    },
  });

  const paddedNumber = area.ticketCounter.toString().padStart(4, '0');
  return `TK-${area.code}-${paddedNumber}`;
}
