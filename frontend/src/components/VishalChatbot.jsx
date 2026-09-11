import { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles } from "lucide-react";
import api, { getErrorMessage } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const VishalChatbot = ({ open, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi${user ? " " + user.name.split(" ")[0] : ""}! I'm Vishal, your In Minutes support assistant. Ask me about order status, payments, or delivery issues.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await api.post("/ai/vishal", { message: text });
      setMessages((prev) => [...prev, { role: "assistant", text: res.data.reply }]);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I'm having trouble responding right now. Please try again in a moment." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!open) return null;

  return (
    <div
      className={`fixed bottom-0 right-0 z-50 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-ink-900/10 bg-white shadow-premium transition-transform duration-300 sm:bottom-4 sm:right-4 sm:h-[560px] sm:w-96 sm:rounded-2xl ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="flex items-center justify-between bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3.5 text-white">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-display text-sm font-semibold leading-tight">Vishal</p>
            <p className="text-[11px] text-white/80">AI Support Assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 hover:bg-white/15">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50 p-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex animate-fadeUp ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                m.role === "user"
                  ? "rounded-br-sm bg-brand-500 text-white"
                  : "rounded-bl-sm border border-ink-900/5 bg-white text-ink-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start animate-fadeUp">
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-ink-900/5 bg-white px-4 py-3">
              <span className="text-xs text-ink-900/40">Vishal is typing</span>
              <span className="flex gap-0.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/30 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/30 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-900/30" />
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-ink-900/5 bg-white p-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Vishal about your order..."
          className="input flex-1 text-sm"
        />
        <button onClick={send} disabled={typing || !input.trim()} className="btn-primary shrink-0 p-2.5">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default VishalChatbot;
