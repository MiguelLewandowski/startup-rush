'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Schema de validação
const feedbackSchema = z.object({
  startupId: z.string().min(1, 'A startup é obrigatória'),
  roundId: z.string().min(1, 'A rodada é obrigatória'),
  content: z.string().min(10, 'O feedback deve ter pelo menos 10 caracteres').max(500, 'O feedback deve ter no máximo 500 caracteres'),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface Startup {
  id: string;
  name: string;
}

interface Round {
  id: string;
  number: number;
}

export default function NewFeedbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startups, setStartups] = useState<Startup[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const preselectedStartupId = searchParams.get('startupId');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      startupId: preselectedStartupId || '',
      roundId: '',
      content: '',
    },
  });

  // Carregar startups e rodadas
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar startups
        const startupsResponse = await fetch('/api/startups');
        if (!startupsResponse.ok) {
          throw new Error('Falha ao carregar startups');
        }
        const startupsData = await startupsResponse.json();

        // Buscar rodadas
        const roundsResponse = await fetch('/api/rounds');
        if (!roundsResponse.ok) {
          throw new Error('Falha ao carregar rodadas');
        }
        const roundsData = await roundsResponse.json();

        setStartups(startupsData);
        setRounds(roundsData);

        // Se tiver um ID de startup pré-selecionado, definir no formulário
        if (preselectedStartupId) {
          setValue('startupId', preselectedStartupId);
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setSubmitError('Erro ao carregar dados. Tente novamente mais tarde.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [preselectedStartupId, setValue]);

  const onSubmit = async (data: FeedbackFormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);

      // Chamada para a API
      const response = await fetch('/api/feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao cadastrar feedback');
      }

      // Redirecionar para a página de feedbacks ou startup
      if (preselectedStartupId) {
        router.push(`/startups/${preselectedStartupId}`);
      } else {
        router.push('/feedbacks');
      }
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao cadastrar feedback:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao cadastrar o feedback');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização de carregamento
  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/feedbacks" className="text-blue-400 hover:underline">
            ← Voltar
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
            <div className="h-30 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={preselectedStartupId ? `/startups/${preselectedStartupId}` : '/feedbacks'} className="text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold">Novo Feedback</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200">
              {submitError}
            </div>
          )}

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Startup
            </label>
            <select
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startupId ? 'border-red-500 focus:ring-red-500' : ''}`}
              disabled={!!preselectedStartupId}
              {...register('startupId')}
            >
              <option value="">Selecione uma startup</option>
              {startups.map((startup) => (
                <option key={startup.id} value={startup.id}>
                  {startup.name}
                </option>
              ))}
            </select>
            {errors.startupId && <p className="mt-1 text-sm text-red-500">{errors.startupId.message}</p>}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Rodada
            </label>
            <select
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.roundId ? 'border-red-500 focus:ring-red-500' : ''}`}
              {...register('roundId')}
            >
              <option value="">Selecione uma rodada</option>
              {rounds.map((round) => (
                <option key={round.id} value={round.id}>
                  Rodada {round.number}
                </option>
              ))}
            </select>
            {errors.roundId && <p className="mt-1 text-sm text-red-500">{errors.roundId.message}</p>}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Feedback
            </label>
            <textarea
              className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
                focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500 focus:ring-red-500' : ''}`}
              rows={5}
              placeholder="Digite o feedback para a startup"
              {...register('content')}
            ></textarea>
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content.message}</p>}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(preselectedStartupId ? `/startups/${preselectedStartupId}` : '/feedbacks')}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 