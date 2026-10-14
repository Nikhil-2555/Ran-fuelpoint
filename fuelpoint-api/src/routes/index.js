import { Router } from 'express';
import { authRoutes } from './auth.routes.js';
import { customerRoutes } from './customers.routes.js';
import { workerRoutes } from './workers.routes.js';
import { groupRoutes } from './groups.routes.js';
import { transactionRoutes } from './transactions.routes.js';
import { authMiddleware } from '../middleware/auth.js';

export const routes = Router();

routes.use('/auth', authRoutes);

// Protected routes below
routes.use(authMiddleware);
routes.use('/customers', customerRoutes);
routes.use('/workers', workerRoutes);
routes.use('/groups', groupRoutes);
routes.use('/transactions', transactionRoutes);
