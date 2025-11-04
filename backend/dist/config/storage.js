"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicUrl = publicUrl;
const SUPABASE_URL = process.env.SUPABASE_URL || '';
function publicUrl(bucket, path) {
    return `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`;
}
