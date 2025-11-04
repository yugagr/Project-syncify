"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_1 = require("../config/supabase");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: 'Missing authorization header' });
        const token = authHeader.replace('Bearer ', '');
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data?.user) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
        // Attach user info
        req.user = {
            email: data.user.email ?? '',
            ...data.user,
        };
        next();
    }
    catch (err) {
        res.status(500).json({ error: 'Auth middleware error' });
    }
};
exports.default = requireAuth;
