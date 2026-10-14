import { Router } from 'express';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../controllers/groups.controller.js';
import { validate } from '../middleware/validate.js';
import { createGroupSchema, updateGroupSchema } from '../schemas/group.schema.js';

export const groupRoutes = Router();

groupRoutes.get('/', getGroups);
groupRoutes.post('/', validate(createGroupSchema), createGroup);
groupRoutes.put('/:id', validate(updateGroupSchema), updateGroup);
groupRoutes.delete('/:id', deleteGroup);
