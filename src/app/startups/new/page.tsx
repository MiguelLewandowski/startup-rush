import Link from 'next/link';
import StartupForm from '@/components/forms/StartupForm';

export default function NewStartupPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/startups" className="text-blue-400 hover:underline">
          ← Voltar
        </Link>
        <h1 className="text-3xl font-bold">Nova Startup</h1>
      </div>

      <div className="card">
        <StartupForm />
      </div>
    </div>
  );
} 