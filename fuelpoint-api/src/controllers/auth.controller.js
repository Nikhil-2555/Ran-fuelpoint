import { asyncHandler } from '../utils/asyncHandler.js';
import * as AuthService from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result);
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token is required');
    }
    const newAccessToken = await AuthService.refreshAccessToken(refreshToken);
    res.json({ accessToken: newAccessToken });
});

export const getMe = asyncHandler(async (req, res) => {
    const admin = await AuthService.getMe(req.user.id);
    res.json({
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
            location: admin.location,
            avatarUrl: admin.avatar_url,
            joinedAt: admin.joined_at
        }
    });
});

export const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        throw new ApiError(400, 'Name is required');
    }

    const admin = await AuthService.updateProfile(req.user.id, name);
    res.json({
        status: 'success',
        message: 'Profile updated successfully',
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role: admin.role,
            location: admin.location,
            avatarUrl: admin.avatar_url,
            joinedAt: admin.joined_at
        }
    });
});

export const registerAdmin = asyncHandler(async (req, res) => {
    const adminData = req.body;
    const newAdmin = await AuthService.registerAdmin(adminData);

    res.status(201).json({
        status: 'success',
        message: 'Admin created successfully',
        data: newAdmin
    });
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.id, oldPassword, newPassword);

    res.json({
        status: 'success',
        message: 'Password changed successfully'
    });
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword } = req.body;
    await AuthService.resetPassword(email, newPassword);

    res.json({
        status: 'success',
        message: 'Password successfully reset'
    });
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const genericMessage = 'If this email is registered, a password reset link has been sent.';

    try {
        await AuthService.forgotPassword(email);
    } catch (err) {
        console.error('Forgot-password error:', err.message);
    }

    res.json({
        status: 'success',
        message: genericMessage,
    });
});

export const tokenResetPassword = asyncHandler(async (req, res) => {
    const { token, newPassword } = req.body;
    await AuthService.tokenResetPassword(token, newPassword);

    res.json({
        status: 'success',
        message: 'Password successfully changed.',
    });
});
