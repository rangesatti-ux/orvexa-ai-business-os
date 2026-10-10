import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  RefreshCw,
  Trash2,
} from "lucide-react";

import api from "../../services/api";

function AssistantPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

  // ============================================================
  // SCROLL TO BOTTOM
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const sendMessage = async (messageText = input) => {
    const message = messageText.trim();

    if (!message || loading) {
      return;
    }

    setError("");
    setInput("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    try {
      setLoading(true);

      const response = await api.post("/ai/chat", {
        message,
      });

      const aiResponse =
        response?.data?.response ||
        "I couldn't generate a response.";

      const assistantMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiResponse,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (err) {
      console.error("AI request failed:", err);

      const detail =
        err?.response?.data?.detail ||
        "Unable to connect to the AI assistant.";

      setError(
        typeof detail === "string"
          ? detail
          : JSON.stringify(detail)
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ENTER KEY
  // ============================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  // ============================================================
  // CLEAR CHAT
  // ============================================================

  const clearChat = () => {
    if (loading) return;

    setMessages([]);
    setError("");
  };

  // ============================================================
  // QUICK PROMPTS
  // ============================================================

  const quickPrompts = [
    "Give me a summary of my business",
    "What is my estimated profit?",
    "Which products have low stock?",
    "Analyze my inventory",
    "How much revenue did I generate?",
    "Give me important action items",
  ];

  // ============================================================
  // SIMPLE MARKDOWN RENDERER
  // ============================================================

  const renderContent = (content) => {
    const lines = String(content || "").split("\n");

    return (
      <div className="space-y-2">
        {lines.map((line, index) => {
          const trimmed = line.trim();

          if (!trimmed) {
            return <div key={index} className="h-1" />;
          }

          // Markdown headings
          if (trimmed.startsWith("### ")) {
            return (
              <h4
                key={index}
                className="mt-3 text-sm font-bold text-gray-800 dark:text-white"
              >
                {trimmed.replace(/^###\s*/, "")}
              </h4>
            );
          }

          if (trimmed.startsWith("## ")) {
            return (
              <h3
                key={index}
                className="mt-3 text-base font-bold text-gray-800 dark:text-white"
              >
                {trimmed.replace(/^##\s*/, "")}
              </h3>
            );
          }

          if (trimmed.startsWith("# ")) {
            return (
              <h2
                key={index}
                className="mt-3 text-lg font-bold text-gray-800 dark:text-white"
              >
                {trimmed.replace(/^#\s*/, "")}
              </h2>
            );
          }

          // Horizontal separator
          if (/^-{3,}$/.test(trimmed)) {
            return (
              <hr
                key={index}
                className="my-3 border-gray-200 dark:border-slate-700"
              />
            );
          }

          // Table rows
          if (trimmed.startsWith("|")) {
            const cells = trimmed
              .split("|")
              .slice(1, -1)
              .map((cell) => cell.trim());

            if (
              cells.length > 0 &&
              cells.every((cell) =>
                /^[-:]+$/.test(cell)
              )
            ) {
              return null;
            }

            return (
              <div
                key={index}
                className="grid grid-cols-1 gap-1 rounded-lg bg-gray-50 px-3 py-2 text-xs dark:bg-slate-800/70 sm:grid-cols-3"
              >
                {cells.map((cell, cellIndex) => (
                  <span
                    key={cellIndex}
                    className={
                      cellIndex === 0
                        ? "font-medium text-gray-700 dark:text-slate-200"
                        : "text-gray-600 dark:text-slate-300"
                    }
                  >
                    {cell.replace(/\*\*/g, "")}
                  </span>
                ))}
              </div>
            );
          }

          // Bullet points
          if (
            trimmed.startsWith("- ") ||
            trimmed.startsWith("* ")
          ) {
            return (
              <div
                key={index}
                className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-slate-300"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />

                <span>
                  {trimmed
                    .replace(/^[-*]\s*/, "")
                    .replace(/\*\*/g, "")}
                </span>
              </div>
            );
          }

          // Numbered list
          if (/^\d+\.\s/.test(trimmed)) {
            const match = trimmed.match(
              /^(\d+)\.\s+(.*)$/
            );

            return (
              <div
                key={index}
                className="flex gap-2 text-sm leading-6 text-gray-700 dark:text-slate-300"
              >
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {match?.[1]}.
                </span>

                <span>
                  {(match?.[2] || "")
                    .replace(/\*\*/g, "")}
                </span>
              </div>
            );
          }

          // Normal paragraph
          return (
            <p
              key={index}
              className="text-sm leading-6 text-gray-700 dark:text-slate-300"
            >
              {trimmed.replace(/\*\*/g, "")}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-7rem)] flex-col">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <Bot size={23} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                AI Assistant
              </h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                Ask questions about your Orvexa business.
              </p>
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            onClick={clearChat}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Trash2 size={16} />

            Clear Chat
          </button>
        )}
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* =====================================================
          CHAT AREA
      ====================================================== */}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* EMPTY STATE */}

        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20">
              <Sparkles size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-gray-800 dark:text-white">
              How can I help you?
            </h2>

            <p className="mt-2 max-w-lg text-center text-sm leading-6 text-gray-500 dark:text-slate-400">
              Ask the AI Assistant about your revenue,
              purchases, inventory, sales, employees,
              profitability, or business performance.
            </p>

            <div className="mt-7 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  disabled={loading}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-left text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* =================================================
             MESSAGES
          ================================================== */

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="mx-auto max-w-4xl space-y-5">
              {messages.map((message) => {
                const isUser =
                  message.role === "user";

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {!isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Bot size={18} />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                        isUser
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-gray-100 dark:bg-slate-800"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>
                      ) : (
                        renderContent(message.content)
                      )}
                    </div>

                    {isUser && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-white dark:bg-slate-600">
                        <User size={17} />
                      </div>
                    )}
                  </div>
                );
              })}

              {/* =================================================
                  TYPING INDICATOR
              ================================================== */}

              {loading && (
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <Bot size={18} />
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3 dark:bg-slate-800">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style={{
                        animationDelay: "120ms",
                      }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-500"
                      style={{
                        animationDelay: "240ms",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* =====================================================
            INPUT
        ====================================================== */}

        <div className="border-t border-gray-200 bg-gray-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-4xl items-end gap-3">
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about your business..."
              rows={1}
              disabled={loading}
              className="max-h-32 min-h-[48px] flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
            />

            <button
              onClick={() => sendMessage()}
              disabled={
                loading || !input.trim()
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Send message"
            >
              {loading ? (
                <RefreshCw
                  size={19}
                  className="animate-spin"
                />
              ) : (
                <Send size={19} />
              )}
            </button>
          </div>

          <p className="mx-auto mt-2 max-w-4xl text-[11px] text-gray-400 dark:text-slate-500">
            Press Enter to send. Use Shift + Enter for a new line.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AssistantPage;