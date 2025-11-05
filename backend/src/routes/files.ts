import express from 'express';
import multer from 'multer';
import supabase from '../config/supabase';
import requireAuth from '../middleware/requireAuth';
import { publicUrl } from '../config/storage';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const file = req.file as Express.Multer.File | undefined;
  const { projectId } = req.body as { projectId?: string };
  if (!file) return res.status(400).json({ error: 'file required' });
  const bucket = 'project_bucket_public';
  const filename = `${Date.now()}_${file.originalname}`;
  try {
    const { data, error } = await supabase.storage.from(bucket).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
    if (error) throw error;
    const url = publicUrl(bucket, data.path);
    await supabase.from('files').insert([{ project_id: projectId || null, user_email: req.user?.email, path: data.path, url, name: file.originalname, size: file.size }]);
    res.json({ url, path: data.path });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err });
  }
});

export default router;