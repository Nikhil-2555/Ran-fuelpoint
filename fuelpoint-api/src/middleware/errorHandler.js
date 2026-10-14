import { ApiError } from '../utils/ApiError.js';
import { ZodError } from 'zod';

export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({ error: err.message });
    }

    if (err instanceof ZodError) {
        const errorMessages = err.errors.map(e => `${e.path.slice(-1)}: ${e.message}`).join(', ');
        return res.status(400).json({ error: errorMessages || 'Validation failed', details: err.errors });
    }

    if (err.code === '23505') { // Postgres unique violation
        return res.status(409).json({ error: 'Resource already exists' });
    }

    if (err.code === '22P02') { // Postgres invalid text representation (e.g. enum invalid)
        return res.status(400).json({ error: 'Invalid input value provided for one of the fields.' });
    }

    return res.status(500).json({ error: 'Internal server error' });
};
