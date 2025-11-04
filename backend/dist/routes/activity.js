"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = express_1.default.Router();
router.get('/project/:id', requireAuth_1.default, async (req, res) => {
    const projectId = req.params.id;
    try {
        const { data, error } = await supabase_1.default.from('activity_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(200);
        if (error)
            throw error;
        res.json({ logs: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
