'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Tipos de eventos disponíveis
const EVENT_TYPES = {
  'PITCH_CONVINCENTE': { label: 'Pitch Convincente', defaultPoints: 10 },
  'PRODUTO_COM_BUGS': { label: 'Produto com Bugs', defaultPoints: -8 },
  'BOA_TRACAO_USUARIOS': { label: 'Boa Tração de Usuários', defaultPoints: 15 },
  'INVESTIDOR_IRRITADO': { label: 'Investidor Irritado', defaultPoints: -12 },
  'FAKE_NEWS_PITCH': { label: 'Fake News no Pitch', defaultPoints: -15 },
  'PITCH_DECK_BEM_ESTRUTURADO': { label: 'Pitch Deck Bem Estruturado', defaultPoints: 8 },
  'MVP_FUNCIONAL': { label: 'MVP Funcional', defaultPoints: 12 },
  'PLANO_FINANCEIRO_SOLIDO': { label: 'Plano Financeiro Sólido', defaultPoints: 10 },
  'EQUIPE_QUALIFICADA': { label: 'Equipe Qualificada', defaultPoints: 15 },
  'RESPOSTA_RUIM_PERGUNTAS': { label: 'Resposta Ruim a Perguntas', defaultPoints: -10 },
};

// Schema de validação
const eventSchema = z.object({
  startupId: z.string().min(1, 'A startup é obrigatória'),
  type: z.string().min(1, 'O tipo de evento é obrigatório'),
  points: z.number({
    required_error: 'A pontuação é obrigatória',
    invalid_type_error: 'A pontuação deve ser um número',
  }),
  description: z.string().min(3, 'A descrição deve ter pelo menos 3 caracteres').max(200, 'A descrição deve ter no máximo 200 caracteres'),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface Battle {
  id: string;
  status: string;
  startupA: {
    id: string;
    name: string;
  };
  startupB: {
    id: string;
    name: string;
  };
}

export default function NewEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [battle, setBattle] = useState<Battle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      startupId: '',
      type: '',
      points: 0,
      description: '',
    },
  });

  // Observar mudanças no tipo de evento para atualizar os pontos
  const watchEventType = watch('type');
  
  useEffect(() => {
    if (watchEventType && EVENT_TYPES[watchEventType as keyof typeof EVENT_TYPES]) {
      setValue('points', EVENT_TYPES[watchEventType as keyof typeof EVENT_TYPES].defaultPoints);
    }
  }, [watchEventType, setValue]);

  // Carregar dados da batalha
  useEffect(() => {
    const fetchBattle = async () => {
      try {
        const response = await fetch(`/api/battles/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar dados da batalha');
        }
        const data = await response.json();
        
        // Verificar se a batalha está em andamento
        if (data.status !== 'IN_PROGRESS') {
          setError(`Não é possível adicionar eventos a uma batalha com status "${data.status}". A batalha precisa estar em andamento.`);
        }
        
        setBattle(data);
      } catch (err) {
        console.error('Erro ao buscar batalha:', err);
        setError('Erro ao carregar dados da batalha. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchBattle();
  }, [params.id]);

  const onSubmit = async (data: EventFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/battles/${params.id}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao adicionar evento');
      }

      // Redirecionar para a página da batalha
      router.push(`/battles/${params.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao adicionar evento:', error);
      setError(error.message || 'Ocorreu um erro ao adicionar o evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderização de carregamento
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/battles/${params.id}`} className="text-blue-400 hover:underline">
            ← Voltar para a Batalha
          </Link>
          <h1 className="text-3xl font-bold">Carregando...</h1>
        </div>
        <div className="card p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
            <div className="h-6 bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderização de erro ou batalha não encontrada
  if (error || !battle) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/battles/${params.id}`} className="text-blue-400 hover:underline">
            ← Voltar para a Batalha
          </Link>
          <h1 className="text-3xl font-bold">Erro</h1>
        </div>
        <div className="card p-6">
          <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200 mb-4">
            {error || 'Batalha não encontrada'}
          </div>
          <Button
            variant="outline"
            onClick={() => router.push(`/battles/${params.id}`)}
          >
            Voltar para a Batalha
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/battles/${params.id}`} className="text-blue-400 hover:underline">
          ← Voltar para a Batalha
        </Link>
        <h1 className="text-3xl font-bold">Adicionar Evento</h1>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Batalha: {battle.startupA.name} vs {battle.startupB.name}</h2>
          <p className="text-gray-400">
            Adicione um evento a esta batalha para registrar acontecimentos e atribuir pontos às startups.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Startup */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Startup
            </label>
            <select
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startupId ? 'border-red-500 focus:ring-red-500' : ''}`}
              {...register('startupId')}
            >
              <option value="">Selecione uma startup</option>
              <option value={battle.startupA.id}>{battle.startupA.name}</option>
              <option value={battle.startupB.id}>{battle.startupB.name}</option>
            </select>
            {errors.startupId && <p className="mt-1 text-sm text-red-500">{errors.startupId.message}</p>}
          </div>

          {/* Tipo de Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tipo de Evento
            </label>
            <select
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
              {...register('type')}
            >
              <option value="">Selecione o tipo de evento</option>
              {Object.entries(EVENT_TYPES).map(([key, { label, defaultPoints }]) => (
                <option key={key} value={key}>
                  {label} ({defaultPoints >= 0 ? `+${defaultPoints}` : defaultPoints} pontos)
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>}
          </div>

          {/* Pontos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Pontos
            </label>
            <Input
              type="number"
              error={errors.points?.message}
              {...register('points', { valueAsNumber: true })}
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Descrição
            </label>
            <textarea
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white resize-none
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
              rows={4}
              placeholder="Descreva o evento..."
              {...register('description')}
            ></textarea>
            {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/battles/${params.id}`)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Adicionar Evento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 