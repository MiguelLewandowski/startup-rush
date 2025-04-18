import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação para criação de feedback
const feedbackCreateSchema = z.object({
  startupId: z.string().uuid(),
  roundId: z.string().uuid(),
  content: z.string().min(10).max(500),
});

// GET - Listar todos os feedbacks
export async function GET() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        startup: true,
        round: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error('Erro ao buscar feedbacks:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar feedbacks' },
      { status: 500 }
    );
  }
}

// POST - Criar um novo feedback
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = feedbackCreateSchema.safeParse(body);
    
    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: validatedData.error.format() },
        { status: 400 }
      );
    }
    
    // Verificar se a startup existe
    const startup = await prisma.startup.findUnique({
      where: { id: validatedData.data.startupId },
    });
    
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se a rodada existe
    const round = await prisma.round.findUnique({
      where: { id: validatedData.data.roundId },
    });
    
    if (!round) {
      return NextResponse.json(
        { error: 'Rodada não encontrada' },
        { status: 404 }
      );
    }
    
    // Verificar se a startup participou dessa rodada
    const participated = await prisma.battle.findFirst({
      where: {
        roundId: validatedData.data.roundId,
        OR: [
          { startupAId: validatedData.data.startupId },
          { startupBId: validatedData.data.startupId },
        ],
      },
    });
    
    if (!participated) {
      return NextResponse.json(
        { error: 'Esta startup não participou desta rodada' },
        { status: 400 }
      );
    }
    
    // Criar o feedback
    const feedback = await prisma.feedback.create({
      data: validatedData.data,
      include: {
        startup: true,
        round: true,
      },
    });
    
    return NextResponse.json(feedback, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar feedback:', error);
    return NextResponse.json(
      { error: 'Erro ao criar feedback' },
      { status: 500 }
    );
  }
} 