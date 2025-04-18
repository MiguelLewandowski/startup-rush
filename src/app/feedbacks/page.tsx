import React from 'react';
import Link from 'next/link';

export default async function FeedbacksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Feedbacks</h1>
        <button className="btn-primary">
          Novo Feedback
        </button>
      </div>

      <div className="card">
        <div className="mb-4">
          <p>Gerencie os feedbacks para as startups.</p>
          <p className="text-sm text-gray-400 mt-1">
            Os feedbacks ajudam as startups a melhorarem suas apresentações e produtos.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-700 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Nenhum feedback cadastrado</h3>
                <p className="text-sm text-gray-400">Clique em "Novo Feedback" para registrar o primeiro feedback</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 