"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const router = express_1.default.Router();
router.get('/tasks/upcoming', requireAuth_1.default, async (req, res) => {
    const email = req.user?.email;
    try {
        const now = new Date().toISOString();
        const { data, error } = await supabase_1.default.from('tasks').select('*').or(`assignee.eq.${email},owner.eq.${email}`).gt('due_date', now).order('due_date', { ascending: true }).limit(50);
        if (error)
            throw error;
        res.json({ tasks: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
