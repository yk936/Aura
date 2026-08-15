import { useState } from "react";
import { Bot, Mic, Send, Settings, Sparkles } from "lucide-react";

function App() {
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    console.log("User message:", trimmedMessage);
    setMessage("");
  };

  return (
    <main className="app">
      <section className="assistant-shell">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon" aria-hidden="true">
              <Sparkles size={20} />
            </div>

            <div>
              <h1>AURA</h1>
              <p>Personal AI Assistant</p>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </header>

        <section className="welcome">
          <div className="avatar-placeholder" aria-hidden="true">
            <Bot size={58} strokeWidth={1.5} />
          </div>

          <div className="welcome-content">
            <p className="eyebrow">ONLINE</p>

            <h2>
              Hello, I'm <span>AURA</span>.
            </h2>

            <p>
              Your personal AI assistant. Ask me something, start a task,
              or simply talk to me.
            </p>
          </div>
        </section>

        <section className="status-card" aria-label="Assistant status">
          <div className="status-dot" aria-hidden="true" />

          <div>
            <strong>Ready to help</strong>
            <span>AI systems will be connected in the next phase.</span>
          </div>
        </section>

        <form className="chat-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="message">
            Message AURA
          </label>

          <input
            id="message"
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Talk to AURA..."
            autoComplete="off"
          />

          <button
            className="voice-button"
            type="button"
            aria-label="Voice input"
            title="Voice input — coming soon"
          >
            <Mic size={19} />
          </button>

          <button
            className="send-button"
            type="submit"
            aria-label="Send message"
            title="Send message"
          >
            <Send size={19} />
          </button>
        </form>
      </section>
    </main>
  );
}

export default App;
