import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Startup Rush',
  description: 'Um torneio entre startups que competem por pontuação em rodadas eliminatórias',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
          <header className="border-b border-gray-700">
            <div className="container mx-auto px-4 py-6">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Startup Rush
              </h1>
              <p className="text-gray-300 mt-2">Torneio de startups com rodadas eliminatórias</p>
            </div>
          </header>
          
          <nav className="bg-gray-800 border-b border-gray-700">
            <div className="container mx-auto px-4">
              <div className="flex space-x-4 overflow-x-auto py-3">
                <a href="/" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Início
                </a>
                <a href="/startups" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Startups
                </a>
                <a href="/rounds" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Rodadas
                </a>
                <a href="/battles" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Batalhas
                </a>
                <a href="/leaderboard" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Classificação
                </a>
                <a href="/feedbacks" className="px-3 py-2 rounded-md hover:bg-gray-700 transition">
                  Feedbacks
                </a>
              </div>
            </div>
          </nav>

          <main className="container mx-auto px-4 py-8">
            {children}
          </main>

          <footer className="border-t border-gray-700 py-6 text-center text-gray-400">
            <div className="container mx-auto px-4">
              <p>© {new Date().getFullYear()} Startup Rush - Todos os direitos reservados</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
} 