import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validação do ID da batalha
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da batalha é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar batalha com todas as suas relações
    const battle = await prisma.battle.findUnique({
      where: { id: params.id },
      include: {
        round: true,
        startupA: true,
        startupB: true,
        events: {
          include: {
            startup: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!battle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(battle);
  } catch (error) {
    console.error('Erro ao buscar detalhes da batalha:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes da batalha' },
      { status: 500 }
    );
  }
}

// Atualizar uma batalha (ex: alterar status)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Validação do ID da batalha
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da batalha é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a batalha existe
    const existingBattle = await prisma.battle.findUnique({
      where: { id: params.id }
    });

    if (!existingBattle) {
      return NextResponse.json(
        { error: 'Batalha não encontrada' },
        { status: 404 }
      );
    }

    // Validar os dados da requisição
    const body = await request.json();
    
    // Campos permitidos para atualização
    const allowedFields = ['status', 'winnerId'];
    const updateData: any = {};
    
    // Filtrar apenas campos permitidos
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }
    
    // Atualizar batalha
    const updatedBattle = await prisma.battle.update({
      where: { id: params.id },
      data: updateData,
      include: {
        round: true,
        startupA: true,
        startupB: true,
        events: {
          include: {
            startup: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    return NextResponse.json(updatedBattle);
  } catch (error) {
    console.error('Erro ao atualizar batalha:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar batalha' },
      { status: 500 }
    );
  }
} 