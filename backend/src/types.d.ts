import { Request } from 'express';

// ---- Roles ----
export type Role = 'viewer' | 'member' | 'manager' | 'admin';

// ---- Auth types ----
export interface UserPayload {
  email: string;          // must be string, not optional
  isAdmin?: boolean;
  [key: string]: any;
}

export interface RequestWithUser extends Request {
  user: UserPayload;      // required once authenticated
  projectRole?: Role;
}

// ---- Project-related types ----
export interface Project {
  id: string;
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
  owner?: string;
  public?: boolean;
  created_at?: string;
}

// ---- Kanban + Tasks ----
export interface Board {
  id: string;
  project_id: string;
  title: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position?: number;
}

export interface Task {
  id: string;
  board_id?: string;
  column_id?: string;
  title: string;
  description?: string;
  assignee?: string | null;
  owner?: string;
  due_date?: string | null;
  reminder_sent?: boolean;
}

// ---- Communication + Files ----
export interface Message {
  id: string;
  project_id: string;
  user_email: string;
  content: string;
  created_at?: string;
}

export interface FileMeta {
  id: string;
  project_id?: string;
  user_email: string;
  path: string;
  url: string;
  name: string;
  size: number;
}

// ---- Activity Logs ----
export interface ActivityLog {
  id: string;
  project_id?: string;
  user_email: string;
  action: string;
  created_at?: string;
}
