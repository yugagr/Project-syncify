"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSystemContext = void 0;
exports.askGemini = askGemini;
async function askGemini(prompt, systemContext) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey)
        throw new Error("GEMINI_API_KEY not set");
    const mod = (await Promise.resolve().then(() => __importStar(require("@google/generative-ai"))));
    const genAI = new mod.GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
    const fullPrompt = [
        systemContext?.trim() || "",
        "\nUser question:\n" + prompt.trim(),
    ]
        .filter(Boolean)
        .join("\n\n");
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    return text?.trim() || "";
}
exports.defaultSystemContext = `
You are Syncify's in-app assistant for a collaborative team and task management platform.
Be concise, actionable, and friendly. Focus on:
- Onboarding flow: Create Team → Create Project → Add Boards (To Do / In Progress / Done) → Invite teammates → Assign tasks → Track progress.
- Efficiency: batching tasks, WIP limits, keyboard shortcuts, recurring reminders, weekly reviews, cycle time, throughput.
- Features: Projects, Boards, Calendar, Teams & permissions, Files, Analytics.
When appropriate, reply with short step-by-step guidance.
`;
