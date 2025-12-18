import axios from 'axios';

async function run() {
  try {
    const base = 'http://localhost:3000';
    const email = `dev.http.${Date.now()}@example.com`;
    const registerRes = await axios.post(`${base}/api/auth/register`, { email, password: 'password123', name: 'HTTP Test' }, { validateStatus: () => true });
    console.log('REGISTER status:', registerRes.status);
    console.log('REGISTER body:', registerRes.data);

    const token = registerRes.data?.accessToken;
    if (!token) {
      console.error('No access token returned from register');
      process.exit(1);
    }

    const projectId = '266d833a-d928-432c-b920-fde997150946';
    const res = await axios.get(`${base}/api/projects/${projectId}/specs/latest`, { headers: { Authorization: `Bearer ${token}` }, validateStatus: () => true });
    console.log('GET LATEST status:', res.status);
    console.log('body:', res.data);

  } catch (err: any) {
    console.error('Error:', err.message || err);
    if (err.response) console.error('Response:', err.response.status, err.response.data);
  }
}

run();