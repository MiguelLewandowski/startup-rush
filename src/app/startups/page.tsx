import Link from 'next/link';
import prisma from '@/lib/prisma';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

interface Startup {
  id: string;
  name: string;
  slogan: string;
  foundedAt: Date;
  points: number;
}

export default async function StartupsPage() {
  // Buscar todas as startups do banco de dados
  const startups = await prisma.startup.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Startups</h1>
        <Link href="/startups/new" className="btn-primary">
          Nova Startup
        </Link>
      </div>

      <div className="card">
        <div className="mb-4">
          <p>Gerencie as startups participantes do torneio.</p>
          <p className="text-sm text-gray-400 mt-1">
            Para iniciar um torneio, você precisa cadastrar entre 4 e 8 startups.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-left">Nome</th>
                <th className="py-2 px-4 text-left">Slogan</th>
                <th className="py-2 px-4 text-left">Fundação</th>
                <th className="py-2 px-4 text-center">Pontos</th>
                <th className="py-2 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {startups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Nenhuma startup cadastrada. Clique em "Nova Startup" para começar.
                  </td>
                </tr>
              ) : (
                startups.map((startup: Startup) => (
                  <tr key={startup.id} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="py-3 px-4">{startup.name}</td>
                    <td className="py-3 px-4">{startup.slogan}</td>
                    <td className="py-3 px-4">
                      {format(new Date(startup.foundedAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4 text-center">{startup.points}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/startups/${startup.id}`}
                        className="text-blue-400 hover:underline mr-2"
                      >
                        Detalhes
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 