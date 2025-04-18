import Link from 'next/link';
import BattleForm from '@/components/forms/BattleForm';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NewBattlePage() {
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

  // Buscar todas as rodadas
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
        <Link href="/battles" className="text-blue-400 hover:underline">
          ← Voltar
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
        ) : rounds.length === 0 ? (
          <div className="text-center p-6">
            <p className="text-red-400 mb-4">
              É necessário cadastrar pelo menos uma rodada para criar uma batalha.
            </p>
            <Link href="/rounds/new" className="btn-primary">
              Cadastrar Rodada
            </Link>
          </div>
        ) : (
          <BattleForm startups={startups} rounds={rounds} />
        )}
      </div>
    </div>
  );
} 