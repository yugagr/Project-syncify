import express from 'express';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.get('/project/:id', requireAuth, async (req, res) => {
  const projectId = req.params.id;
  try {
    const { data, error } = await supabase.from('activity_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(200);
    if (error) throw error;
    res.json({ logs: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;