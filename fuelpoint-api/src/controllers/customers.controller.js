import { asyncHandler } from '../utils/asyncHandler.js';
import * as CustomerService from '../services/customers.service.js';

export const getCustomers = asyncHandler(async (req, res) => {
    console.log('✅ getCustomers controller hit');
    
    // 1. Extract query parameters
    const queryParams = req.query;

    // 2. Delegate to Service
    const result = await CustomerService.getCustomers(queryParams);

    // 3. Send HTTP Response
    res.json(result);
});

export const createCustomer = asyncHandler(async (req, res) => {
    // 1. Extract body
    const customerData = req.body;

    // 2. Delegate to Service
    const newCustomer = await CustomerService.createCustomer(customerData);

    // 3. Send HTTP Response
    res.status(201).json({
        message: 'Customer created successfully',
        data: newCustomer,
    });
});

export const updateCustomer = asyncHandler(async (req, res) => {
    // 1. Extract parameters and body
    const { id } = req.params;
    const updateData = req.body;

    // 2. Delegate to Service
    const updatedCustomer = await CustomerService.updateCustomer(id, updateData);

    // 3. Send HTTP Response
    res.json({
        message: 'Customer updated successfully',
        data: updatedCustomer,
    });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
    // 1. Extract parameter
    const { id } = req.params;

    // 2. Delegate to Service
    await CustomerService.deleteCustomer(id);

    // 3. Send HTTP Response
    res.json({
        message: 'Customer deleted successfully'
    });
});
