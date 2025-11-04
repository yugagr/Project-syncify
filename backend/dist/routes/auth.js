"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabase_1 = __importDefault(require("../config/supabase"));
const router = express_1.default.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
// -------------------------------------------
// Generate Token for Existing/Upserted User
// -------------------------------------------
router.post("/token", async (req, res) => {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: "email required" });
    try {
        await supabase_1.default.from("users").upsert({ email }).select();
    }
    catch (err) {
        console.warn("Failed to upsert user:", err.message || err);
    }
    const isAdmin = ADMIN_EMAILS.includes(email);
    const payload = { email, isAdmin };
    const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, email, isAdmin });
});
// -------------------------------------------
// Placeholder Login Route
// -------------------------------------------
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // ⚠️ Replace this logic later with Supabase Auth or your own password check
    res.status(200).json({ message: "Login route (placeholder)", email });
});
// -------------------------------------------
// Placeholder Register Route
// -------------------------------------------
router.post("/register", async (req, res) => {
    const { email, password } = req.body;
    // ⚠️ Replace this with your registration logic
    res.status(201).json({ message: "Register route (placeholder)", email });
});
exports.default = router;
