import crypto from 'crypto';
import { query } from '../config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { sendResetEmail } from '../utils/mailer.js';

export const login = async (email, password) => {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password');
    }

    const accessToken = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { id: admin.id },
        env.JWT_REFRESH_SECRET,
        { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
    );

    return {
        accessToken,
        refreshToken,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            location: admin.location,
            avatarUrl: admin.avatar_url
        }
    };
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
        
        const result = await query('SELECT id, email, role FROM admins WHERE id = $1', [decoded.id]);
        if (result.rows.length === 0) {
            throw new ApiError(401, 'Invalid refresh token - user not found');
        }

        const admin = result.rows[0];
        const newAccessToken = jwt.sign(
            { id: admin.id, email: admin.email, role: admin.role },
            env.JWT_SECRET,
            { expiresIn: env.JWT_EXPIRES_IN }
        );

        return newAccessToken;
    } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(403, 'Invalid or expired refresh token. Please login again.');
    }
};

export const getMe = async (adminId) => {
    const result = await query(
        'SELECT id, name, email, phone, role, location, avatar_url, joined_at FROM admins WHERE id = $1',
        [adminId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, 'Admin not found');
    }

    return result.rows[0];
};

export const updateProfile = async (adminId, name) => {
    const result = await query(
        'UPDATE admins SET name = $1 WHERE id = $2 RETURNING id, name, email, phone, role, location, avatar_url, joined_at',
        [name, adminId]
    );

    if (result.rows.length === 0) {
        throw new ApiError(404, 'Admin not found');
    }

    return result.rows[0];
};

export const registerAdmin = async (adminData) => {
    const { name, email, phone, password, role, location } = adminData;

    const checkResult = await query('SELECT id FROM admins WHERE email = $1', [email]);
    if (checkResult.rows.length > 0) {
        throw new ApiError(400, 'Admin with this email already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const lastIdResult = await query(
        "SELECT id FROM admins WHERE id LIKE 'ADM-%' ORDER BY CAST(SUBSTRING(id FROM 5) AS INTEGER) DESC LIMIT 1"
    );
    let nextNum = 1000;
    if (lastIdResult.rows.length > 0) {
        const lastIdStr = lastIdResult.rows[0].id;
        const numPart = parseInt(lastIdStr.split('-')[1]);
        if (!isNaN(numPart)) {
            nextNum = numPart + 1;
        }
    }
    const newId = `ADM-${nextNum}`;

    const result = await query(
        `INSERT INTO admins (id, name, email, phone, password_hash, role, location, joined_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING id, name, email, role`,
        [newId, name, email, phone, passwordHash, role, location]
    );

    return result.rows[0];
};

export const changePassword = async (adminId, oldPassword, newPassword) => {
    const result = await query('SELECT password_hash FROM admins WHERE id = $1', [adminId]);
    if (result.rows.length === 0) {
        throw new ApiError(404, 'Admin not found');
    }

    const currentHash = result.rows[0].password_hash;
    const isMatch = await bcrypt.compare(oldPassword, currentHash);
    if (!isMatch) {
        throw new ApiError(400, 'Incorrect old password');
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newPasswordHash, adminId]);
};

export const resetPassword = async (email, newPassword) => {
    const result = await query('SELECT id FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw new ApiError(404, 'No admin found with that email address');
    }

    const adminId = result.rows[0].id;
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await query('UPDATE admins SET password_hash = $1 WHERE id = $2', [newPasswordHash, adminId]);
};

export const forgotPassword = async (email) => {
    const result = await query('SELECT id, email FROM admins WHERE email = $1', [email]);

    if (result.rows.length > 0) {
        const admin = result.rows[0];
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiry = new Date(Date.now() + 30 * 60 * 1000);

        await query(
            'UPDATE admins SET reset_token_hash = $1, reset_token_expiry = $2 WHERE id = $3',
            [tokenHash, expiry.toISOString(), admin.id]
        );

        const appUrl = env.APP_URL;
        const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;
        await sendResetEmail(admin.email, resetUrl);
    }
};

export const tokenResetPassword = async (token, newPassword) => {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const result = await query(
        `SELECT id FROM admins
         WHERE reset_token_hash = $1
           AND reset_token_expiry > NOW()`,
        [tokenHash]
    );

    if (result.rows.length === 0) {
        throw new ApiError(400, 'Invalid or expired reset token. Please request a new password reset link.');
    }

    const admin = result.rows[0];
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await query(
        `UPDATE admins
         SET password_hash = $1,
             reset_token_hash = NULL,
             reset_token_expiry = NULL
         WHERE id = $2`,
        [newPasswordHash, admin.id]
    );
};
