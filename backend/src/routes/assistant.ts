import { Router } from "express";
import { askGemini, defaultSystemContext } from "../utils/gemini";

const router = Router();

router.post("/message", async (req, res) => {
  const { message } = req.body as { message?: string };
  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "message is required" });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set on server" });
  }
  try {
    const content = await askGemini(message, defaultSystemContext);
    return res.json({ reply: { role: "assistant", content } });
  } catch (err) {
    // Log detailed error server-side for debugging
    // eslint-disable-next-line no-console
    console.error("Gemini error:", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    const body = process.env.NODE_ENV === "production"
      ? { error: "Gemini request failed" }
      : { error: "Gemini request failed", detail };
    return res.status(502).json(body);
  }
});

export default router;


