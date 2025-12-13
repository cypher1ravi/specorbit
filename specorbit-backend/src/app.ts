import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json, urlencoded } from 'express';
import logger from './utils/logger';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhook.routes';

// We will add routes here later
// import router from './routes';
const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Parser Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(passport.initialize());
// Request Logger Middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/webhooks', webhookRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;