"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../config/supabase");
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = express_1.default.Router();
router.get('/project/:id/summary', requireAuth_1.default, async (req, res) => {
    const projectId = req.params.id;
    try {
        const { data: tasks } = await supabase_1.supabase.from('tasks').select('id, status').eq('project_id', projectId);
        const { data: messages } = await supabase_1.supabase.from('messages').select('id').eq('project_id', projectId);
        const { data: files } = await supabase_1.supabase.from('files').select('id').eq('project_id', projectId);
        res.json({
            tasks: tasks?.length ?? 0,
            messages: messages?.length ?? 0,
            files: files?.length ?? 0,
        });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
