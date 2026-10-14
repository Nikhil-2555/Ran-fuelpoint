import { Router } from 'express';
import { login, refreshAccessToken, getMe, updateProfile, registerAdmin, changePassword, resetPassword, forgotPassword, tokenResetPassword } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerAdminSchema, changePasswordSchema, resetPasswordSchema, forgotPasswordSchema, tokenResetPasswordSchema } from '../schemas/auth.schema.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRoutes = Router();

authRoutes.post('/login', validate(loginSchema), login);
authRoutes.post('/refresh', refreshAccessToken);
authRoutes.get('/me', authMiddleware, getMe);
authRoutes.put('/me', authMiddleware, updateProfile);

// Admin Management
authRoutes.post('/register', authMiddleware, validate(registerAdminSchema), registerAdmin);
authRoutes.post('/change-password', authMiddleware, validate(changePasswordSchema), changePassword);

// Direct Reset Password (legacy — kept for backwards compatibility)
authRoutes.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// ─── Secure Forgot / Reset Password (email token flow) ──────────────────────
authRoutes.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
authRoutes.post('/token-reset-password', validate(tokenResetPasswordSchema), tokenResetPassword);
