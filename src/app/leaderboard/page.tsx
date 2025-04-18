import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  // Buscar todas as startups ordenadas por pontos (decrescente)
  const startups = await prisma.startup.findMany({
    orderBy: {
      points: 'desc',
    },
  });

  // Função para determinar o status da startup com base nos pontos
  const getStartupStatus = (points: number) => {
    if (points >= 80) {
      return { label: 'Excelente', color: 'text-green-400' };
    } else if (points >= 60) {
      return { label: 'Bom', color: 'text-blue-400' };
    } else if (points >= 40) {
      return { label: 'Regular', color: 'text-yellow-400' };
    } else {
      return { label: 'Em risco', color: 'text-red-400' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Classificação</h1>
      </div>

      <div className="card">
        <div className="mb-4">
          <p>Confira a classificação atual das startups.</p>
          <p className="text-sm text-gray-400 mt-1">
            As startups são classificadas com base em sua pontuação atual.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-center">Posição</th>
                <th className="py-2 px-4 text-left">Startup</th>
                <th className="py-2 px-4 text-left">Slogan</th>
                <th className="py-2 px-4 text-center">Pontos</th>
                <th className="py-2 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {startups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Nenhuma startup cadastrada no sistema.
                  </td>
                </tr>
              ) : (
                startups.map((startup, index) => {
                  const status = getStartupStatus(startup.points);
                  return (
                    <tr key={startup.id} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="py-3 px-4 text-center font-bold">
                        {index + 1}º
                      </td>
                      <td className="py-3 px-4">{startup.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-300">{startup.slogan}</td>
                      <td className="py-3 px-4 text-center font-bold">{startup.points}</td>
                      <td className={`py-3 px-4 text-center ${status.color}`}>
                        {status.label}
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