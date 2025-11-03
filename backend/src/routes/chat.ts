import express from 'express';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.get('/projects/:projectId/messages', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data, error } = await supabase.from('messages').select('*').eq('project_id', projectId).order('created_at', { ascending: true }).limit(200);
    if (error) throw error;
    res.json({ messages: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;