'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';

interface Startup {
  id: string;
  name: string;
  slogan: string;
  foundedAt: string;
  points: number;
  createdAt: string;
  updatedAt: string;
  battlesAsA: any[];
  battlesAsB: any[];
  events: any[];
  feedbacks: any[];
}

export default function StartupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [startup, setStartup] = useState<Startup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await fetch(`/api/startups/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar dados da startup');
        }
        const data = await response.json();
        setStartup(data);
      } catch (err) {
        console.error('Erro ao buscar startup:', err);
        setError('Erro ao carregar dados da startup. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, [params.id]);

  const handleDelete = async () => {
    if (!startup) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir startup');
      }

      router.push('/startups');
      router.refresh();
    } catch (err) {
      console.error('Erro ao excluir startup:', err);
      setError('Erro ao excluir startup. Tente novamente mais tarde.');
      setIsDeleting(false);
    }
  };

  // Renderização de carregamento
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/startups" className="text-blue-400 hover:underline">
            ← Voltar para Startups
          </Link>
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
        <div className="card p-6 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="h-20 bg-gray-700 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  // Renderização de erro
  if (error || !startup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/startups" className="text-blue-400 hover:underline">
            ← Voltar para Startups
          </Link>
          <h1 className="text-3xl font-bold">Erro</h1>
        </div>
        <div className="card p-6 text-center">
          <p className="text-red-400">{error || 'Startup não encontrada'}</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/startups')}
          >
            Voltar para Startups
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/startups" className="text-blue-400 hover:underline">
            ← Voltar para Startups
          </Link>
          <h1 className="text-3xl font-bold">{startup.name}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/startups/${startup.id}/edit`}>
            <Button variant="outline">Editar</Button>
          </Link>
          <Button 
            variant="danger" 
            onClick={() => setShowDeleteConfirm(true)}
          >
            Excluir
          </Button>
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir a startup <strong>{startup.name}</strong>? 
              Esta ação não pode ser desfeita e removerá todos os dados associados.
            </p>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button 
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informações gerais */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Slogan</h2>
              <p className="text-gray-300 italic">{startup.slogan}</p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Informações</h2>
              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data de Fundação:</span>
                  <span>{format(new Date(startup.foundedAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pontuação Atual:</span>
                  <span className="font-bold">{startup.points} pontos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cadastrada em:</span>
                  <span>{format(new Date(startup.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Batalhas</h2>
              {startup.battlesAsA.length === 0 && startup.battlesAsB.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                  Esta startup ainda não participou de nenhuma batalha.
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left py-2">Rodada</th>
                          <th className="text-left py-2">Contra</th>
                          <th className="text-center py-2">Status</th>
                          <th className="text-right py-2">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...startup.battlesAsA, ...startup.battlesAsB].map((battle) => {
                          const isStartupA = battle.startupAId === startup.id;
                          const opponent = isStartupA ? battle.startupB : battle.startupA;
                          const battleStatus = {
                            'PENDING': { label: 'Pendente', color: 'text-yellow-400' },
                            'IN_PROGRESS': { label: 'Em andamento', color: 'text-blue-400' },
                            'COMPLETED': { label: 'Concluída', color: 'text-green-400' }
                          }[battle.status] || { label: battle.status, color: 'text-gray-400' };
                          
                          return (
                            <tr key={battle.id} className="border-b border-gray-700">
                              <td className="py-2">Rodada {battle.round.number}</td>
                              <td className="py-2">{opponent.name}</td>
                              <td className={`py-2 text-center ${battleStatus.color}`}>
                                {battleStatus.label}
                              </td>
                              <td className="py-2 text-right">
                                <Link href={`/battles/${battle.id}`} className="text-blue-400 hover:underline">
                                  Detalhes
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Painel lateral */}
          <div>
            <div className="bg-gray-800 rounded-lg p-4 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Feedbacks</h3>
                {startup.feedbacks.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nenhum feedback registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {startup.feedbacks.slice(0, 3).map((feedback) => (
                      <div key={feedback.id} className="bg-gray-700 p-3 rounded">
                        <p className="text-sm text-gray-300">{feedback.content}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Rodada {feedback.round.number} • {format(new Date(feedback.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                    ))}
                    {startup.feedbacks.length > 3 && (
                      <Link 
                        href={`/startups/${startup.id}/feedbacks`}
                        className="text-blue-400 hover:underline text-sm block text-center"
                      >
                        Ver todos os {startup.feedbacks.length} feedbacks
                      </Link>
                    )}
                  </div>
                )}
                
                <div className="mt-4">
                  <Link href={`/feedbacks/new?startupId=${startup.id}`}>
                    <Button variant="outline" className="w-full">
                      Adicionar Feedback
                    </Button>
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Eventos</h3>
                {startup.events.length === 0 ? (
                  <p className="text-gray-400 text-sm">Nenhum evento registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {startup.events.slice(0, 3).map((event) => {
                      const eventTypes = {
                        'PITCH_CONVINCENTE': { label: 'Pitch Convincente', color: 'text-green-400' },
                        'PRODUTO_COM_BUGS': { label: 'Produto com Bugs', color: 'text-red-400' },
                        'BOA_TRACAO_USUARIOS': { label: 'Boa Tração de Usuários', color: 'text-green-400' },
                        'INVESTIDOR_IRRITADO': { label: 'Investidor Irritado', color: 'text-red-400' },
                        'FAKE_NEWS_PITCH': { label: 'Fake News no Pitch', color: 'text-red-400' },
                      };
                      
                      const eventType = eventTypes[event.type as keyof typeof eventTypes] || 
                        { label: event.type, color: 'text-gray-400' };
                      
                      return (
                        <div key={event.id} className="bg-gray-700 p-2 rounded flex items-center justify-between">
                          <span className={eventType.color}>{eventType.label}</span>
                          <span className={event.points >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {event.points >= 0 ? `+${event.points}` : event.points}
                          </span>
                        </div>
                      );
                    })}
                    
                    {startup.events.length > 3 && (
                      <Link 
                        href={`/startups/${startup.id}/events`}
                        className="text-blue-400 hover:underline text-sm block text-center"
                      >
                        Ver todos os {startup.events.length} eventos
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 