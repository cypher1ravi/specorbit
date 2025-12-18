import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { json, urlencoded } from 'express';
import logger from './utils/logger';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhook.routes';
import apiRoutes from './routes/api.routes';
import adminRoutes from './routes/admin.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import { scheduler } from './services/scheduler.service';

// We will add routes here later
// import router from './routes';
const app: Express = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173', // Allow your Frontend URL
  credentials: true,               // Allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser Middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(cookieParser());
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

// Public docs endpoint (no auth required)
import { SpecController } from './controllers/spec.controller';
app.get('/api/docs', SpecController.listPublished);

app.use(authMiddleware)
app.use('/api/webhooks', webhookRoutes);
app.use('/api', apiRoutes);

// Admin routes (protected by auth middleware already)
app.use('/api/admin', adminRoutes);

// Start Scheduler (respects REDIS_URL or falls back to in-memory)
if (process.env.DISABLE_SCHEDULER !== 'true') {
  // Use configured interval or default
  const intervalMs = Number(process.env.DRIFT_CHECK_INTERVAL_MS) || undefined;
  scheduler.start(intervalMs);
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;