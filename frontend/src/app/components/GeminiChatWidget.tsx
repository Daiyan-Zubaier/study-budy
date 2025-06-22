"use client";
import { useState } from "react";
import { MessageCircle, X } from "lucide-react";

// ✅ Setup voice recognition globally
let recognition: any = null;

if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
  const SpeechRecognition = (window as any).webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";
}

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

    const text = await res.text();
    console.log("Raw response:", text);

    try {
      const data = JSON.parse(text);
      const aiText = data?.text || "Sorry, I couldn't understand that.";
      setMessages((prev) => [...prev, { from: "ai", text: aiText }]);
    } catch (err) {
      console.error("Failed to parse JSON:", err);
      setMessages((prev) => [...prev, { from: "ai", text: "Invalid response from API." }]);
    }
  };

  // ✅ Start listening to voice
  const startListening = () => {
    if (!recognition) {
      console.error("Speech recognition not supported in this browser.");
      return;
    }
  
    recognition.start();
  
    recognition.onstart = () => {
      console.log("🎤 Listening...");
    };
  
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      console.log("🗣️ Heard:", transcript);
      setInput(transcript);
    };
  
    recognition.onerror = (event: any) => {
      console.error("❌ Speech recognition error:", event.error);
    };
  
    // recognition.onend = () => {
    //   console.log("✅ Done listening. Sending message...");
    //   // Wait a short moment in case setInput hasn’t updated yet
    //   setTimeout(() => {
    //     sendMessage();
    //   }, 300);
    // };
  };
  

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {open ? (
        <div className="w-[360px] h-[500px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="font-semibold text-white">Ask Gemini 📘</h2>
            <button onClick={() => setOpen(false)}>
              <X size={20} className="text-zinc-400 hover:text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-zinc-700">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm max-w-[80%] ${
                  msg.from === "user"
                    ? "bg-blue-600 text-white self-end ml-auto"
                    : "bg-zinc-800 text-zinc-200 self-start mr-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-zinc-800 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none"
              placeholder="Ask about your flashcards..."
            />
            <button
              onClick={startListening}
              className="bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-2 rounded-lg text-sm"
            >
              🎙️
            </button>
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
