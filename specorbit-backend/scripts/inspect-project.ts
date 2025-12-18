import prisma from '../src/lib/prisma';

async function run() {
  const projectId = process.argv[2] || '266d833a-d928-432c-b920-fde997150946';
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  console.log('Project:', project);
  const specs = await prisma.openAPISpec.findMany({ where: { projectId } });
  console.log('Specs count:', specs.length);
  for (const s of specs) console.log(s.id, s.version, s.createdAt);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });