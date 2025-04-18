import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para criação de evento
const eventCreateSchema = z.object({
  type: z.string().min(1, 'O tipo de evento é obrigatório'),
  points: z.number().int('Os pontos devem ser um número inteiro'),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres').max(200, 'A descrição deve ter no máximo 200 caracteres'),
  startupId: z.string().uuid('ID da startup inválido'),
});

// GET - Listar eventos de uma batalha
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validar o ID da batalha
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da batalha é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a batalha existe
    const battle = await prisma.battle.findUnique({
      where: { id: params.id },
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }

    // Buscar os eventos da batalha
    const events = await prisma.event.findMany({
      where: { battleId: params.id },
      include: {
        startup: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar eventos da batalha' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo evento na batalha
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validar o ID da batalha
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da batalha é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a batalha existe
    const battle = await prisma.battle.findUnique({
      where: { id: params.id },
      include: {
        startupA: true,
        startupB: true,
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
        { 
          error: 'Só é possível adicionar eventos a batalhas em andamento',
          currentStatus: battle.status,
        },
        { status: 400 }
      );
    }

    // Validar dados da requisição
    const body = await request.json();
    const validatedData = eventCreateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Verificar se a startup pertence à batalha
    const { startupId, type, points, description } = validatedData.data;
    const isPartOfBattle = 
      battle.startupAId === startupId || 
      battle.startupBId === startupId;

    if (!isPartOfBattle) {
      return NextResponse.json(
        { error: 'A startup selecionada não faz parte desta batalha' },
        { status: 400 }
      );
    }

    // Criar o evento
    const event = await prisma.event.create({
      data: {
        type,
        points,
        description,
        startupId,
        battleId: params.id,
      },
      include: {
        startup: true,
      },
    });

    // Atualizar pontuação da startup
    await prisma.startup.update({
      where: { id: startupId },
      data: {
        points: {
          increment: points,
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json(
      { error: 'Erro ao criar evento' },
      { status: 500 }
    );
  }
} 