"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabaseClient_1 = require("../lib/supabaseClient");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    const { data, error } = await supabaseClient_1.supabase.from('projects').select('*').limit(1);
    if (error)
        return res.status(500).json({ error: error.message });
    res.json({ success: true, data });
});
exports.default = router;
