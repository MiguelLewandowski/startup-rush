import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface PageParams {
  params: {
    id: string;
  };
}

export default async function RoundDetailsPage({ params }: PageParams) {
  const { id } = params;

  // Buscar rodada com suas batalhas
  const round = await prisma.round.findUnique({
    where: { id },
    include: {
      battles: {
        include: {
          startupA: true,
          startupB: true,
        },
      },
    },
  });

  if (!round) {
    notFound();
  }

  // Função para obter o status da batalha
  const getBattleStatus = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Concluída', color: 'text-green-400' };
      case 'IN_PROGRESS':
        return { label: 'Em andamento', color: 'text-blue-400' };
      default:
        return { label: 'Pendente', color: 'text-yellow-400' };
    }
  };

  // Função para determinar o vencedor de uma batalha
  const getWinner = (battle: any) => {
    if (battle.status !== 'COMPLETED') {
      return null;
    }

    if (battle.startupA.points > battle.startupB.points) {
      return battle.startupA;
    } else if (battle.startupB.points > battle.startupA.points) {
      return battle.startupB;
    }
    
    return null; // Empate (não deveria acontecer)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rounds" className="text-blue-400 hover:underline">
          ← Voltar para Rodadas
        </Link>
        <h1 className="text-3xl font-bold">Rodada {round.number}</h1>
      </div>

      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Detalhes da Rodada</h2>
            <p className="text-gray-400">Criada em {format(new Date(round.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
          </div>
          
          {round.battles.length === 0 && (
            <div className="flex space-x-2">
              <Link href={`/rounds/${round.id}/battles/new`} className="btn-primary">
                Adicionar Batalha
              </Link>
              <Link href={`/rounds/${round.id}/sortear`} className="btn-secondary">
                Sortear Batalhas
              </Link>
            </div>
          )}
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Batalhas</h2>
          
          {round.battles.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-md text-center">
              <p className="text-gray-400">Nenhuma batalha cadastrada para esta rodada.</p>
              <div className="mt-4">
                <Link href={`/rounds/${round.id}/battles/new`} className="btn-primary mr-2">
                  Adicionar Batalha Manualmente
                </Link>
                <Link href={`/rounds/${round.id}/sortear`} className="btn-secondary">
                  Sortear Batalhas
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="py-2 px-4 text-left">Startup A</th>
                    <th className="py-2 px-4 text-center">VS</th>
                    <th className="py-2 px-4 text-left">Startup B</th>
                    <th className="py-2 px-4 text-center">Status</th>
                    <th className="py-2 px-4 text-center">Vencedor</th>
                    <th className="py-2 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {round.battles.map((battle) => {
                    const status = getBattleStatus(battle.status);
                    const winner = getWinner(battle);
                    
                    return (
                      <tr key={battle.id} className="border-b border-gray-700 hover:bg-gray-800">
                        <td className="py-3 px-4">{battle.startupA.name} ({battle.startupA.points} pts)</td>
                        <td className="py-3 px-4 text-center">VS</td>
                        <td className="py-3 px-4">{battle.startupB.name} ({battle.startupB.points} pts)</td>
                        <td className={`py-3 px-4 text-center ${status.color}`}>
                          {status.label}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {winner ? (
                            <span className="text-green-400">{winner.name}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/battles/${battle.id}`}
                            className="text-blue-400 hover:underline"
                          >
                            Detalhes
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 