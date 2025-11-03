// src/middleware/requireAuth.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { RequestWithUser } from '../types.d';

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });

    const token = authHeader.replace('Bearer ', '');
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info
    (req as RequestWithUser).user = {
      email: data.user.email ?? '',
      ...data.user,
    };

    next();
  } catch (err) {
    res.status(500).json({ error: 'Auth middleware error' });
  }
};

export default requireAuth;
