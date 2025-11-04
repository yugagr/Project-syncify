import express from 'express';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.get('/:projectId/members', requireAuth, async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data, error } = await supabase.from('project_members').select('*').eq('project_id', projectId);
    if (error) throw error;
    res.json({ members: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;