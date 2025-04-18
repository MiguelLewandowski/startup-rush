'use client';

import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { EVENT_POINTS } from '@/types';
import { Input } from '@/components/ui/Input';

// Interface para os tipos de evento
const eventTypes = [
  { value: 'PITCH_CONVINCENTE', label: 'Pitch Convincente', points: 6, color: 'text-green-400' },
  { value: 'PRODUTO_COM_BUGS', label: 'Produto com Bugs', points: -4, color: 'text-red-400' },
  { value: 'BOA_TRACAO_USUARIOS', label: 'Boa Tração de Usuários', points: 3, color: 'text-green-400' },
  { value: 'INVESTIDOR_IRRITADO', label: 'Investidor Irritado', points: -6, color: 'text-red-400' },
  { value: 'FAKE_NEWS_PITCH', label: 'Fake News no Pitch', points: -8, color: 'text-red-400' },
];

// Interface para os dados da batalha
interface Battle {
  id: string;
  status: string;
  winnerId?: string;
  wasSharkFight?: boolean;
  round: {
    id: string;
    number: number;
    name?: string;
  };
  startupA: {
    id: string;
    name: string;
    points: number;
  };
  startupB: {
    id: string;
    name: string;
    points: number;
  };
  events: Array<{
    id: string;
    type: string;
    points: number;
    startupId: string;
    createdAt: string;
    description?: string;
    startup: {
      name: string;
    };
  }>;
}

interface EventToCreate {
  type: string;
  points: number;
  description: string;
  startupId: string;
}

// Tipos de eventos e suas pontuações
const EVENT_TYPES = {
  'PITCH_CONVINCENTE': { 
    label: 'Pitch convincente', 
    defaultPoints: 6,
    color: 'text-green-400'
  },
  'PRODUTO_COM_BUGS': { 
    label: 'Produto com bugs', 
    defaultPoints: -4,
    color: 'text-red-400'
  },
  'BOA_TRACAO_USUARIOS': { 
    label: 'Boa tração de usuários', 
    defaultPoints: 3,
    color: 'text-green-400'
  },
  'INVESTIDOR_IRRITADO': { 
    label: 'Investidor irritado', 
    defaultPoints: -6,
    color: 'text-red-400'
  },
  'FAKE_NEWS_PITCH': { 
    label: 'Fake news no pitch', 
    defaultPoints: -8,
    color: 'text-red-400'
  }
};

const BATTLE_STATUS = {
  'PENDING': { label: 'Pendente', color: 'text-yellow-400' },
  'IN_PROGRESS': { label: 'Em andamento', color: 'text-blue-400' },
  'COMPLETED': { label: 'Concluída', color: 'text-green-400' },
};

// Array para facilitar o mapeamento
const EVENTOS = [
  { tipo: 'PITCH_CONVINCENTE', label: 'Pitch convincente', pontos: 6, cor: 'bg-green-600 hover:bg-green-700' },
  { tipo: 'PRODUTO_COM_BUGS', label: 'Produto com bugs', pontos: -4, cor: 'bg-red-600 hover:bg-red-700' },
  { tipo: 'BOA_TRACAO_USUARIOS', label: 'Boa tração de usuários', pontos: 3, cor: 'bg-green-600 hover:bg-green-700' },
  { tipo: 'INVESTIDOR_IRRITADO', label: 'Investidor irritado', pontos: -6, cor: 'bg-red-600 hover:bg-red-700' },
  { tipo: 'FAKE_NEWS_PITCH', label: 'Fake news no pitch', pontos: -8, cor: 'bg-red-600 hover:bg-red-700' }
];

export default function BattleDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('info'); // 'info', 'events', 'winner'
  
  // Estado para o formulário de evento
  const [selectedStartup, setSelectedStartup] = useState<string>('');
  const [selectedEventType, setSelectedEventType] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [eventSuccess, setEventSuccess] = useState<string | null>(null);
  
  // Estado para definir o vencedor
  const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
  const [completingBattle, setCompletingBattle] = useState(false);
  
  // Estado para controle de formulários e modais
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showCompleteBattleForm, setShowCompleteBattleForm] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Estado para o novo evento
  const [newEvent, setNewEvent] = useState<EventToCreate>({
    type: '',
    points: 0,
    description: '',
    startupId: '',
  });

  // Estado para conclusão da batalha
  const [battleCompletion, setBattleCompletion] = useState({
    winnerId: '',
    wasSharkFight: false,
  });

  // Estado para controlar modal de confirmação para finalizar batalha
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizingBattle, setFinalizingBattle] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string>('');
  const [isSharkFight, setIsSharkFight] = useState(false);

  // Estado para a mensagem de sucesso
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Estado para controlar ações em andamento
  const [actionInProgress, setActionInProgress] = useState(false);

  // Buscar os detalhes da batalha
  useEffect(() => {
    async function fetchBattle() {
      try {
        const response = await fetch(`/api/battles/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Erro ao buscar detalhes da batalha');
        }
        
        const data = await response.json();
        setBattle(data);
      } catch (err) {
        setError('Ocorreu um erro ao buscar os detalhes da batalha');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchBattle();
  }, [params.id]);

  // Adicionar um evento (versão antiga - manter para compatibilidade)
  const handleAddEventOld = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStartup || !selectedEventType) {
      setEventError('Selecione a startup e o tipo de evento');
      return;
    }
    
    try {
      setSubmitting(true);
      setEventError(null);
      setEventSuccess(null);
      
      const eventData = {
        battleId: params.id,
        startupId: selectedStartup,
        type: selectedEventType,
      };
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao registrar evento');
      }
      
      // Atualizar os dados da batalha
      const battleResponse = await fetch(`/api/battles/${params.id}`);
      const updatedBattle = await battleResponse.json();
      setBattle(updatedBattle);
      
      // Limpar o formulário
      setSelectedStartup('');
      setSelectedEventType('');
      setEventSuccess('Evento registrado com sucesso!');
    } catch (err: any) {
      setEventError(err.message || 'Ocorreu um erro ao registrar o evento');
    } finally {
      setSubmitting(false);
    }
  };

  // Função para adicionar evento (nova versão)
  const handleAddEvent = async (startupId: string, eventType: string, points: number) => {
    if (!battle) return;
    
    try {
      setActionInProgress(true);
      setError(null);
      setEventSuccess(null);
      setEventError(null);

      // Criar o evento diretamente sem formulário
      const eventData = {
        type: eventType,
        points: points,
        startupId: startupId,
        battleId: battle.id,
      };

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao adicionar evento');
      }

      // Atualizar os dados da batalha
      const updatedBattleResponse = await fetch(`/api/battles/${battle.id}`);
      const updatedBattle = await updatedBattleResponse.json();
      setBattle(updatedBattle);
      
      // Mostrar mensagem de sucesso
      const startup = startupId === battle.startupA.id ? battle.startupA.name : battle.startupB.name;
      const eventoLabel = EVENTOS.find(e => e.tipo === eventType)?.label || eventType;
      setEventSuccess(`Evento "${eventoLabel}" adicionado para ${startup}`);
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setEventSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erro ao adicionar evento:', err);
      setEventError(err.message || 'Erro ao adicionar evento. Tente novamente mais tarde.');
    } finally {
      setActionInProgress(false);
    }
  };

  // Determinar o vencedor da batalha
  const determineWinner = async () => {
    if (!battle) return;
    
    try {
      setCompletingBattle(true);
      setWinnerMessage(null);
      
      const pointsA = battle.startupA.points;
      const pointsB = battle.startupB.points;
      
      // Verificar se há empate
      const sharkFight = pointsA === pointsB;
      
      // Determinar o vencedor (ou vencedor do Shark Fight)
      const winner = sharkFight 
        ? Math.random() < 0.5 ? battle.startupA.id : battle.startupB.id
        : pointsA > pointsB ? battle.startupA.id : battle.startupB.id;
      
      // Registrar a batalha como concluída
      const response = await fetch(`/api/battles/${params.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          winnerId: winner,
          wasSharkFight: sharkFight 
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao concluir a batalha');
      }
      
      // Atualizar os dados da batalha
      const battleResponse = await fetch(`/api/battles/${params.id}`);
      const updatedBattle = await battleResponse.json();
      setBattle(updatedBattle);
      
      // Mensagem de sucesso
      const winnerName = winner === battle.startupA.id ? battle.startupA.name : battle.startupB.name;
      if (sharkFight) {
        setWinnerMessage(`Houve um empate! Foi realizado um Shark Fight e a ${winnerName} venceu!`);
      } else {
        setWinnerMessage(`A ${winnerName} venceu a batalha!`);
      }
      
      // Ir para a aba de resultado
      setCurrentTab('winner');
    } catch (err: any) {
      setWinnerMessage(`Erro: ${err.message || 'Ocorreu um erro ao concluir a batalha'}`);
    } finally {
      setCompletingBattle(false);
    }
  };

  // Função para iniciar a batalha
  const handleStartBattle = async () => {
    if (!battle) return;
    
    try {
      setIsUpdatingStatus(true);
      const response = await fetch(`/api/battles/${battle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });

      if (!response.ok) {
        throw new Error('Falha ao iniciar batalha');
      }

      const updatedBattle = await response.json();
      setBattle(updatedBattle);
    } catch (err) {
      console.error('Erro ao iniciar batalha:', err);
      setError('Erro ao iniciar batalha. Tente novamente mais tarde.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Funções para o formulário de evento
  const handleEventTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    const defaultPoints = selectedType ? EVENT_TYPES[selectedType as keyof typeof EVENT_TYPES]?.defaultPoints || 0 : 0;
    
    setNewEvent({
      ...newEvent,
      type: selectedType,
      points: defaultPoints,
    });
  };

  // Função para completar a batalha
  const handleCompleteBattle = async () => {
    if (!battle || !selectedWinner) return;
    
    try {
      setFinalizingBattle(true);
      setError(null);

      // Console log para ajudar no debug
      console.log('Enviando dados para finalizar batalha:', {
        battleId: battle.id,
        winnerId: selectedWinner,
        wasSharkFight: isSharkFight
      });

      const response = await fetch(`/api/battles/${battle.id}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          winnerId: selectedWinner,
          wasSharkFight: isSharkFight
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao finalizar batalha:', result);
        throw new Error(result.error || 'Erro ao finalizar batalha');
      }

      console.log('Batalha finalizada com sucesso:', result);

      // Atualizar os dados da batalha
      const updatedBattleResponse = await fetch(`/api/battles/${battle.id}`);
      if (!updatedBattleResponse.ok) {
        throw new Error('Erro ao atualizar dados da batalha');
      }
      
      const updatedBattle = await updatedBattleResponse.json();
      setBattle(updatedBattle);
      
      // Fechar modal e mostrar mensagem
      setShowFinalizeModal(false);
      setSuccessMessage('Batalha finalizada com sucesso!');
      
      // Mudar para aba de resultado
      setCurrentTab('winner');
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Erro ao finalizar batalha:', err);
      setError(err.message || 'Erro ao finalizar batalha. Tente novamente mais tarde.');
    } finally {
      setFinalizingBattle(false);
    }
  };

  // Renderizar carregamento
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/battles" className="text-blue-400 hover:underline">
            ← Voltar para Batalhas
          </Link>
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
        <div className="card p-8 text-center">
          <div className="animate-pulse flex space-x-4 justify-center items-center">
            <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
            <div className="h-12 w-12 bg-blue-400 rounded-full"></div>
          </div>
          <p className="mt-4 text-gray-400">Carregando detalhes da batalha...</p>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error || !battle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/battles" className="text-blue-400 hover:underline">
            ← Voltar para Batalhas
          </Link>
          <h1 className="text-3xl font-bold">Erro</h1>
        </div>
        <div className="card p-8 text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-400">{error || 'Batalha não encontrada'}</p>
          <Button 
            className="mt-4"
            onClick={() => router.push('/battles')}
          >
            Voltar para Batalhas
          </Button>
        </div>
      </div>
    );
  }

  // Formatar status da batalha
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Concluída', color: 'text-green-400' };
      case 'IN_PROGRESS':
        return { label: 'Em andamento', color: 'text-blue-400' };
      default:
        return { label: 'Pendente', color: 'text-yellow-400' };
    }
  };

  const status = getStatusLabel(battle.status);

  // Verificar se é possível adicionar eventos (batalha em andamento)
  const canAddEvents = battle.status === 'IN_PROGRESS';
  
  // Verificar se é possível concluir a batalha (em andamento e tem eventos)
  const canCompleteBattle = battle.status === 'IN_PROGRESS' && battle.events.length > 0;

  // Vencedor da batalha (se completada)
  const winner = battle.winnerId ? 
    (battle.startupA.id === battle.winnerId ? battle.startupA : battle.startupB) : 
    null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/battles" className="text-blue-400 hover:underline">
          ← Voltar para Batalhas
        </Link>
        <h1 className="text-3xl font-bold">Batalha</h1>
        <span className={`text-sm font-semibold px-2 py-1 rounded-full ${status.color}`}>
          {status.label}
        </span>
      </div>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">
            Rodada {battle.round.number}
          </h2>
          <div className="flex justify-between items-center">
            <div className="text-gray-400 text-sm">
              ID: {battle.id}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-6">
            <button 
              className={`py-2 px-1 -mb-px ${currentTab === 'info' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setCurrentTab('info')}
            >
              Informações
            </button>
            <button 
              className={`py-2 px-1 -mb-px ${currentTab === 'events' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
              onClick={() => setCurrentTab('events')}
            >
              Eventos
            </button>
            {battle.status === 'COMPLETED' && (
              <button 
                className={`py-2 px-1 -mb-px ${currentTab === 'winner' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-400 hover:text-gray-300'}`}
                onClick={() => setCurrentTab('winner')}
              >
                Resultado
              </button>
            )}
          </div>
        </div>

        {/* Tab: Informações */}
        {currentTab === 'info' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Startup A</h3>
                <p className="text-2xl font-bold mb-2">{battle.startupA.name}</p>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Pontuação atual:</div>
                  <div className="text-xl font-bold">{battle.startupA.points} pts</div>
                </div>
                <Link 
                  href={`/startups/${battle.startupA.id}`}
                  className="mt-4 inline-block text-blue-400 hover:underline"
                >
                  Ver perfil
                </Link>
              </div>

              <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Startup B</h3>
                <p className="text-2xl font-bold mb-2">{battle.startupB.name}</p>
                <div className="flex items-center justify-between">
                  <div className="text-gray-400">Pontuação atual:</div>
                  <div className="text-xl font-bold">{battle.startupB.points} pts</div>
                </div>
                <Link 
                  href={`/startups/${battle.startupB.id}`}
                  className="mt-4 inline-block text-blue-400 hover:underline"
                >
                  Ver perfil
                </Link>
              </div>
            </div>

            {/* Adicionar botão para iniciar batalha quando estiver pendente */}
            {battle.status === 'PENDING' && (
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg"
                  variant="primary"
                  loading={isUpdatingStatus}
                  onClick={handleStartBattle}
                >
                  Iniciar Batalha
                </Button>
              </div>
            )}

            {canAddEvents && (
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg"
                  onClick={() => router.push(`/battles/${battle.id}/events/new`)}
                >
                  Adicionar Evento
                </Button>
              </div>
            )}

            {canCompleteBattle && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="success"
                  size="lg"
                  loading={completingBattle}
                  onClick={() => setShowFinalizeModal(true)}
                >
                  Finalizar Batalha
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tab: Eventos */}
        {currentTab === 'events' && (
          <div>
            {/* Mensagem de sucesso ou erro */}
            {successMessage && (
              <div className="bg-green-900/30 border border-green-700 text-green-400 p-4 rounded-lg mb-6">
                {successMessage}
              </div>
            )}
            
            {eventSuccess && (
              <div className="bg-green-900/30 border border-green-700 text-green-400 p-4 rounded-lg mb-6">
                {eventSuccess}
              </div>
            )}
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}
            
            {eventError && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 p-4 rounded-lg mb-6">
                {eventError}
              </div>
            )}

            {canAddEvents ? (
              <>
                <h3 className="text-xl font-semibold mb-4">Adicionar Eventos</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  {/* Startup A */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-center">{battle.startupA.name}</h3>
                    <div className="text-center mb-4">
                      <span className="text-xl font-bold">{battle.startupA.points} pts</span>
                    </div>
                    <div className="space-y-3">
                      {EVENTOS.map((evento) => (
                        <button
                          key={`A-${evento.tipo}`}
                          className={`w-full py-2 px-4 rounded-md text-white ${evento.cor} ${actionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleAddEvent(battle.startupA.id, evento.tipo, evento.pontos)}
                          disabled={actionInProgress}
                        >
                          {evento.label} ({evento.pontos > 0 ? '+' : ''}{evento.pontos})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Startup B */}
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 text-center">{battle.startupB.name}</h3>
                    <div className="text-center mb-4">
                      <span className="text-xl font-bold">{battle.startupB.points} pts</span>
                    </div>
                    <div className="space-y-3">
                      {EVENTOS.map((evento) => (
                        <button
                          key={`B-${evento.tipo}`}
                          className={`w-full py-2 px-4 rounded-md text-white ${evento.cor} ${actionInProgress ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => handleAddEvent(battle.startupB.id, evento.tipo, evento.pontos)}
                          disabled={actionInProgress}
                        >
                          {evento.label} ({evento.pontos > 0 ? '+' : ''}{evento.pontos})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botão para finalizar a batalha */}
                {canCompleteBattle && (
                  <div className="flex justify-center mt-6">
                    <Button 
                      variant="success"
                      size="lg"
                      loading={completingBattle}
                      onClick={() => setShowFinalizeModal(true)}
                    >
                      Finalizar Batalha
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                {battle.status === 'PENDING' ? (
                  <p>A batalha ainda não foi iniciada. Inicie-a para adicionar eventos.</p>
                ) : (
                  <p>Esta batalha já foi concluída. Não é possível adicionar novos eventos.</p>
                )}
              </div>
            )}

            {/* Lista de eventos existentes */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Histórico de Eventos</h3>
              {battle.events.length > 0 ? (
                <div className="space-y-3">
                  {battle.events.map(event => {
                    const startup = event.startupId === battle.startupA.id ? battle.startupA.name : battle.startupB.name;
                    const eventType = EVENT_TYPES[event.type as keyof typeof EVENT_TYPES];
                    const isPositive = event.points > 0;
                    
                    return (
                      <div 
                        key={event.id} 
                        className="p-4 bg-gray-800 rounded-lg border border-gray-700 flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{startup}</span>
                          <span className="mx-2">-</span>
                          <span className={eventType?.color || (isPositive ? 'text-green-400' : 'text-red-400')}>
                            {eventType?.label || event.type}
                          </span>
                        </div>
                        <div className={isPositive ? 'text-green-400' : 'text-red-400'}>
                          {isPositive ? '+' : ''}{event.points} pts
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-gray-400">Nenhum evento registrado nesta batalha</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Resultado */}
        {currentTab === 'winner' && battle.status === 'COMPLETED' && (
          <div className="text-center py-6">
            <h3 className="text-xl font-semibold mb-6">Resultado da Batalha</h3>
            
            {winnerMessage && (
              <div className="bg-green-900/50 border border-green-500 p-4 rounded-md text-green-200 mb-6">
                {winnerMessage}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-8">
              <div className={`p-6 rounded-lg border ${battle.startupA.points > battle.startupB.points ? 'bg-green-900/20 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                <h4 className="text-lg font-semibold">{battle.startupA.name}</h4>
                <p className="text-3xl font-bold mt-2">{battle.startupA.points} pts</p>
                {battle.startupA.points > battle.startupB.points && (
                  <div className="text-green-400 mt-2 font-bold">Vencedor!</div>
                )}
              </div>
              
              <div className={`p-6 rounded-lg border ${battle.startupB.points > battle.startupA.points ? 'bg-green-900/20 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                <h4 className="text-lg font-semibold">{battle.startupB.name}</h4>
                <p className="text-3xl font-bold mt-2">{battle.startupB.points} pts</p>
                {battle.startupB.points > battle.startupA.points && (
                  <div className="text-green-400 mt-2 font-bold">Vencedor!</div>
                )}
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mb-4">Eventos da Batalha</h4>
            {battle.events.length === 0 ? (
              <p className="text-gray-400">Nenhum evento registrado para esta batalha.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="py-2 px-4 text-left">Startup</th>
                      <th className="py-2 px-4 text-left">Evento</th>
                      <th className="py-2 px-4 text-center">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {battle.events.map((event) => {
                      const eventType = eventTypes.find(et => et.value === event.type);
                      return (
                        <tr key={event.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">{event.startup.name}</td>
                          <td className="py-3 px-4">
                            {eventType?.label || event.type}
                          </td>
                          <td className={`py-3 px-4 text-center font-bold ${event.points > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {event.points > 0 ? `+${event.points}` : event.points}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-8">
              <Link href={`/rounds/${battle.round.id}`}>
                <Button>
                  Voltar para Rodada {battle.round.number}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Finalizar Batalha */}
      {showFinalizeModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Finalizar Batalha</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
                <strong>Erro:</strong> {error}
              </div>
            )}
            
            <p className="mb-4 text-gray-300">
              Selecione a startup vencedora desta batalha:
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="startupA"
                  name="winner"
                  className="mr-2"
                  value={battle.startupA.id}
                  checked={selectedWinner === battle.startupA.id}
                  onChange={() => setSelectedWinner(battle.startupA.id)}
                />
                <label htmlFor="startupA" className="cursor-pointer">
                  {battle.startupA.name} ({battle.startupA.points} pts)
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="startupB"
                  name="winner"
                  className="mr-2"
                  value={battle.startupB.id}
                  checked={selectedWinner === battle.startupB.id}
                  onChange={() => setSelectedWinner(battle.startupB.id)}
                />
                <label htmlFor="startupB" className="cursor-pointer">
                  {battle.startupB.name} ({battle.startupB.points} pts)
                </label>
              </div>
            </div>
            
            <div className="flex items-center mb-6">
              <input 
                type="checkbox"
                id="sharkFight"
                className="mr-2"
                checked={isSharkFight}
                onChange={() => setIsSharkFight(!isSharkFight)}
              />
              <label htmlFor="sharkFight" className="cursor-pointer">
                Foi um Shark Fight (desempate)? (+10 pontos bônus)
              </label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowFinalizeModal(false)}
                disabled={finalizingBattle}
              >
                Cancelar
              </Button>
              <Button 
                variant="success"
                loading={finalizingBattle}
                disabled={!selectedWinner || finalizingBattle}
                onClick={handleCompleteBattle}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 