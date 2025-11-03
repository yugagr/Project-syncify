const SUPABASE_URL = process.env.SUPABASE_URL || '';
export function publicUrl(bucket: string, path: string) {
return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
}