import React, { useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: generateId(),
      role: "assistant",
      content:
        "Hi! I can guide you through the app flow and share efficiency tips. Ask me how to start or where you're stuck.",
    },
  ]);

  const backendUrl = useMemo(() => {
    const configured = import.meta.env.VITE_BACKEND_URL;
    return (configured ? configured.replace(/\/$/, "") : "http://localhost:3000");
  }, []);

  const listRef = useRef<HTMLDivElement | null>(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg: Message = { id: generateId(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/assistant/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      const content: string = data?.reply?.content ?? "Sorry, I didn't catch that.";
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: "assistant", content: "Network error. Is the backend running?" },
      ]);
    } finally {
      setLoading(false);
      // Scroll to bottom
      queueMicrotask(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>

      <button
        aria-label={open ? "Close assistant" : "Open assistant"}
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          height: 64,
          width: 64,
          borderRadius: "50%",
          border: "none",
          color: "#fff",
          fontSize: 40,
          fontWeight: "bold",
          boxShadow:
            "0 0 10px rgba(99,102,241,0.6), 0 0 30px rgba(99,102,241,0.4)",
          transition:
            "all 0.3s ease, transform 0.2s ease-in-out, box-shadow 0.3s ease",
          cursor: "pointer",
          zIndex: 999,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = open
            ? "scale(1.1) rotate(180deg)"
            : "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = open
            ? "rotate(180deg)"
            : "rotate(0deg)";
        }}
      >
        {open ? "×" : "🤖"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            right: 16,
            bottom: 84,
            width: 360,
            maxHeight: 520,
            background: "#0b1220",
            color: "#e5e7eb",
            border: "1px solid #243041",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          <div style={{ padding: 12, borderBottom: "1px solid #243041", fontWeight: 600 }}>
            Assistant
          </div>
          <div ref={listRef} style={{ padding: 12, overflowY: "auto", flex: 1 }}>
            {messages.map((m) => (
              <div key={m.id} style={{ marginBottom: 10, display: "flex" }}>
                <div
                  style={{
                    marginLeft: m.role === "assistant" ? 0 : "auto",
                    marginRight: m.role === "assistant" ? "auto" : 0,
                    background: m.role === "assistant" ? "#111827" : "#1f2937",
                    border: "1px solid #243041",
                    borderRadius: 10,
                    padding: "8px 10px",
                    maxWidth: "85%",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ opacity: 0.7, fontSize: 12 }}>Assistant is typing…</div>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #243041" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about flow or efficiency…"
              style={{
                flex: 1,
                background: "#0b1220",
                color: "#e5e7eb",
                border: "1px solid #243041",
                borderRadius: 8,
                padding: "10px 12px",
                outline: "none",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px 12px",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}


