"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const checkPermission_1 = __importDefault(require("../middleware/checkPermission"));
const LogAction_1 = __importDefault(require("../utils/LogAction"));
const router = express_1.default.Router();
// Async wrapper to handle async route errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
// Create Board
router.post('/projects/:projectId/boards', requireAuth_1.default, (0, checkPermission_1.default)('projectId', 'member'), asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title } = req.body;
    const id = (0, uuid_1.v4)();
    const { data, error } = await supabase_1.default
        .from('boards')
        .insert([{ id, project_id: projectId, title }])
        .select()
        .single();
    if (error)
        throw error;
    const userEmail = req.user?.email;
    if (typeof userEmail !== 'string') {
        return res.status(400).json({ error: 'User email is required' });
    }
    await (0, LogAction_1.default)(userEmail, projectId, `created board ${title}`);
    res.json({ board: data });
}));
// Create Column
router.post('/boards/:boardId/columns', requireAuth_1.default, asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const { title, position = 0 } = req.body;
    const id = (0, uuid_1.v4)();
    const { data, error } = await supabase_1.default
        .from('columns')
        .insert([{ id, board_id: boardId, title, position }])
        .select()
        .single();
    if (error)
        throw error;
    res.json({ column: data });
}));
// Create Task
router.post('/columns/:columnId/tasks', requireAuth_1.default, asyncHandler(async (req, res) => {
    const { columnId } = req.params;
    const { title, description = '', assignee = null, due_date = null } = req.body;
    const id = (0, uuid_1.v4)();
    const { data, error } = await supabase_1.default
        .from('tasks')
        .insert([{ id, column_id: columnId, title, description, assignee, due_date }])
        .select()
        .single();
    if (error)
        throw error;
    await (0, LogAction_1.default)(req.user?.email || 'unknown', data.project_id || 'unknown', `created task ${title}`);
    res.json({ task: data });
}));
// Move Task
router.put('/tasks/:taskId/move', requireAuth_1.default, asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { column_id, position } = req.body;
    const updates = {};
    if (column_id)
        updates.column_id = column_id;
    if (position !== undefined)
        updates.position = position;
    const { data, error } = await supabase_1.default
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();
    if (error)
        throw error;
    await (0, LogAction_1.default)(req.user?.email || 'unknown', data.project_id || 'unknown', `moved task ${taskId}`);
    res.json({ task: data });
}));
exports.default = router;
