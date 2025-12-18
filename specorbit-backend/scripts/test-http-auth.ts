import axios from 'axios';

async function run() {
  try {
    const base = 'http://localhost:3000';
    // 1. Register
    const email = `dev.http.${Date.now()}@example.com`;
    const registerRes = await axios.post(`${base}/api/auth/register`, { email, password: 'password123', name: 'HTTP Test' }, { validateStatus: () => true });
    console.log('REGISTER status:', registerRes.status);
    console.log('REGISTER body:', registerRes.data);
    console.log('REGISTER set-cookie:', registerRes.headers['set-cookie']);

    const cookie = registerRes.headers['set-cookie'] ? registerRes.headers['set-cookie'][0].split(';')[0] : null;
    console.log('Cookie to use:', cookie);

    // 2. Call refresh with Cookie
    const refreshRes = await axios.post(`${base}/api/auth/refresh`, {}, { headers: { Cookie: cookie || '' }, validateStatus: () => true });
    console.log('REFRESH status:', refreshRes.status);
    console.log('REFRESH body:', refreshRes.data);

  } catch (err: any) {
    console.error('HTTP auth test error:', err.message || err);
    if (err.response) {
      console.error('Response status:', err.response.status, 'data:', err.response.data);
    }
  }
}

run();