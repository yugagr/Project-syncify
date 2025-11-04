import express, { Response, NextFunction, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import checkPermission from '../middleware/checkPermission';
import logAction from '../utils/LogAction';

const router = express.Router();

// Async wrapper to handle async route errors
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): express.RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// Create Board
router.post(
  '/projects/:projectId/boards',
  requireAuth,
  checkPermission('projectId', 'member') as express.RequestHandler,
  asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { title } = req.body as { title: string };
    const id = uuidv4();

    const { data, error } = await supabase
      .from('boards')
      .insert([{ id, project_id: projectId, title }])
      .select()
      .single();

    if (error) throw error;

    const userEmail = req.user?.email;
    if (typeof userEmail !== 'string') {
      return res.status(400).json({ error: 'User email is required' });
    }
    await logAction(userEmail, projectId, `created board ${title}`);
    res.json({ board: data });
  })
);

// Create Column
router.post(
  '/boards/:boardId/columns',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    const { title, position = 0 } = req.body as { title: string; position?: number };
    const id = uuidv4();

    const { data, error } = await supabase
      .from('columns')
      .insert([{ id, board_id: boardId, title, position }])
      .select()
      .single();

    if (error) throw error;
    res.json({ column: data });
  })
);

// Create Task
router.post(
  '/columns/:columnId/tasks',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { columnId } = req.params;
    const { title, description = '', assignee = null, due_date = null } = req.body;
    const id = uuidv4();

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ id, column_id: columnId, title, description, assignee, due_date }])
      .select()
      .single();

    if (error) throw error;

    await logAction(req.user?.email || 'unknown', (data as any).project_id || 'unknown', `created task ${title}`);
    res.json({ task: data });
  })
);

// Move Task
router.put(
  '/tasks/:taskId/move',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { column_id, position } = req.body as { column_id?: string; position?: number };

    const updates: Record<string, any> = {};
    if (column_id) updates.column_id = column_id;
    if (position !== undefined) updates.position = position;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    await logAction(req.user?.email || 'unknown', (data as any).project_id || 'unknown', `moved task ${taskId}`);
    res.json({ task: data });
  })
);

export default router;
