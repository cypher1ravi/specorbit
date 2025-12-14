import { ExpressParser } from './express.parser';
import { OpenApiGenerator } from './openapi.generator';

const parser = new ExpressParser();
const generator = new OpenApiGenerator();

const sampleCode = `
import express from 'express';
const app = express();

/**
 * Get user details
 */
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  if (!userId) return res.status(404).send('Not found');
  res.status(200).json({ name: 'Alice' });
});

/**
 * Create new user
 */
app.post('/api/users', (req, res) => {
  res.status(201).send('Created');
});
`;

console.log('--- 1. Parsing Code ---');
const parsedRoutes = parser.parseCode(sampleCode);
console.log(`Found ${parsedRoutes.length} routes.`);

console.log('--- 2. Generating OpenAPI Spec ---');
const openApiSpec = generator.generateSpec(parsedRoutes, 'My Test API', '1.0.0');

console.log('--- 3. Final Output (JSON) ---');
console.log(JSON.stringify(openApiSpec, null, 2));