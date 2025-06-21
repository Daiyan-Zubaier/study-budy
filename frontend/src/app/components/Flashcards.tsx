"use client";
import React, { useState, useEffect } from "react";

interface FlashcardsProps {
  file: File | null;
  autoGenerate?: boolean;
}

type Flashcard = {
  question: string;
  answer: string;
};

export default function Flashcards({ file, autoGenerate = false }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [fileText, setFileText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setFlashcards([]);
    setCurrentIndex(0);
    setShowAnswer(false);
  
    let text = "";
    if (file.type === "application/pdf") {
      const { extractTextFromPDF } = await import("../utils/pdfUtils");
      text = await extractTextFromPDF(file);
    } else {
      text = await file.text();
    }
    setFileText(text);
  
    const res = await fetch("/api/gemini/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  
    const data = await res.json();
  
    try {
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      raw = raw.trim();
  
      // Strip ```json or ``` if present
      if (raw.startsWith("```")) {
        raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "");
      }
  
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setFlashcards(parsed);
      } else {
        console.error("Parsed flashcards not an array:", parsed);
      }
    } catch (err) {
      console.error("Failed to parse flashcards:", err);
    }
  
    setLoading(false);
  };
  

  useEffect(() => {
    if (autoGenerate) handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  if (!file) {
    return <div className="p-4 bg-gray-100 rounded shadow text-center">Please upload a file first.</div>;
  }

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded shadow text-center">Generating flashcards...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded shadow text-center">
        <button
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          onClick={handleGenerate}
        >
          Generate Flashcards
        </button>
      </div>
    );
  }

  const current = flashcards[currentIndex];

  return (
    <div className="p-4 bg-gray-100 rounded shadow text-center w-full max-w-md">
      <div
        className="bg-white rounded shadow p-6 text-lg font-semibold cursor-pointer min-h-[100px] flex items-center justify-center"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        {showAnswer ? current.answer : current.question}
      </div>

      <div className="flex justify-between mt-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => {
            setCurrentIndex((i) => Math.max(0, i - 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === 0}
        >
          Prev
        </button>
        <div className="text-sm text-gray-600 mt-2">
          {currentIndex + 1} / {flashcards.length}
        </div>
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => {
            setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}
