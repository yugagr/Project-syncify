"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = checkPermission;
const supabase_1 = __importDefault(require("../config/supabase"));
function checkPermission(projectIdParam = 'projectId', minRole = 'member') {
    const order = { viewer: 0, member: 1, manager: 2, admin: 3 };
    return async (req, res, next) => {
        const projectId = req.params[projectIdParam] || req.body[projectIdParam] || req.query[projectIdParam];
        if (!projectId)
            return res.status(400).json({ error: 'projectId required' });
        try {
            const { data, error } = await supabase_1.default.from('project_members').select('role').eq('project_id', projectId).eq('user_email', req.user?.email).maybeSingle();
            if (error)
                throw error;
            if (!data)
                return res.status(403).json({ error: 'Not a member of project' });
            if (order[data.role] < order[minRole])
                return res.status(403).json({ error: 'Insufficient role' });
            req.projectRole = data.role;
            next();
        }
        catch (err) {
            res.status(500).json({ error: err.message || err });
        }
    };
}
