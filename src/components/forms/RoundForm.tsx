'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRouter } from 'next/navigation';

const roundSchema = z.object({
  number: z.string().min(1, 'O número da rodada é obrigatório')
    .transform((val) => parseInt(val))
    .refine((val) => val > 0, 'O número da rodada deve ser positivo')
});

type RoundFormValues = z.infer<typeof roundSchema>;

export default function RoundForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RoundFormValues>({
    resolver: zodResolver(roundSchema),
    defaultValues: {
      number: '',
    }
  });

  const onSubmit = async (data: RoundFormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      setDebugInfo(null);
      
      // Formatando os dados
      const formattedData = {
        number: data.number,
      };

      console.log('Enviando dados:', formattedData);
      setDebugInfo(`Tentando enviar: ${JSON.stringify(formattedData)}`);

      // Chamada para a API
      const response = await fetch('/api/rounds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
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
        throw new Error(result.error || 'Erro ao cadastrar rodada');
      }
      
      // Redirecionar para a lista após salvar
      setDebugInfo(prev => `${prev}\nSucesso! Redirecionando...`);
      router.push('/rounds');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao cadastrar rodada:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao cadastrar a rodada');
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
      
      <Input
        label="Número da Rodada"
        type="number"
        error={errors.number?.message}
        placeholder="Digite o número da rodada"
        min="1"
        {...register('number')}
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/rounds')}
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