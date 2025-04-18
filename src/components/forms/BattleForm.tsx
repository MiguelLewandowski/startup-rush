'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

// Interfaces para tipagem
interface Startup {
  id: string;
  name: string;
}

interface Round {
  id: string;
  number: number;
}

interface BattleFormProps {
  startups: Startup[];
  rounds: Round[];
  preselectedRoundId?: string;
}

// Schema de validação
const battleSchema = z.object({
  roundId: z.string().uuid('ID da rodada inválido'),
  startupAId: z.string().uuid('ID da startup A inválido'),
  startupBId: z.string().uuid('ID da startup B inválido'),
}).refine(data => data.startupAId !== data.startupBId, {
  message: "As startups devem ser diferentes",
  path: ["startupBId"]
});

type BattleFormValues = z.infer<typeof battleSchema>;

export default function BattleForm({ startups, rounds, preselectedRoundId }: BattleFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BattleFormValues>({
    resolver: zodResolver(battleSchema),
    defaultValues: {
      roundId: preselectedRoundId || '',
      startupAId: '',
      startupBId: '',
    }
  });

  // Para evitar que a mesma startup seja selecionada duas vezes
  const selectedStartupA = watch('startupAId');

  const onSubmit = async (data: BattleFormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      setDebugInfo(null);
      
      console.log('Enviando dados:', data);
      setDebugInfo(`Tentando enviar: ${JSON.stringify(data)}`);

      // Chamada para a API
      const response = await fetch('/api/battles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      // Verificando status da resposta
      setDebugInfo(`Status da resposta: ${response.status} ${response.statusText}`);

      // Verificar se a resposta é JSON válido
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
        setDebugInfo(prev => `${prev}\nResposta JSON: ${JSON.stringify(result)}`);
      } else {
        const text = await response.text();
        setDebugInfo(prev => `${prev}\nResposta não-JSON: ${text.substring(0, 500)}...`);
        throw new Error(`Resposta não é JSON válido: ${text.substring(0, 200)}...`);
      }

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar batalha');
      }
      
      // Redirecionar para a lista após salvar
      setDebugInfo(prev => `${prev}\nSucesso! Redirecionando...`);
      
      // Se temos um ID de rodada pré-selecionado, vamos para a página da rodada
      if (preselectedRoundId) {
        router.push(`/rounds/${preselectedRoundId}`);
      } else {
        router.push('/battles');
      }
      
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao cadastrar batalha:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao cadastrar a batalha');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200">
          {submitError}
        </div>
      )}
      
      {debugInfo && (
        <div className="bg-blue-900/50 border border-blue-500 p-3 rounded-md text-blue-200 text-xs font-mono whitespace-pre-wrap">
          <strong>Informações de depuração:</strong><br/>
          {debugInfo}
        </div>
      )}
      
      {/* Campo de seleção de rodada */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Rodada
        </label>
        <select
          className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.roundId ? 'border-red-500 focus:ring-red-500' : ''}`}
          disabled={!!preselectedRoundId}
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
      
      {/* Campo de seleção de Startup A */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Startup A
        </label>
        <select
          className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startupAId ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...register('startupAId')}
        >
          <option value="">Selecione a primeira startup</option>
          {startups.map((startup) => (
            <option key={startup.id} value={startup.id}>
              {startup.name}
            </option>
          ))}
        </select>
        {errors.startupAId && <p className="mt-1 text-sm text-red-500">{errors.startupAId.message}</p>}
      </div>
      
      {/* Campo de seleção de Startup B */}
      <div className="w-full">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Startup B
        </label>
        <select
          className={`w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startupBId ? 'border-red-500 focus:ring-red-500' : ''}`}
          {...register('startupBId')}
        >
          <option value="">Selecione a segunda startup</option>
          {startups
            .filter(startup => startup.id !== selectedStartupA)
            .map((startup) => (
              <option key={startup.id} value={startup.id}>
                {startup.name}
              </option>
            ))}
        </select>
        {errors.startupBId && <p className="mt-1 text-sm text-red-500">{errors.startupBId.message}</p>}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => preselectedRoundId ? router.push(`/rounds/${preselectedRoundId}`) : router.push('/battles')}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={isLoading}>
          Salvar
        </Button>
      </div>
    </form>
  );
} 