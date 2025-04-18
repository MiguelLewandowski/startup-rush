import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-10">
        <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Bem-vindo ao Startup Rush
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Um torneio emocionante onde startups competem em rodadas eliminatórias, 
          acumulando pontos através de diversos eventos para se tornarem campeãs!
        </p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/startups" className="card hover:border-blue-500 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">Gerenciar Startups</h2>
          <p className="text-gray-300">Cadastre novas startups para o torneio ou veja as participantes atuais.</p>
          <div className="mt-4 flex justify-end">
            <span className="btn-primary">Acessar</span>
          </div>
        </Link>

        <Link href="/rounds" className="card hover:border-purple-500 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Gerenciar Rodadas</h2>
          <p className="text-gray-300">Crie e gerencie as rodadas do torneio, avançando as startups vencedoras.</p>
          <div className="mt-4 flex justify-end">
            <span className="btn-secondary">Acessar</span>
          </div>
        </Link>

        <Link href="/battles" className="card hover:border-green-500 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Gerenciar Batalhas</h2>
          <p className="text-gray-300">Acompanhe e aplique eventos nas batalhas entre as startups.</p>
          <div className="mt-4 flex justify-end">
            <span className="btn-success">Acessar</span>
          </div>
        </Link>

        <Link href="/leaderboard" className="card hover:border-yellow-500 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Classificação</h2>
          <p className="text-gray-300">Veja o ranking atual das startups competidoras.</p>
          <div className="mt-4 flex justify-end">
            <span className="btn bg-yellow-600 hover:bg-yellow-700 text-white">Acessar</span>
          </div>
        </Link>

        <Link href="/feedbacks" className="card hover:border-red-500 transition-colors">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Feedbacks</h2>
          <p className="text-gray-300">Registre e veja feedbacks para as startups participantes.</p>
          <div className="mt-4 flex justify-end">
            <span className="btn-danger">Acessar</span>
          </div>
        </Link>
      </div>

      <section className="card">
        <h2 className="text-2xl font-bold mb-4">Como funciona o torneio?</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</div>
            <p className="text-gray-300">Cadastre de 4 a 8 startups para participar do torneio. Cada startup começa com 70 pontos.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</div>
            <p className="text-gray-300">Crie rodadas e sorteie as batalhas entre as startups participantes.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</div>
            <p className="text-gray-300">Aplique eventos nas batalhas, que podem aumentar ou diminuir os pontos das startups.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">4</div>
            <p className="text-gray-300">A startup com mais pontos em cada batalha avança para a próxima rodada.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">5</div>
            <p className="text-gray-300">Em caso de empate, ocorre o "Shark Fight", onde +2 pontos são adicionados aleatoriamente a uma das startups.</p>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">6</div>
            <p className="text-gray-300">A startup campeã é aquela que vencer a batalha final!</p>
          </div>
        </div>
      </section>
    </div>
  );
} 