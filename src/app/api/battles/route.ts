import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para criação de batalha
const battleCreateSchema = z.object({
  roundId: z.string().uuid(),
  startupAId: z.string().uuid(),
  startupBId: z.string().uuid(),
});

// GET - Listar todas as batalhas
export async function GET() {
  try {
    const battles = await prisma.battle.findMany({
      include: {
        round: true,
        startupA: true,
        startupB: true,
        events: {
          include: {
            startup: true,
          },
        },
      },
      orderBy: [
        { round: { number: 'asc' } },
        { createdAt: 'asc' },
      ],
    });
    
    return NextResponse.json(battles);
  } catch (error) {
    console.error('Erro ao buscar batalhas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar batalhas' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova batalha
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = battleCreateSchema.parse(body);
    
    // Verificar se as startups são diferentes
    if (validatedData.startupAId === validatedData.startupBId) {
      return NextResponse.json(
        { error: 'As startups da batalha devem ser diferentes' },
        { status: 400 }
      );
    }
    
    // Verificar se a rodada existe
    const round = await prisma.round.findUnique({
      where: { id: validatedData.roundId },
    });
    
    if (!round) {
      return NextResponse.json(
        { error: 'Rodada não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se as startups existem
    const startupA = await prisma.startup.findUnique({
      where: { id: validatedData.startupAId },
    });
    
    if (!startupA) {
      return NextResponse.json(
        { error: 'Startup A não encontrada' },
        { status: 404 }
      );
    }
    
    const startupB = await prisma.startup.findUnique({
      where: { id: validatedData.startupBId },
    });
    
    if (!startupB) {
      return NextResponse.json(
        { error: 'Startup B não encontrada' },
        { status: 404 }
      );
    }
    
    // Criar nova batalha
    const battle = await prisma.battle.create({
      data: {
        roundId: validatedData.roundId,
        startupAId: validatedData.startupAId,
        startupBId: validatedData.startupBId,
        status: 'PENDING',
      },
      include: {
        round: true,
        startupA: true,
        startupB: true,
      },
    });
    
    return NextResponse.json(battle, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar batalha:', error);
    return NextResponse.json(
      { error: 'Erro ao criar batalha' },
      { status: 500 }
    );
  }
} 