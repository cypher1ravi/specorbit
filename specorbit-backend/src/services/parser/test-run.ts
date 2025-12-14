import { ExpressParser } from './express.parser';

const parser = new ExpressParser();

const sampleCode = `
import express from 'express';
const app = express();

/**
 * Get user by ID
 * @description Fetches a single user from the database
 */
app.get('/api/users/:userId', (req, res) => {
  const id = req.params.userId;
  const filter = req.query.active;
  
  if (!id) {
    return res.status(400).send('Missing ID');
  }

  res.status(200).json({ id, name: 'John' });
});
`;

console.log('--- Starting Deep Parse Test ---');
const results = parser.parseCode(sampleCode);
console.log(JSON.stringify(results, null, 2));
console.log('--- Test Complete ---');