import Link from 'next/link';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface Battle {
  id: string;
  status: string;
  round: {
    number: number;
  };
  startupA: {
    name: string;
  };
  startupB: {
    name: string;
  };
}

export default async function BattlesPage() {
  // Buscar todas as batalhas
  const battles = await prisma.battle.findMany({
    orderBy: [
      { round: { number: 'asc' } },
      { createdAt: 'asc' },
    ],
    include: {
      round: true,
      startupA: true,
      startupB: true,
    },
  });

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Batalhas</h1>
        <Link href="/battles/new" className="btn-primary">
          Nova Batalha
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <p>Gerencie as batalhas entre startups.</p>
          <p className="text-sm text-gray-400 mt-1">
            Cada batalha acontece entre duas startups, onde eventos podem ser aplicados para alterar a pontuação.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-left">Rodada</th>
                <th className="py-2 px-4 text-left">Startup A</th>
                <th className="py-2 px-4 text-left">Startup B</th>
                <th className="py-2 px-4 text-center">Status</th>
                <th className="py-2 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {battles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Nenhuma batalha cadastrada. Clique em "Nova Batalha" para começar.
                  </td>
                </tr>
              ) : (
                battles.map((battle: Battle) => {
                  const status = getBattleStatus(battle.status);
                  return (
                    <tr key={battle.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4">Rodada {battle.round.number}</td>
                      <td className="py-3 px-4">{battle.startupA.name}</td>
                      <td className="py-3 px-4">{battle.startupB.name}</td>
                      <td className={`py-3 px-4 text-center ${status.color}`}>
                        {status.label}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 