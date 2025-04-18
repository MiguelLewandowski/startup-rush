'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useRouter } from 'next/navigation';

const startupSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').max(100, 'O nome deve ter no máximo 100 caracteres'),
  slogan: z.string().min(5, 'O slogan deve ter pelo menos 5 caracteres').max(200, 'O slogan deve ter no máximo 200 caracteres'),
  foundedAt: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, {
    message: 'Data de fundação inválida',
  }),
});

type StartupFormValues = z.infer<typeof startupSchema>;

export default function StartupForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StartupFormValues>({
    resolver: zodResolver(startupSchema),
  });

  const onSubmit = async (data: StartupFormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      setDebugInfo(null);
      
      // Formatando a data
      const formattedData = {
        ...data,
        foundedAt: new Date(data.foundedAt).toISOString(),
      };

      console.log('Enviando dados:', formattedData);
      setDebugInfo(`Tentando enviar: ${JSON.stringify(formattedData)}`);

      // Chamada para a API
      const response = await fetch('/api/startups', {
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
        throw new Error(result.error || 'Erro ao cadastrar startup');
      }
      
      // Redirecionar para a lista após salvar
      setDebugInfo(prev => `${prev}\nSucesso! Redirecionando...`);
      router.push('/startups');
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao cadastrar startup:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao cadastrar a startup');
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
        label="Nome da Startup"
        error={errors.name?.message}
        placeholder="Digite o nome da startup"
        {...register('name')}
      />

      <Input
        label="Slogan"
        error={errors.slogan?.message}
        placeholder="Digite o slogan da startup"
        {...register('slogan')}
      />

      <Input
        label="Data de Fundação"
        type="date"
        error={errors.foundedAt?.message}
        {...register('foundedAt')}
      />

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/startups')}
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