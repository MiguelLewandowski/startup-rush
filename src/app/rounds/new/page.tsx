import Link from 'next/link';
import RoundForm from '@/components/forms/RoundForm';

export default function NewRoundPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/rounds" className="text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold">Nova Rodada</h1>
      </div>

      <div className="card">
        <RoundForm />
      </div>
    </div>
  );
} 