"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = express_1.default.Router();
router.get('/:projectId/members', requireAuth_1.default, async (req, res) => {
    const { projectId } = req.params;
    try {
        const { data, error } = await supabase_1.default.from('project_members').select('*').eq('project_id', projectId);
        if (error)
            throw error;
        res.json({ members: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
