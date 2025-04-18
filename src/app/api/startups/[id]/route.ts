import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema para validação de atualização
const startupUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slogan: z.string().min(5).max(200).optional(),
  foundedAt: z.string().optional(),
  points: z.number().int().optional(),
});

// GET - Obter detalhes de uma startup
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o ID foi fornecido
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da startup é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar a startup com todas as suas relações
    const startup = await prisma.startup.findUnique({
      where: { id: params.id },
      include: {
        battlesAsA: {
          include: {
            round: true,
            startupA: true,
            startupB: true,
          }
        },
        battlesAsB: {
          include: {
            round: true,
            startupA: true,
            startupB: true,
          }
        },
        events: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
        feedbacks: {
          include: {
            round: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(startup);
  } catch (error) {
    console.error('Erro ao buscar startup:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar detalhes da startup' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar uma startup
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o ID foi fornecido
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da startup é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a startup existe
    const startup = await prisma.startup.findUnique({
      where: { id: params.id },
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup não encontrada' },
        { status: 404 }
      );
    }

    // Validar os dados da requisição
    const body = await request.json();
    const validatedData = startupUpdateSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validatedData.error.format() },
        { status: 400 }
      );
    }

    // Verificar se o nome já existe (caso o nome esteja sendo atualizado)
    if (validatedData.data.name && validatedData.data.name !== startup.name) {
      const existingStartup = await prisma.startup.findUnique({
        where: { name: validatedData.data.name },
      });

      if (existingStartup) {
        return NextResponse.json(
          { error: 'Já existe uma startup com este nome' },
          { status: 400 }
        );
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    
    if (validatedData.data.name) updateData.name = validatedData.data.name;
    if (validatedData.data.slogan) updateData.slogan = validatedData.data.slogan;
    if (validatedData.data.points !== undefined) updateData.points = validatedData.data.points;
    
    // Tratar a data de fundação (se fornecida)
    if (validatedData.data.foundedAt) {
      try {
        const foundedAt = new Date(validatedData.data.foundedAt);
        if (!isNaN(foundedAt.getTime())) {
          updateData.foundedAt = foundedAt;
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Data de fundação inválida' },
          { status: 400 }
        );
      }
    }

    // Atualizar a startup
    const updatedStartup = await prisma.startup.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error('Erro ao atualizar startup:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar startup' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir uma startup
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se o ID foi fornecido
    if (!params.id) {
      return NextResponse.json(
        { error: 'ID da startup é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se a startup existe
    const startup = await prisma.startup.findUnique({
      where: { id: params.id },
      include: {
        battlesAsA: true,
        battlesAsB: true,
      },
    });

    if (!startup) {
      return NextResponse.json(
        { error: 'Startup não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se a startup está em alguma batalha
    if (startup.battlesAsA.length > 0 || startup.battlesAsB.length > 0) {
      return NextResponse.json(
        { 
          error: 'Não é possível excluir esta startup pois ela está associada a batalhas. Você precisa excluir as batalhas primeiro.' 
        },
        { status: 400 }
      );
    }

    // Excluir a startup
    await prisma.startup.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      message: 'Startup excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir startup:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir startup' },
      { status: 500 }
    );
  }
} 