import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import logAction from '../utils/LogAction';
import { Project } from '../types';

// Extend Express Request interface to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: { email?: string; [key: string]: any };
    }
  }
}

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const { title, slug, summary, content = '', public: isPublic = false } = req.body as Partial<Project>;
  const owner = req.user?.email;
  if (typeof owner !== 'string') {
    return res.status(400).json({ error: 'User email is required' });
  }
  try {
    const id = uuidv4();
    const { data, error } = await supabase.from('projects').insert([{ id, title, slug, summary, content, owner, public: isPublic }]).select().single();
    if (error) throw error;
    await supabase.from('project_members').insert([{ project_id: id, user_email: owner, role: 'admin' }]);
    await logAction(owner, id, `created project ${title}`);
    res.json({ project: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

router.get('/public', async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').select('*').eq('public', true).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ projects: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

router.post('/:id/invite', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { email, role = 'member' } = req.body as { email: string; role?: string };
  try {
    const { data: caller, error: callerErr } = await supabase.from('project_members').select('role').eq('project_id', id).eq('user_email', req.user?.email).maybeSingle();
    if (callerErr) throw callerErr;
    if (!caller || (caller.role !== 'admin' && caller.role !== 'manager')) return res.status(403).json({ error: 'requires admin or manager' });
    await supabase.from('project_members').upsert({ project_id: id, user_email: email, role });
    await logAction(req.user?.email || 'unknown', id, `invited ${email} as ${role}`);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;
