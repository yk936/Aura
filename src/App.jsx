import { useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    alert(`You said: ${message}`);
    setMessage("");
  };

  return (
    <main className="app">
      <section className="assistant-shell">

        {/* Top Bar */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">✦</div>

            <div>
              <h1>AURA</h1>
              <p>YOUR PERSONAL AI ASSISTANT</p>
            </div>
          </div>

          <button
            className="icon-button"
            type="button"
            aria-label="Settings"
            onClick={() => alert("Settings coming soon")}
          >
            ⚙
          </button>
        </header>

        {/* Welcome Section */}
        <section className="welcome">
          <div className="avatar-placeholder">
            <span style={{ fontSize: "42px" }}>✦</span>
          </div>

          <div className="welcome-content">
            <p className="eyebrow">WELCOME BACK</p>

            <h2>
              Meet <span>AURA</span>
            </h2>

            <p>
              Your intelligent personal assistant. Ask questions,
              explore ideas, create, learn and get things done.
            </p>
          </div>
        </section>

        {/* Status */}
        <div className="status-card">
          <div className="status-dot"></div>

          <div>
            <strong>AURA is online</strong>
            <span>Ready to assist you</span>
          </div>
        </div>

        {/* Chat Input */}
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask AURA anything..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="Message AURA"
          />

          <button
            className="voice-button"
            type="button"
            onClick={() => alert("Voice feature coming soon")}
            aria-label="Voice input"
          >
            🎙
          </button>

          <button
            className="send-button"
            type="submit"
            aria-label="Send message"
          >
            ➤
          </button>
        </form>

      </section>
    </main>
  );
}

export default App;
