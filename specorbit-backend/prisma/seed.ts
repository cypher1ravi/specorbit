
import 'dotenv/config';
import prisma from '../src/lib/prisma';


async function main() {
  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'admin@specorbit.com' },
    update: {},
    create: {
      email: 'admin@specorbit.com',
      name: 'Admin User',
      tier: 'pro'
    }
  });

  // 2. Create Team
  const team = await prisma.team.create({
    data: {
      name: 'Admin Team',
      slug: 'admin-team-' + Date.now(),
      ownerId: user.id,
      tier: 'pro'
    }
  });

  // 3. Create Project
  const project = await prisma.project.create({
    data: {
      name: 'Demo API',
      slug: 'demo-api-' + Date.now(),
      teamId: team.id,
      description: 'A test project for SpecOrbit',
      language: 'javascript'
    }
  });

  console.log('--- Seed Successful ---');
  console.log('Project ID:', project.id);
  console.log('User Email:', user.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());