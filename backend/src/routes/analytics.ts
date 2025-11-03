import express from 'express';
import { supabase } from '../config/supabase';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.get('/project/:id/summary', requireAuth, async (req, res) => {
  const projectId = req.params.id;

  try {
    const { data: tasks } = await supabase.from('tasks').select('id, status').eq('project_id', projectId);
    const { data: messages } = await supabase.from('messages').select('id').eq('project_id', projectId);
    const { data: files } = await supabase.from('files').select('id').eq('project_id', projectId);

    res.json({
      tasks: tasks?.length ?? 0,
      messages: messages?.length ?? 0,
      files: files?.length ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;
