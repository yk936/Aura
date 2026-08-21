import React, { useState, useRef, useEffect } from "react";
import { Settings, Mic, Send, Bot, Sparkles } from "lucide-react";

function App() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: trimmed,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setInputMessage("");
  };

  return (
    <div className="app">
      <div className="assistant-shell">
        {/* Top bar */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">
              <Bot size={22} />
            </div>
            <div>
              <h1>AURA</h1>
              <p>Personal AI Assistant</p>
            </div>
          </div>
          <button
            className="icon-button"
            aria-label="Settings"
            title="Settings"
            type="button"
          >
            <Settings size={20} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="welcome">
          {messages.length === 0 ? (
            <div className="welcome-content">
              <div className="avatar-placeholder">
                <Sparkles size={48} />
              </div>
              <p className="eyebrow">AURA ASSISTANT</p>
              <h2>
                How can I assist you <span>today?</span>
              </h2>
              <p>
                Your personal AI companion for productivity, questions, and daily tasks.
              </p>
            </div>
          ) : (
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} className="chat-bubble user-message">
                  <p>{msg.text}</p>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Status Indicator */}
        <div className="status-card">
          <div className="status-dot" />
          <div>
            <strong>AURA is online</strong>
            <span>Ready for input</span>
          </div>
        </div>

        {/* Chat Input */}
        <form className="chat-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            aria-label="Message input"
          />
          <button
            type="button"
            className="voice-button"
            aria-label="Voice input"
            title="Voice input"
          >
            <Mic size={20} />
          </button>
          <button
            type="submit"
            className="send-button"
            aria-label="Send message"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
