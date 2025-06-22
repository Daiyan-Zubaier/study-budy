// /frontend/components/GeminiChatWidget.tsx
"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

export default function GeminiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages([...messages, { from: "user", text: userMessage }]);
    setInput("");

    const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!res.ok) {
        console.error("Response failed:", res.status);
        setMessages((prev) => [...prev, { from: "ai", text: "Error talking to Gemini API." }]);
        return;
      }
      
      const text = await res.text(); // get raw text first
      console.log("Raw response:", text);
      
      try {
        const data = JSON.parse(text); // attempt to parse it manually
        const aiText = data?.text || "Sorry, I couldn't understand that.";
        setMessages((prev) => [...prev, { from: "ai", text: aiText }]);
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        setMessages((prev) => [...prev, { from: "ai", text: "Invalid response from API." }]);
      }
    }; 

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {open ? (
        <div className="w-[360px] h-[500px] bg-white rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Ask Gemini 📘</h2>
            <button onClick={() => setOpen(false)}>
              <X size={20} className="text-gray-500 hover:text-gray-800" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm ${
                  msg.from === "user"
                    ? "bg-blue-100 text-blue-800 self-end ml-12"
                    : "bg-gray-100 text-gray-700 self-start mr-12"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-gray-200 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none text-black"
              placeholder="Ask about your flashcards..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-xl"
        >
          <MessageCircle size={24} />
        </button>
      )}
    </div>
  );
}
