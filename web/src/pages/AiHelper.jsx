import { useEffect, useRef, useState } from "react";
import { Send, Bot, User as UserIcon } from "lucide-react";
import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../config/appConfig";
import { useAuth } from "../core/auth/AuthProvider";
import { askAI, aiAvailable } from "../adapters/aiService";
import PageHeader from "../core/ui/PageHeader";
import Card, { CardBody } from "../core/ui/Card";
import Button from "../core/ui/Button";
import Alert from "../core/ui/Alert";
import Spinner from "../core/ui/Spinner";
import VoiceInput from "../core/a11y/VoiceInput";
import { cx } from "../core/ui/cx";

export default function AiHelper() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        // No orderBy: that would need a composite index. Sort here instead.
        const snap = await getDocs(query(
          collection(db, COLLECTIONS.aiChats),
          where("uid", "==", user.uid)
        ));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt?.toMillis?.() ?? 0) - (b.createdAt?.toMillis?.() ?? 0));
        setMessages(list);
      } catch {
        setError("Could not load chat history. Check your connection and Firestore rules.");
      }
      setLoading(false);
    }
    load();
  }, [user.uid]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setError("");
    setBusy(true);

    const userMsg = { role: "user", text };
    setMessages((m) => [...m, userMsg]);

    try {
      await addDoc(collection(db, COLLECTIONS.aiChats), {
        uid: user.uid, role: "user", text, createdAt: serverTimestamp(),
      });
      const replyText = await askAI(text);
      const reply = { role: "assistant", text: replyText };
      setMessages((m) => [...m, reply]);
      await addDoc(collection(db, COLLECTIONS.aiChats), {
        uid: user.uid, role: "assistant", text: replyText, createdAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  return (
    <div>
      <PageHeader title="AI helper" description="Ask questions in plain language." />

      {!aiAvailable() && (
        <Alert type="warning">
          The AI helper isn't connected yet. Replies fall back to a demo message until Firebase AI Logic (Gemini) is set up.
        </Alert>
      )}
      <Alert>{error}</Alert>

      <Card>
        <CardBody>
          <div className="mb-4 flex h-80 flex-col gap-3 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex flex-1 items-center justify-center"><Spinner /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center text-fg-muted">
                <Bot aria-hidden="true" className="mb-2 h-8 w-8" />
                <p>Ask me anything to get started.</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={m.id || `msg-${i}`}
                  className={cx("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && <Bot aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" />}
                  <div className={cx(
                    "max-w-[80%] rounded-lg px-3 py-2",
                    m.role === "user" ? "bg-primary text-primary-fg" : "bg-surface-2 text-fg"
                  )}>
                    {m.text}
                  </div>
                  {m.role === "user" && <UserIcon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-fg-muted" />}
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-end gap-2">
            <label htmlFor="ai-input" className="sr-only">Your message</label>
            <input id="ai-input" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message... " disabled={busy}
              className="min-h-11 flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-fg" />
            <VoiceInput label="Ask by voice" onResult={(t) => setInput(t)} />
            <Button type="submit" disabled={busy} aria-label="Send">
              {busy ? <Spinner /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
