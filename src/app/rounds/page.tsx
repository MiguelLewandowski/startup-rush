import Link from 'next/link';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface Round {
  id: string;
  number: number;
  battles: {
    id: string;
    status: string;
  }[];
}

export default async function RoundsPage() {
  // Buscar todas as rodadas do banco de dados
  const rounds = await prisma.round.findMany({
    orderBy: {
      number: 'asc',
    },
    include: {
      battles: true,
    },
  });

  // Função para determinar o status da rodada com base em suas batalhas
  const getRoundStatus = (round: Round) => {
    if (round.battles.length === 0) {
      return { label: 'Pendente', color: 'text-yellow-400' };
    }
    
    const allCompleted = round.battles.every(battle => battle.status === 'COMPLETED');
    const anyInProgress = round.battles.some(battle => battle.status === 'IN_PROGRESS');
    
    if (allCompleted) {
      return { label: 'Concluída', color: 'text-green-400' };
    } else if (anyInProgress) {
      return { label: 'Em andamento', color: 'text-blue-400' };
    } else {
      return { label: 'Pendente', color: 'text-yellow-400' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rodadas</h1>
        <Link href="/rounds/new" className="btn-primary">
          Nova Rodada
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <p>Gerencie as rodadas do torneio.</p>
          <p className="text-sm text-gray-400 mt-1">
            As rodadas determinam a progressão das startups no torneio.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-left">Número</th>
                <th className="py-2 px-4 text-center">Batalhas</th>
                <th className="py-2 px-4 text-center">Status</th>
                <th className="py-2 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {rounds.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhuma rodada cadastrada. Clique em "Nova Rodada" para começar.
                  </td>
                </tr>
              ) : (
                rounds.map((round: Round) => {
                  const status = getRoundStatus(round);
                  return (
                    <tr key={round.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4">Rodada {round.number}</td>
                      <td className="py-3 px-4 text-center">{round.battles.length}</td>
                      <td className={`py-3 px-4 text-center ${status.color}`}>
                        {status.label}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/rounds/${round.id}`}
                          className="text-blue-400 hover:underline mr-2"
                        >
                          Detalhes
                        </Link>
                        {round.battles.length === 0 && (
                          <Link
                            href={`/rounds/${round.id}/battles/new`}
                            className="text-green-400 hover:underline ml-2"
                          >
                            Criar Batalhas
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 