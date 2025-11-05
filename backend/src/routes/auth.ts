import express from "express";
import supabase from "../config/supabase";
import { UserPayload } from "../types";

const router = express.Router();
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// -------------------------------------------
// Validate Supabase access token, ensure user exists, return session info
// -------------------------------------------
router.post("/token", async (req, res) => {
  const authHeader = req.headers.authorization;
  const bodyToken = (req.body as any)?.access_token as string | undefined;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : bodyToken;

  if (!accessToken) return res.status(400).json({ error: "Missing access token" });

  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data?.user) return res.status(401).json({ error: "Invalid or expired token" });

  const email = data.user.email || "";
  const id = data.user.id;

  try {
    await supabase
      .from("users")
      .upsert({ id, email })
      .select("id")
      .single();
  } catch (err) {
    console.warn("Failed to upsert user:", (err as any).message || err);
  }

  const isAdmin = email ? ADMIN_EMAILS.includes(email) : false;
  const user: UserPayload = { email, isAdmin, id } as any;

  res.json({ accessToken, user });
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

export default router;
