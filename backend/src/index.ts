import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import authRoutes       from './routes/auth.routes';
import userRoutes       from './routes/user.routes';
import roleRoutes       from './routes/role.routes';
import permissionRoutes from './routes/permission.routes';
import dashboardRoutes  from './routes/dashboard.routes';

// Register all Mongoose models upfront so populate() works everywhere
import './models/Permission';
import './models/Role';
import './models/User';

const app = express();

// ── Security & logging ──────────────────────────────────────────────────────
app.use(helmet());
app.use(morgan(env.isDev() ? 'dev' : 'combined'));

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      env: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    },
  });
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/roles',       roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/dashboard',   dashboardRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDB();
  const port = env.PORT;
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });
}

bootstrap();
