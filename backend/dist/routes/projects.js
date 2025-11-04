"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uuid_1 = require("uuid");
const supabase_1 = __importDefault(require("../config/supabase"));
const requireAuth_1 = __importDefault(require("../middleware/requireAuth"));
const LogAction_1 = __importDefault(require("../utils/LogAction"));
const router = express_1.default.Router();
router.post('/', requireAuth_1.default, async (req, res) => {
    const { title, slug, summary, content = '', public: isPublic = false } = req.body;
    const owner = req.user?.email;
    if (typeof owner !== 'string') {
        return res.status(400).json({ error: 'User email is required' });
    }
    try {
        const id = (0, uuid_1.v4)();
        const { data, error } = await supabase_1.default.from('projects').insert([{ id, title, slug, summary, content, owner, public: isPublic }]).select().single();
        if (error)
            throw error;
        await supabase_1.default.from('project_members').insert([{ project_id: id, user_email: owner, role: 'admin' }]);
        await (0, LogAction_1.default)(owner, id, `created project ${title}`);
        res.json({ project: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
router.get('/public', async (req, res) => {
    try {
        const { data, error } = await supabase_1.default.from('projects').select('*').eq('public', true).order('created_at', { ascending: false });
        if (error)
            throw error;
        res.json({ projects: data });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
router.post('/:id/invite', requireAuth_1.default, async (req, res) => {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;
    try {
        const { data: caller, error: callerErr } = await supabase_1.default.from('project_members').select('role').eq('project_id', id).eq('user_email', req.user?.email).maybeSingle();
        if (callerErr)
            throw callerErr;
        if (!caller || (caller.role !== 'admin' && caller.role !== 'manager'))
            return res.status(403).json({ error: 'requires admin or manager' });
        await supabase_1.default.from('project_members').upsert({ project_id: id, user_email: email, role });
        await (0, LogAction_1.default)(req.user?.email || 'unknown', id, `invited ${email} as ${role}`);
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message || err });
    }
});
exports.default = router;
