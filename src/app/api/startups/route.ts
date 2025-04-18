import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

// Schema de validação
const startupSchema = z.object({
  name: z.string().min(2).max(100),
  slogan: z.string().min(5).max(200),
  foundedAt: z.string().transform((date) => new Date(date)),
});

// GET - Listar todas as startups
export async function GET() {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: { name: 'asc' },
    });
    
    return NextResponse.json(startups);
  } catch (error) {
    console.error('Erro ao buscar startups:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar startups' },
      { status: 500 }
    );
  }
}

// POST - Criar uma nova startup
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validação dos dados
    const validatedData = startupSchema.parse(body);
    
    // Verificar se já existe uma startup com o mesmo nome
    const existingStartup = await prisma.startup.findUnique({
      where: { name: validatedData.name },
    });
    
    if (existingStartup) {
      return NextResponse.json(
        { error: 'Já existe uma startup com este nome' },
        { status: 400 }
      );
    }
    
    // Criar nova startup
    const startup = await prisma.startup.create({
      data: {
        name: validatedData.name,
        slogan: validatedData.slogan,
        foundedAt: validatedData.foundedAt,
        points: 70, // Todas as startups começam com 70 pontos
      },
    });
    
    return NextResponse.json(startup, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Erro ao criar startup:', error);
    return NextResponse.json(
      { error: 'Erro ao criar startup' },
      { status: 500 }
    );
  }
} 