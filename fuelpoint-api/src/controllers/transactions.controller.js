import { asyncHandler } from '../utils/asyncHandler.js';
import * as TransactionService from '../services/transactions.service.js';
import { ApiError } from '../utils/ApiError.js';

export const getTransactions = asyncHandler(async (req, res) => {
    const queryParams = req.query;
    const result = await TransactionService.getTransactions(queryParams);
    res.json(result);
});

export const createTransaction = asyncHandler(async (req, res) => {
    try {
        const transactionData = req.body;
        const newTransaction = await TransactionService.createTransaction(transactionData);

        res.status(201).json({
            message: 'Transaction created successfully',
            data: newTransaction
        });
    } catch (error) {
        if (error.status) {
            throw new ApiError(error.status, error.message);
        }
        throw error;
    }
});
