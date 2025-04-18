import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Schema de validação para completar uma batalha
const completeBattleSchema = z.object({
  winnerId: z.string().uuid('ID do vencedor inválido'),
  wasSharkFight: z.boolean().optional().default(false),
});

// POST - Completar uma batalha e definir o vencedor
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validar ID da batalha
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
        events: true,
      },
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a batalha já foi concluída
    if (battle.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Esta batalha já foi concluída' },
        { status: 400 }
      );
    }

    // Verificar se a batalha está em andamento
    if (battle.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Só é possível concluir batalhas que estão em andamento' },
        { status: 400 }
      );
    }

    // Validar dados da requisição
    const body = await request.json();
    const validatedData = completeBattleSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validatedData.error.format() },
        { status: 400 }
      );
    }

    const { winnerId, wasSharkFight } = validatedData.data;

    // Verificar se o vencedor faz parte da batalha
    if (winnerId !== battle.startupAId && winnerId !== battle.startupBId) {
      return NextResponse.json(
        { error: 'O vencedor deve ser uma das startups participantes da batalha' },
        { status: 400 }
      );
    }

    // Definir pontos para o vencedor (30 pontos agora)
    const bonusPoints = wasSharkFight ? 10 : 0;
    const standardPoints = 30; // Pontos padrão por vitória - ATUALIZADO PARA 30 PONTOS
    const totalPoints = standardPoints + bonusPoints;

    // Atualizar a batalha e a pontuação da startup vencedora em uma transação
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Atualizar a batalha
      const updatedBattle = await tx.battle.update({
        where: { id: params.id },
        data: {
          status: 'COMPLETED',
          winnerId,
          wasSharkFight,
        },
        include: {
          startupA: true,
          startupB: true,
          round: true,
          events: {
            include: {
              startup: true,
            },
          },
        },
      });

      // Atualizar pontuação da startup vencedora
      const winner = await tx.startup.update({
        where: { id: winnerId },
        data: {
          points: {
            increment: totalPoints,
          },
        },
      });

      // Criar um evento para registrar a vitória
      await tx.event.create({
        data: {
          type: wasSharkFight ? 'SHARK_FIGHT_VICTORY' : 'BATTLE_VICTORY',
          points: totalPoints,
          startupId: winnerId,
          battleId: params.id,
        },
      });

      return { updatedBattle, winner };
    });

    return NextResponse.json({
      message: 'Batalha concluída com sucesso',
      battle: result.updatedBattle,
      wasSharkFight,
      pointsAwarded: totalPoints,
    });
  } catch (error: any) {
    console.error('Erro ao concluir batalha:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao concluir batalha' },
      { status: 500 }
    );
  }
} 