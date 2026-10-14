import { z } from 'zod';

export const createCustomerSchema = z.object({
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces').min(2).max(120),
        phone: z.coerce.string().regex(/^\d+$/, 'Phone number can only contain digits').length(10, 'Phone number must be exactly 10 digits'),
        email: z.string().email({ message: 'Email should contain @ symbol' }),
        vehicle: z.coerce.string().max(100).optional(),
        group_id: z.string(),
        password: z.string().min(4).optional(),
    })
});

export const updateCustomerSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces').min(2).max(120).optional(),
        phone: z.coerce.string().regex(/^\d+$/, 'Phone number can only contain digits').length(10, 'Phone number must be exactly 10 digits').optional(),
        email: z.string().email({ message: 'Email should contain @ symbol' }).optional(),
        vehicle: z.coerce.string().max(100).optional(),
        status: z.enum(['active', 'inactive', 'pending']).optional(),
    })
});

export const assignGroupSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({ group_id: z.string() })
});
