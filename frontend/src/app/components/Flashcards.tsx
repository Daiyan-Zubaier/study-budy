"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "../../lib/firebase";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles, FileText } from "lucide-react";

interface FlashcardsProps {
  file: File | null;
  autoGenerate?: boolean;
  sessionId: string;
}

type Flashcard = {
  question: string;
  answer: string;
};

export default function Flashcards({ file, autoGenerate = false, sessionId }: FlashcardsProps) {
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
        const db = getFirestore(app);
        const flashcardsRef = collection(db, "sessions", sessionId, "flashcards");

        // Save each flashcard to Firestore
        await Promise.all(
          parsed.map(async (card: Flashcard) => {
            await addDoc(flashcardsRef, {
              question: card.question,
              answer: card.answer,
            });
            console.log("Saved card", card)
          })
        );

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
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
          <FileText className="text-blue-400" size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No File Selected</h3>
          <p className="text-gray-400">Please upload a file first to generate flashcards.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 p-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="text-blue-400 animate-spin" size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Generating Flashcards</h3>
          <p className="text-gray-400">AI is creating your study materials...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
          <Sparkles className="text-green-400" size={32} />
        </div>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
          <p className="text-gray-400">Create AI-powered flashcards from your file.</p>
        </div>
        <button
          className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={handleGenerate}
        >
          <Sparkles size={20} />
          Generate Flashcards
        </button>
      </div>
    );
  }

  const current = flashcards[currentIndex];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div className="relative w-full">
        <div
          className="bg-white border border-gray-200 rounded-3xl p-12 cursor-pointer transition-all duration-300 hover:shadow-2xl group shadow-xl w-full min-h-[24rem] max-h-[24rem] flex items-center justify-center overflow-hidden"
          onClick={() => setShowAnswer(!showAnswer)}
        >

          {/* Flip indicator */}
          <div className="absolute top-6 right-6 text-gray-400 group-hover:text-gray-600 transition-colors">
            <RotateCcw size={24} />
          </div>
          
          {/* Card content */}
          <div className="text-center w-full h-full flex flex-col justify-center px-4 overflow-hidden">
            <div className="text-base font-semibold text-gray-500 mb-6 uppercase tracking-wider flex-shrink-0">
              {showAnswer ? "Answer" : "Question"}
            </div>
            <div className="text-2xl font-bold text-black leading-relaxed max-w-3xl mx-auto flex-1 flex items-center justify-center overflow-y-auto">
              <div className="max-h-full overflow-y-auto px-2">
                {showAnswer ? current.answer : current.question}
              </div>
            </div>
          </div>
        </div>
        
        {/* Tap to flip hint */}
        <div className="text-center mt-6">
          <p className="text-base text-gray-400">
            Tap card to {showAnswer ? "show question" : "reveal answer"}
          </p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-lg">
        <button
          className="flex items-center gap-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 disabled:text-gray-500 text-lg"
          onClick={() => {
            setCurrentIndex((i) => Math.max(0, i - 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={22} />
          Previous
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="text-xl font-bold text-white">
            {currentIndex + 1} / {flashcards.length}
          </div>
          <div className="text-base text-gray-400">
            {Math.round(((currentIndex + 1) / flashcards.length) * 100)}% Complete
          </div>
        </div>

        <button
          className="flex items-center gap-3 bg-gray-700/50 hover:bg-gray-600/50 disabled:bg-gray-800/50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 disabled:text-gray-500 text-lg"
          onClick={() => {
            setCurrentIndex((i) => Math.min(flashcards.length - 1, i + 1));
            setShowAnswer(false);
          }}
          disabled={currentIndex === flashcards.length - 1}
        >
          Next
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Study Stats */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white">{flashcards.length}</div>
          <div className="text-base text-gray-400">Total Cards</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-blue-400">{currentIndex + 1}</div>
          <div className="text-base text-gray-400">Current</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-green-400">{flashcards.length - currentIndex - 1}</div>
          <div className="text-base text-gray-400">Remaining</div>
        </div>
      </div>
    </div>
  );
}
