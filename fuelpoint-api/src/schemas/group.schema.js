import { z } from 'zod';

export const createGroupSchema = z.object({
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z0-9\s]+$/, 'Name can only contain letters, numbers, and spaces').min(2).max(100),
        discount_percent: z.coerce.number().min(0).max(100),
        description: z.coerce.string().max(500).optional(),
    })
});

export const updateGroupSchema = z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
        name: z.coerce.string().regex(/^[a-zA-Z0-9\s]+$/, 'Name can only contain letters, numbers, and spaces').min(2).max(100).optional(),
        discount_percent: z.coerce.number().min(0).max(100).optional(),
        description: z.coerce.string().max(500).optional(),
    })
});
