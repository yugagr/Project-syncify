import supabase from '../config/supabase';

export default async function logAction(userEmail: string, projectId: string | null, action: string) {
  try {
    await supabase.from('activity_logs').insert([{ user_email: userEmail, project_id: projectId || null, action }]);
  } catch (err) {
    console.warn('logAction failed:', (err as any).message || err);
  }
}