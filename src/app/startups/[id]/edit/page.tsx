'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// Schema de validação
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

export default function EditStartupPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StartupFormValues>({
    resolver: zodResolver(startupSchema),
  });

  // Carregar dados da startup
  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const response = await fetch(`/api/startups/${params.id}`);
        if (!response.ok) {
          throw new Error('Falha ao carregar dados da startup');
        }
        const data = await response.json();
        
        // Formatar a data para o formato esperado pelo input type="date"
        const formattedData = {
          ...data,
          foundedAt: new Date(data.foundedAt).toISOString().split('T')[0],
        };
        
        reset(formattedData);
      } catch (err) {
        console.error('Erro ao buscar startup:', err);
        setSubmitError('Erro ao carregar dados da startup. Tente novamente mais tarde.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStartup();
  }, [params.id, reset]);

  const onSubmit = async (data: StartupFormValues) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      
      // Formatando a data
      const formattedData = {
        ...data,
        foundedAt: new Date(data.foundedAt).toISOString(),
      };

      // Chamada para a API
      const response = await fetch(`/api/startups/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao atualizar a startup');
      }
      
      // Redirecionar para a página de detalhes da startup
      router.push(`/startups/${params.id}`);
      router.refresh();
    } catch (error: any) {
      console.error('Erro ao atualizar startup:', error);
      setSubmitError(error.message || 'Ocorreu um erro ao atualizar a startup');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderização de carregamento
  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/startups/${params.id}`} className="text-blue-400 hover:underline">
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
            <div className="h-10 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/startups/${params.id}`} className="text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold">Editar Startup</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-900/50 border border-red-500 p-3 rounded-md text-red-200">
              {submitError}
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
              onClick={() => router.push(`/startups/${params.id}`)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 