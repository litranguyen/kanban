"use client";

import { FormEvent, useState } from "react";

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

type ChatWidgetProps = {
  onBoardUpdate: () => void;
};

export const ChatWidget = ({ onBoardUpdate }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      if (data.board_updated) {
        onBoardUpdate();
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I couldn't process your request.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
  };

  if (!isOpen) {
    return (
      <button
        className="chat-toggle"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
      >
        💬
      </button>
    );
  }

  return (
    <aside className="chat-widget">
      <header className="chat-header">
        <h2>AI Assistant</h2>
        <button onClick={() => setIsOpen(false)} aria-label="Close chat">
          ✕
        </button>
      </header>
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.isUser ? "user" : "ai"}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="message ai">Thinking...</div>}
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about the board..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </aside>
  );
};