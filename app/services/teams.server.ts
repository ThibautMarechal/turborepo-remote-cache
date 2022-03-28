import { PrismaClient } from '@prisma/client';
import type { Team } from '~/types/Team';

const prisma = new PrismaClient();

export async function getTeams(): Promise<Team[]> {
  try {
    await prisma.$connect();
    return await prisma.team.findMany();
  } finally {
    await prisma.$disconnect();
  }
}

export async function getTeam(id: string): Promise<Team> {
  try {
    await prisma.$connect();
    const team = await prisma.team.findUnique({ where: { id } });
    if (!team) {
      throw new Error('Not found');
    }
    return team;
  } finally {
    await prisma.$disconnect();
  }
}
