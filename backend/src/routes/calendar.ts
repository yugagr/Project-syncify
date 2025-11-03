import express from 'express';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';

const router = express.Router();

router.get('/tasks/upcoming', requireAuth, async (req, res) => {
  const email = req.user?.email as string;
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase.from('tasks').select('*').or(`assignee.eq.${email},owner.eq.${email}`).gt('due_date', now).order('due_date', { ascending: true }).limit(50);
    if (error) throw error;
    res.json({ tasks: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;