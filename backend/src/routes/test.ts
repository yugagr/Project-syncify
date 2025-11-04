import express from 'express';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('projects').select('*').limit(1);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, data });
});

export default router;
