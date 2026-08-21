import React, { useState, useRef, useEffect } from "react";
import { Settings, Mic, Send, Bot, Sparkles, Loader2 } from "lucide-react";

function App() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          messages: newMessages,
        }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch (parseErr) {
        // ignore JSON parse error if response body is non-json
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error (${response.status})`);
      }

      const assistantMsg = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Error communicating with AURA chat API:", err);
      const errorMsg = {
        id: Date.now() + 1,
        text: `Error: ${err.message || "Something went wrong. Please try again."}`,
        sender: "assistant",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
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
                <div
                  key={msg.id}
                  className={`chat-bubble ${
                    msg.sender === "user" ? "user-message" : "assistant-message"
                  } ${msg.isError ? "error-message" : ""}`}
                >
                  <p>{msg.text}</p>
                  <span className="timestamp">{msg.timestamp}</span>
                </div>
              ))}
              {isLoading && (
                <div className="chat-bubble assistant-message thinking-bubble">
                  <div className="thinking-content">
                    <Loader2 size={16} className="spinner" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Status Indicator */}
        <div className="status-card">
          <div className={`status-dot ${isLoading ? "status-dot-busy" : ""}`} />
          <div>
            <strong>AURA is {isLoading ? "thinking..." : "online"}</strong>
            <span>{isLoading ? "Generating response" : "Ready for input"}</span>
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
            disabled={isLoading}
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
            disabled={isLoading || !inputMessage.trim()}
          >
            {isLoading ? <Loader2 size={18} className="spinner" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
