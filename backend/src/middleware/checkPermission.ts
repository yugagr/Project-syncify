import { Response, NextFunction } from 'express';
import supabase from '../config/supabase';
import { RequestWithUser, Role } from '../types';

export default function checkPermission(projectIdParam = 'projectId', minRole: Role = 'member') {
  const order: Record<Role, number> = { viewer: 0, member: 1, manager: 2, admin: 3 };
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const projectId = (req.params as any)[projectIdParam] || (req.body as any)[projectIdParam] || (req.query as any)[projectIdParam];
    if (!projectId) return res.status(400).json({ error: 'projectId required' });
    try {
      const { data, error } = await supabase.from('project_members').select('role').eq('project_id', projectId).eq('user_email', req.user?.email).maybeSingle();
      if (error) throw error;
      if (!data) return res.status(403).json({ error: 'Not a member of project' });
      if (order[data.role as Role] < order[minRole]) return res.status(403).json({ error: 'Insufficient role' });
      req.projectRole = data.role as Role;
      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message || err });
    }
  };
}
