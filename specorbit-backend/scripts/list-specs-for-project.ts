import prisma from '../src/lib/prisma';

async function run() {
  const projectId = process.argv[2] || '266d833a-d928-432c-b920-fde997150946';
  const specs = await prisma.openAPISpec.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  console.log('Specs for project', projectId, specs.length);
  specs.forEach(s => console.log(s.id, s.version, s.createdAt));
  process.exit(0);
}

run();