import { z } from 'zod';

export const createTransactionSchema = z.object({
    body: z.object({
        customer_id: z.string().uuid(),
        worker_id: z.string().uuid(),
        amount: z.number().positive(),
        litres: z.number().positive(),
        fuel: z.enum(['Petrol', 'Diesel', 'CNG']),
    })
});
