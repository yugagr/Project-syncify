"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const storage_1 = require("../config/storage");
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
router.post('/upload', requireAuth_1.default, upload.single('file'), async (req, res) => {
    const file = req.file;
    const { projectId } = req.body;
    if (!file)
        return res.status(400).json({ error: 'file required' });
    const bucket = 'public';
    const filename = `${Date.now()}_${file.originalname}`;
    try {
        const { data, error } = await supabase_1.default.storage.from(bucket).upload(filename, file.buffer, { contentType: file.mimetype, upsert: true });
        if (error)
            throw error;
        const url = (0, storage_1.publicUrl)(bucket, data.path);
        await supabase_1.default.from('files').insert([{ project_id: projectId || null, user_email: req.user?.email, path: data.path, url, name: file.originalname, size: file.size }]);
        res.json({ url, path: data.path });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
