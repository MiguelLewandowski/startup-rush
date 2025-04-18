import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');

  // Limpar banco de dados
  await prisma.event.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.battle.deleteMany();
  await prisma.round.deleteMany();
  await prisma.startup.deleteMany();

  console.log('Banco de dados limpo');

  // Criar startups
  const startups = await Promise.all([
    prisma.startup.create({
      data: {
        name: 'TechNova',
        slogan: 'Inovação tecnológica para um futuro melhor',
        foundedAt: new Date('2022-05-15'),
        points: 70,
      },
    }),
    prisma.startup.create({
      data: {
        name: 'EcoSolutions',
        slogan: 'Soluções sustentáveis para um planeta mais verde',
        foundedAt: new Date('2021-11-20'),
        points: 70,
      },
    }),
    prisma.startup.create({
      data: {
        name: 'FinanceHub',
        slogan: 'Revolucionando o mercado financeiro digital',
        foundedAt: new Date('2020-08-05'),
        points: 70,
      },
    }),
    prisma.startup.create({
      data: {
        name: 'HealthTech',
        slogan: 'Tecnologia a serviço da saúde e bem-estar',
        foundedAt: new Date('2019-03-12'),
        points: 70,
      },
    }),
    prisma.startup.create({
      data: {
        name: 'EduPlus',
        slogan: 'Educação acessível e de qualidade para todos',
        foundedAt: new Date('2021-07-30'),
        points: 70,
      },
    }),
    prisma.startup.create({
      data: {
        name: 'AIVision',
        slogan: 'Inteligência artificial transformando o mundo',
        foundedAt: new Date('2022-02-10'),
        points: 70,
      },
    }),
  ]);

  console.log(`Criadas ${startups.length} startups`);

  // Criar primeira rodada
  const round1 = await prisma.round.create({
    data: {
      number: 1,
    },
  });

  console.log(`Criada rodada ${round1.number}`);

  // Criar batalhas da primeira rodada
  const battles = await Promise.all([
    prisma.battle.create({
      data: {
        roundId: round1.id,
        startupAId: startups[0].id,
        startupBId: startups[1].id,
        status: 'PENDING',
      },
    }),
    prisma.battle.create({
      data: {
        roundId: round1.id,
        startupAId: startups[2].id,
        startupBId: startups[3].id,
        status: 'PENDING',
      },
    }),
    prisma.battle.create({
      data: {
        roundId: round1.id,
        startupAId: startups[4].id,
        startupBId: startups[5].id,
        status: 'PENDING',
      },
    }),
  ]);

  console.log(`Criadas ${battles.length} batalhas`);

  console.log('Seed concluído com sucesso!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erro durante a execução do seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  }); 