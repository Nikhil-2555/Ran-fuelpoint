import { query } from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';

export const getGroups = async () => {
    const dataResult = await query(`SELECT * FROM v_group_distribution ORDER BY is_default DESC, created_at ASC`);
    return dataResult.rows;
};

export const createGroup = async (groupData) => {
    const { id, name, discount_percent, discount_percentage, is_default, description, active } = groupData;

    if (!name) {
        throw new ApiError(400, 'Group name is required');
    }

    const groupId = id || `grp-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const discount = discount_percent !== undefined ? discount_percent : (discount_percentage || 0);

    const insertResult = await query(
        `INSERT INTO discount_groups (id, name, discount_percent, is_default, description, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [groupId, name, discount, is_default || false, description || '', active !== undefined ? active : true]
    );

    return insertResult.rows[0];
};

export const updateGroup = async (id, updateData) => {
    const { name, discount_percent, discount_percentage, is_default, description, active } = updateData;

    const existingGroup = await query('SELECT id FROM discount_groups WHERE id = $1', [id]);
    if (existingGroup.rows.length === 0) {
        throw new ApiError(404, 'Group not found');
    }

    const discount = discount_percent !== undefined ? discount_percent : (discount_percentage || 0);

    const updateResult = await query(
        `UPDATE discount_groups 
         SET name = $1, discount_percent = $2, is_default = $3, description = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
        [name, discount, is_default || false, description || '', active !== undefined ? active : true, id]
    );

    return updateResult.rows[0];
};

export const deleteGroup = async (id) => {
    const existingGroup = await query('SELECT id FROM discount_groups WHERE id = $1', [id]);
    if (existingGroup.rows.length === 0) {
        throw new ApiError(404, 'Group not found');
    }

    const defaultGroupResult = await query('SELECT id FROM discount_groups WHERE is_default = TRUE LIMIT 1');
    const defaultGroupId = defaultGroupResult.rows.length > 0 ? defaultGroupResult.rows[0].id : 'grp-default';

    if (id === defaultGroupId) {
        throw new ApiError(400, 'Cannot delete the default group');
    }

    // Reassign all associated customers and transactions to the default group
    await query('UPDATE customers SET group_id = $1 WHERE group_id = $2', [defaultGroupId, id]);
    await query('UPDATE transactions SET group_id = $1 WHERE group_id = $2', [defaultGroupId, id]);

    await query('DELETE FROM discount_groups WHERE id = $1', [id]);
};
