import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para atualização de feedback
const feedbackUpdateSchema = z.object({
  content: z.string().min(10).max(500).optional(),
  startupId: z.string().uuid().optional(),
  roundId: z.string().uuid().optional(),
});

// GET - Obter um feedback específico
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    // Validar UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
      include: {
        startup: true,
        round: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(feedback);
  } catch (error) {
    console.error('Erro ao buscar feedback:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar feedback' },
      { status: 500 }
    );
  }
}

// PATCH - Atualizar um feedback
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validar UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se o feedback existe
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    });
    
    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback não encontrado' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = feedbackUpdateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Verificar se a startup existe, se fornecida
    if (validatedData.data.startupId) {
      const startup = await prisma.startup.findUnique({
        where: { id: validatedData.data.startupId },
      });
      
      if (!startup) {
        return NextResponse.json(
          { error: 'Startup não encontrada' },
          { status: 404 }
        );
      }
    }
    
    // Verificar se a rodada existe, se fornecida
    if (validatedData.data.roundId) {
      const round = await prisma.round.findUnique({
        where: { id: validatedData.data.roundId },
      });
      
      if (!round) {
        return NextResponse.json(
          { error: 'Rodada não encontrada' },
          { status: 404 }
        );
      }
    }
    
    // Atualizar o feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: validatedData.data,
      include: {
        startup: true,
        round: true,
      },
    });
    
    return NextResponse.json(updatedFeedback);
  } catch (error) {
    console.error('Erro ao atualizar feedback:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar feedback' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir um feedback
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Validar UUID
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }
    
    // Verificar se o feedback existe
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id },
    });
    
    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback não encontrado' },
        { status: 404 }
      );
    }
    
    // Excluir o feedback
    await prisma.feedback.delete({
      where: { id },
    });
    
    return NextResponse.json(
      { message: 'Feedback excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir feedback:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir feedback' },
      { status: 500 }
    );
  }
} 