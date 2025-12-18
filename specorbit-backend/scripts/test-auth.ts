import jwt from 'jsonwebtoken';
import { AuthService } from '../src/services/auth.service';

async function run() {
  try {
    const { accessToken, refreshToken } = AuthService.generateTokens('user-123');

    const accessSecret = process.env.JWT_SECRET || 'super_secret_key_change_me';
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

    const accessDecoded = jwt.verify(accessToken, accessSecret) as any;
    const refreshDecoded = jwt.verify(refreshToken, refreshSecret) as any;

    if (accessDecoded?.userId !== 'user-123' || refreshDecoded?.userId !== 'user-123') {
      console.error('Token payload mismatch', { accessDecoded, refreshDecoded });
      process.exit(1);
    }

    console.log('Tokens valid and contain userId');
    process.exit(0);
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
}

run();