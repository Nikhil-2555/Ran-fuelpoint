import { asyncHandler } from '../utils/asyncHandler.js';
import * as WorkerService from '../services/workers.service.js';

export const getWorkers = asyncHandler(async (req, res) => {
    const queryParams = req.query;
    const result = await WorkerService.getWorkers(queryParams);
    res.json(result);
});

export const createWorker = asyncHandler(async (req, res) => {
    const workerData = req.body;
    const newWorker = await WorkerService.createWorker(workerData);

    res.status(201).json({
        message: 'Worker created successfully',
        data: newWorker,
    });
});

export const updateWorker = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedWorker = await WorkerService.updateWorker(id, updateData);

    res.json({
        message: 'Worker updated successfully',
        data: updatedWorker,
    });
});

export const deleteWorker = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await WorkerService.deleteWorker(id);

    res.json({
        message: 'Worker deleted successfully'
    });
});
