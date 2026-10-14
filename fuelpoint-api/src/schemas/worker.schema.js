import { z } from 'zod';

export const createWorkerSchema = z.object({
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces').min(2).max(120),
        email: z.string().email({ message: 'Email should contain @ symbol' }),
        phone: z.coerce.string().regex(/^\d+$/, 'Phone number can only contain digits').length(10, 'Phone number must be exactly 10 digits'),
        shift: z.enum(['Morning', 'Evening', 'Night']),
        password: z.string().min(4).optional(),
    })
});

export const updateWorkerSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces').min(2).max(120).optional(),
        email: z.string().email({ message: 'Email should contain @ symbol' }).optional(),
        phone: z.coerce.string().regex(/^\d+$/, 'Phone number can only contain digits').length(10, 'Phone number must be exactly 10 digits').optional(),
        shift: z.enum(['Morning', 'Evening', 'Night']).optional(),
    })
});

export const updateWorkerStatusSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        status: z.enum(['active', 'offline', 'suspended']),
    })
});
