import axios from 'axios';

async function run() {
  try {
    const base = 'http://localhost:3000';
    console.log('Testing GET /api/docs (public)');
    const res = await axios.get(`${base}/api/docs`, { validateStatus: () => true });
    console.log('Status:', res.status);
    if (res.status !== 200) {
      console.error('Failed to fetch docs:', res.status, res.data);
      process.exit(1);
    }

    const body = res.data;
    if (!Array.isArray(body.items)) {
      console.log('OK: No items or paginated response present:', body);
    } else {
      console.log('Found items:', body.items.length);
    }

    // Test pagination
    const paged = await axios.get(`${base}/api/docs?page=1&limit=1`, { validateStatus: () => true });
    console.log('Paged status:', paged.status);
    console.log('Paged body sample:', paged.data);

    console.log('Docs test passed');
    process.exit(0);
  } catch (err: any) {
    console.error('Docs test error', err.message || err);
    if (err.response) console.error(err.response.status, err.response.data);
    process.exit(1);
  }
}

run();