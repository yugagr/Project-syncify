"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = logAction;
const supabase_1 = __importDefault(require("../config/supabase"));
async function logAction(userEmail, projectId, action) {
    try {
        await supabase_1.default.from('activity_logs').insert([{ user_email: userEmail, project_id: projectId || null, action }]);
    }
    catch (err) {
        console.warn('logAction failed:', err.message || err);
    }
}
