import { app } from './app.js';
import { env } from './config/env.js';

const startServer = () => {
    app.listen(env.PORT, () => {
        console.log(`🚀 API Server running on http://localhost:${env.PORT}`);
    });
};

startServer();
// Updated APP_URL configuration
