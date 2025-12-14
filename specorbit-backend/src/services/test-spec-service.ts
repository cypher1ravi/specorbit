import { SpecService } from './spec.service';
import 'dotenv/config';

// The Project ID you generated
const PROJECT_ID = '8f799b67-8b6a-42a0-964c-f41d01b6b0dc';

const sampleCode = `
import express from 'express';
const app = express();

/**
 * Check system health
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

/**
 * Create a new widget
 * @param {string} name - The widget name
 */
app.post('/api/widgets', (req, res) => {
  const name = req.body.name;
  if (!name) return res.status(400).send('Name required');
  res.status(201).json({ id: 123, name });
});
`;

async function main() {
  console.log('--- Starting Spec Service Simulation ---');
  
  const service = new SpecService();
  
  try {
    console.log(`\n1. Generating Spec for Project: ${PROJECT_ID}`);
    const savedSpec = await service.generateAndSave(PROJECT_ID, sampleCode, '1.0.0');
    
    console.log('✅ Spec Saved Successfully!');
    console.log('------------------------------------------------');
    console.log('Spec ID:    ', savedSpec.id);
    console.log('Version:    ', savedSpec.version);
    console.log('Is Published:', savedSpec.isPublished);
    console.log('------------------------------------------------');
    
    // Verify by fetching latest
    console.log('\n2. Fetching Latest Spec from DB...');
    const latest = await service.getLatestSpec(PROJECT_ID);
    
    if (latest) {
       console.log('✅ Fetch Verified. Latest Version:', latest.version);
       console.log('Spec JSON Summary:', JSON.stringify(latest.specJson).substring(0, 50) + '...');
    } else {
       console.log('❌ Could not fetch latest spec.');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

main();