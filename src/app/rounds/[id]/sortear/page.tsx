import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Função para sortear batalhas
async function sortearBatalhas(roundId: string) {
  try {
    // Verificar se já existem batalhas para esta rodada
    const existingBattles = await prisma.battle.findMany({
      where: { roundId },
    });
    
    if (existingBattles.length > 0) {
      throw new Error('Esta rodada já possui batalhas');
    }
    
    // Buscar todas as startups disponíveis
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
      startups = startups.filter((startup) => winnerIds.has(startup.id));
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
          status: 'PENDING',
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

interface PageParams {
  params: {
    id: string;
  };
}

export default async function SortearBatalhasPage({ params }: PageParams) {
  const { id: roundId } = params;

  // Verificar se a rodada existe
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      battles: true,
    },
  });

  if (!round) {
    notFound();
  }

  // Se já existem batalhas, redireciona de volta para a página da rodada
  if (round.battles.length > 0) {
    redirect(`/rounds/${roundId}`);
  }

  // Buscar todas as startups
  const startups = await prisma.startup.findMany({
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Verificar número de startups
  const numStartups = startups.length;
  const isEven = numStartups % 2 === 0;
  const hasSufficientStartups = numStartups >= 2;

  // Verificar se tem rodada anterior (para rounds > 1)
  let previousRoundComplete = true;
  if (round.number > 1) {
    const previousRound = await prisma.round.findFirst({
      where: { number: round.number - 1 },
      include: {
        battles: true,
      },
    });

    if (!previousRound) {
      previousRoundComplete = false;
    } else {
      // Verificar se todas as batalhas da rodada anterior estão concluídas
      previousRoundComplete = previousRound.battles.every(battle => battle.status === 'COMPLETED');
    }
  }

  // Realizar o sorteio se o formulário for submetido
  let error = null;
  let generatedBattles = null;

  if (hasSufficientStartups && isEven && previousRoundComplete) {
    try {
      generatedBattles = await sortearBatalhas(roundId);
      // Redirecionar para a página da rodada se o sorteio for bem sucedido
      redirect(`/rounds/${roundId}`);
    } catch (e: any) {
      error = e.message || 'Ocorreu um erro ao sortear as batalhas';
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/rounds/${roundId}`} className="text-blue-400 hover:underline">
          ← Voltar para Rodada {round.number}
        </Link>
        <h1 className="text-3xl font-bold">Sortear Batalhas</h1>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Sorteio Automático de Batalhas</h2>
          <p className="text-gray-400 mt-1">
            O sistema irá sortear automaticamente as batalhas para a Rodada {round.number}.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200">
            {error}
          </div>
        )}

        <div className="bg-gray-800 p-6 rounded-md">
          {!hasSufficientStartups ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">
                É necessário pelo menos 2 startups para realizar o sorteio.
              </p>
              <Link href="/startups/new" className="btn-primary">
                Cadastrar Startup
              </Link>
            </div>
          ) : !isEven ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">
                O número de startups ({numStartups}) deve ser par para realizar o sorteio.
              </p>
              <Link href="/startups/new" className="btn-primary">
                Cadastrar Mais Uma Startup
              </Link>
            </div>
          ) : !previousRoundComplete && round.number > 1 ? (
            <div className="text-center">
              <p className="text-red-400 mb-4">
                Todas as batalhas da rodada anterior devem estar concluídas para sortear a próxima rodada.
              </p>
              <Link href="/rounds" className="btn-primary">
                Ver Rodadas
              </Link>
            </div>
          ) : (
            <div className="text-center">
              <p className="mb-4">
                Tudo pronto para sortear as batalhas. Serão criadas {Math.floor(numStartups / 2)} batalhas entre {numStartups} startups.
              </p>
              <form action={async () => {
                'use server';
                await sortearBatalhas(roundId);
                redirect(`/rounds/${roundId}`);
              }}>
                <button type="submit" className="btn-primary">
                  Realizar Sorteio
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Startups Disponíveis ({numStartups})</h3>
          <ul className="list-disc pl-6 space-y-1">
            {startups.map((startup) => (
              <li key={startup.id}>{startup.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 