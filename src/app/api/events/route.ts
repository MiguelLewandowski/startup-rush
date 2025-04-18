import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { EVENT_POINTS } from '@/types';

// Schema de validação para criação de evento
const eventCreateSchema = z.object({
  battleId: z.string().uuid(),
  startupId: z.string().uuid(),
  type: z.enum(['PITCH_CONVINCENTE', 'PRODUTO_COM_BUGS', 'BOA_TRACAO_USUARIOS', 'INVESTIDOR_IRRITADO', 'FAKE_NEWS_PITCH']),
});

// GET - Listar todos os eventos
export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        battle: {
          include: {
            round: true,
          },
        },
        startup: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = eventCreateSchema.parse(body);
    
    // Verificar se a batalha existe
    const battle = await prisma.battle.findUnique({
      where: { id: validatedData.battleId },
      include: {
        startupA: true,
        startupB: true,
        events: {
          where: {
            startupId: validatedData.startupId,
            type: validatedData.type,
          },
        },
      },
    });
    
    if (!battle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se a batalha está em andamento
    if (battle.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Só é possível adicionar eventos em batalhas em andamento' },
        { status: 400 }
      );
    }
    
    // Verificar se a startup pertence à batalha
    if (battle.startupAId !== validatedData.startupId && battle.startupBId !== validatedData.startupId) {
      return NextResponse.json(
        { error: 'A startup não pertence a esta batalha' },
        { status: 400 }
      );
    }
    
    // Verificar se já existe um evento do mesmo tipo para esta startup nesta batalha
    if (battle.events.length > 0) {
      return NextResponse.json(
        { error: 'Já existe um evento deste tipo para esta startup nesta batalha' },
        { status: 400 }
      );
    }
    
    // Obter os pontos do evento
    const points = EVENT_POINTS[validatedData.type] || 0;
    
    // Criar o evento
    const event = await prisma.event.create({
      data: {
        battleId: validatedData.battleId,
        startupId: validatedData.startupId,
        type: validatedData.type,
        points,
      },
      include: {
        startup: true,
        battle: true,
      },
    });
    
    // Atualizar a pontuação da startup
    await prisma.startup.update({
      where: { id: validatedData.startupId },
      data: {
        points: {
          increment: points,
        },
      },
    });
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
} 