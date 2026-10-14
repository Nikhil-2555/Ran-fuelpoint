import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactions.controller.js';

export const transactionRoutes = Router();

transactionRoutes.get('/', getTransactions);
transactionRoutes.post('/', createTransaction);
