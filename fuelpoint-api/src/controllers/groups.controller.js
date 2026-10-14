import { asyncHandler } from '../utils/asyncHandler.js';
import * as GroupService from '../services/groups.service.js';

export const getGroups = asyncHandler(async (req, res) => {
    const groups = await GroupService.getGroups();
    res.json({
        data: groups
    });
});

export const createGroup = asyncHandler(async (req, res) => {
    const groupData = req.body;
    const newGroup = await GroupService.createGroup(groupData);

    res.status(201).json({
        message: 'Group created successfully',
        data: newGroup,
    });
});

export const updateGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const updatedGroup = await GroupService.updateGroup(id, updateData);

    res.json({
        message: 'Group updated successfully',
        data: updatedGroup,
    });
});

export const deleteGroup = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await GroupService.deleteGroup(id);

    res.json({
        message: 'Group deleted successfully'
    });
});
