import { notFound } from 'next/navigation';
import Link from 'next/link';
import BattleForm from '@/components/forms/BattleForm';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: {
    id: string;
  };
}

export default async function NewRoundBattlePage({ params }: PageParams) {
  const { id: roundId } = params;

  // Verificar se a rodada existe
  const round = await prisma.round.findUnique({
    where: { id: roundId },
  });

  if (!round) {
    notFound();
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

  // Buscar todas as rodadas (apenas para manter a interface consistente com o BattleForm)
  const rounds = await prisma.round.findMany({
    orderBy: {
      number: 'asc',
    },
    select: {
      id: true,
      number: true,
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/rounds/${roundId}`} className="text-blue-400 hover:underline">
          ← Voltar para Rodada {round.number}
        </Link>
        <h1 className="text-3xl font-bold">Nova Batalha</h1>
      </div>

      <div className="card">
        {startups.length < 2 ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">
              É necessário cadastrar pelo menos 2 startups para criar uma batalha.
            </p>
            <Link href="/startups/new" className="btn-primary">
              Cadastrar Startup
            </Link>
          </div>
        ) : (
          <BattleForm startups={startups} rounds={rounds} preselectedRoundId={roundId} />
        )}
      </div>
    </div>
  );
} 