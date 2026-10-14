import { z } from 'zod';

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(4),
    })
});

export const registerAdminSchema = z.object({
    body: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        phone: z.string().min(10).optional(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        role: z.enum(['super_admin', 'admin']).optional().default('admin'),
        location: z.string().optional()
    })
});

export const changePasswordSchema = z.object({
    body: z.object({
        oldPassword: z.string().min(4),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    })
});

export const resetPasswordSchema = z.object({
    body: z.object({
        email: z.string().email(),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
    })
});

export const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.string().email('Please enter a valid email address'),
    })
});

export const tokenResetPasswordSchema = z.object({
    body: z.object({
        token: z.string().min(1, 'Reset token is required'),
        newPassword: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm password is required'),
    }).refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    })
});
