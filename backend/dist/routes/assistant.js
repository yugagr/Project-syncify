"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assistant_1 = require("../utils/assistant");
const gemini_1 = require("../utils/gemini");
const router = (0, express_1.Router)();
router.post("/message", async (req, res) => {
    const { message } = req.body;
    if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "message is required" });
    }
    try {
        if (process.env.GEMINI_API_KEY) {
            const content = await (0, gemini_1.askGemini)(message, gemini_1.defaultSystemContext);
            return res.json({ reply: { role: "assistant", content } });
        }
    }
    catch (err) {
        // fall back below
    }
    const reply = (0, assistant_1.generateAssistantReply)(message);
    res.json({ reply });
});
exports.default = router;
