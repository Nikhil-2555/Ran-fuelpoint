import { Router } from 'express';
import { getWorkers, createWorker, updateWorker, deleteWorker } from '../controllers/workers.controller.js';
import { validate } from '../middleware/validate.js';
import { createWorkerSchema, updateWorkerSchema } from '../schemas/worker.schema.js';

export const workerRoutes = Router();

workerRoutes.get('/', getWorkers);
workerRoutes.post('/', validate(createWorkerSchema), createWorker);
workerRoutes.put('/:id', validate(updateWorkerSchema), updateWorker);
workerRoutes.delete('/:id', deleteWorker);
