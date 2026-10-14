import { Router } from 'express';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../controllers/customers.controller.js';
import { validate } from '../middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from '../schemas/customer.schema.js';

export const customerRoutes = Router();

customerRoutes.get('/', getCustomers);
customerRoutes.post('/', validate(createCustomerSchema), createCustomer);
customerRoutes.put('/:id', validate(updateCustomerSchema), updateCustomer);
customerRoutes.delete('/:id', deleteCustomer);
