import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import routes
import authRoutes from './routes/auth';
import tournamentRoutes from './routes/tournament';
import participantRoutes from './routes/participant';
import bracketRoutes from './routes/bracket';
import matchRoutes from './routes/match';
import scheduleRoutes from './routes/schedule';
import uploadRoutes from './routes/upload';
import locationRoutes from './routes/location';
import slideRoutes from './routes/slide';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    timezone: 'Asia/Ho_Chi_Minh'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/bracket', bracketRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/slides', slideRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Miiracer Badminton Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌏 Timezone: Asia/Ho_Chi_Minh (UTC+7)`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;