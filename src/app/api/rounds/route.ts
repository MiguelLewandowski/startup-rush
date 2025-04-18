import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Interface para tipagem da startup
interface StartupWithId {
  id: string;
  [key: string]: any;
}

// Schema de validação para criação de rodada
const roundCreateSchema = z.object({
  number: z.number().int().positive(),
});

// GET - Listar todas as rodadas
export async function GET() {
  try {
    const rounds = await prisma.round.findMany({
      orderBy: { number: 'asc' },
      include: {
        battles: {
          include: {
            startupA: true,
            startupB: true,
          },
        },
      },
    });

    return NextResponse.json(rounds);
  } catch (error) {
    console.error('Erro ao buscar rodadas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar rodadas' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova rodada
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = roundCreateSchema.parse(body);
    
    // Verificar se já existe uma rodada com o mesmo número
    const existingRound = await prisma.round.findFirst({
      where: { number: validatedData.number },
    });
    
    if (existingRound) {
      return NextResponse.json(
        { error: 'Já existe uma rodada com este número' },
        { status: 400 }
      );
    }
    
    // Criar nova rodada
    const round = await prisma.round.create({
      data: {
        number: validatedData.number,
      },
    });
    
    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar rodada:', error);
    return NextResponse.json(
      { error: 'Erro ao criar rodada' },
      { status: 500 }
    );
  }
}

// POST - Criar rodada e sortear batalhas automaticamente
export async function sortearBatalhas(roundId: string) {
  try {
    // Verificar se já existem batalhas para esta rodada
    const existingBattles = await prisma.battle.findMany({
      where: { roundId },
    });
    
    if (existingBattles.length > 0) {
      throw new Error('Esta rodada já possui batalhas');
    }
    
    // Buscar todas as startups disponíveis (que não foram eliminadas)
    let startups = await prisma.startup.findMany({
      orderBy: { name: 'asc' },
    });
    
    // Para a primeira rodada, usamos todas as startups
    // Para as próximas, usamos apenas as que venceram a rodada anterior
    const round = await prisma.round.findUnique({
      where: { id: roundId },
    });
    
    if (!round) {
      throw new Error('Rodada não encontrada');
    }
    
    if (round.number > 1) {
      // Buscar rodada anterior
      const previousRound = await prisma.round.findFirst({
        where: { number: round.number - 1 },
        include: {
          battles: {
            include: {
              startupA: true,
              startupB: true,
            },
          },
        },
      });
      
      if (!previousRound) {
        throw new Error('Rodada anterior não encontrada');
      }
      
      // Buscar startups vencedoras da rodada anterior
      const winnerIds = new Set<string>();
      
      for (const battle of previousRound.battles) {
        if (battle.status === 'COMPLETED') {
          // Determinar o vencedor com base nos pontos
          const startupAPoints = battle.startupA.points;
          const startupBPoints = battle.startupB.points;
          
          if (startupAPoints > startupBPoints) {
            winnerIds.add(battle.startupAId);
          } else if (startupBPoints > startupAPoints) {
            winnerIds.add(battle.startupBId);
          }
          // Em caso de empate (não deveria acontecer), não adicionamos ninguém
        }
      }
      
      // Filtrar apenas as startups vencedoras
      startups = startups.filter((startup: StartupWithId) => winnerIds.has(startup.id));
    }
    
    // Verificar se temos um número par de startups
    if (startups.length < 2 || startups.length % 2 !== 0) {
      throw new Error('O número de startups deve ser par para criar batalhas');
    }
    
    // Embaralhar startups para sorteio aleatório
    const shuffledStartups = [...startups].sort(() => Math.random() - 0.5);
    
    // Criar batalhas
    const battles = [];
    
    for (let i = 0; i < shuffledStartups.length; i += 2) {
      const battle = await prisma.battle.create({
        data: {
          roundId,
          startupAId: shuffledStartups[i].id,
          startupBId: shuffledStartups[i + 1].id,
          status: 'IN_PROGRESS',
        },
        include: {
          startupA: true,
          startupB: true,
        },
      });
      
      battles.push(battle);
    }
    
    return battles;
  } catch (error) {
    console.error('Erro ao sortear batalhas:', error);
    throw error;
  }
} 