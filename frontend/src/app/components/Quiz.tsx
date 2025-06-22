"use client";
import React, { useState, useEffect } from "react";
import { ChevronRight, Trophy, RotateCcw, Sparkles, FileText } from "lucide-react";
import { db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface QuizProps { 
  file: File | null; 
  autoGenerate?: boolean ;
  sessionId?: string;
}
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export default function Quiz({ file, autoGenerate = false, sessionId }: QuizProps) {
  const [fileText, setFileText] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);


async function saveQuizResultsToFirestore(
  sessionId: string,
  questions: QuizQuestion[],
  selectedAnswers: number[],
  score: number
) {
  const results = questions.map((q, i) => {
    const userIndex = selectedAnswers[i];
    const userAnswer = userIndex !== undefined ? q.options[userIndex] : null;
    return {
      question: q.question,
      options: q.options,
      correctAnswer: q.answer,
      userAnswer,
      correct: userAnswer === q.answer
    };
  });

  const docRef = doc(db, `sessions/${sessionId}/quiz/results`);
  await setDoc(docRef, {
    score,
    total: questions.length,
    questions: results
  });
}

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setQuestions([]);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);

    let text = "";
    if (file.type === "application/pdf") {
      const { extractTextFromPDF } = await import("../utils/pdfUtils");
      text = await extractTextFromPDF(file);
    } else {
      text = await file.text();
    }

    // Call your Gemini API route
    const res = await fetch("/api/gemini/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
    raw = raw.trim();
    if (raw.startsWith("```")) {
      raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "");
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setQuestions(parsed);
      } else {
        setQuestions([]);
      }
    } catch {
      setQuestions([]);
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
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
          <FileText className="text-purple-400" size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">No File Selected</h3>
          <p className="text-gray-400">Please upload a file first to generate a quiz.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-6 p-12 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="text-purple-400 animate-spin" size={32} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Generating Quiz</h3>
          <p className="text-gray-400">AI is creating your quiz questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 p-8 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl">
        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
          <Trophy className="text-purple-400" size={32} />
        </div>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate</h3>
          <p className="text-gray-400">Create AI-powered quiz questions from your file.</p>
        </div>
        <button
          className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          onClick={handleGenerate}
        >
          <Trophy size={20} />
          Generate Quiz
        </button>
      </div>
    );
  }

  if (showResult) {
    const percent = ((score / questions.length) * 100).toFixed(2);
    return (
      <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        {/* Results Card - Same size as flashcard */}
        <div className="bg-gray-800 border border-gray-600 rounded-3xl p-12 h-96 flex items-center justify-center shadow-xl w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="text-green-400" size={40} />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Quiz Complete!</h2>
            <div className="text-2xl text-gray-300 mb-6">
              Your score: <span className="text-green-400 font-bold">{score}</span> / {questions.length} 
              <span className="text-purple-400 ml-2">({percent}%)</span>
            </div>
            <button
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
              onClick={handleGenerate}
            >
              <RotateCcw size={22} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const handleOption = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (q.options[idx] === q.answer) setScore(s => s + 1);
  };
  const handleNext = async () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // 🧠 Write quiz results to Firestore
      if (sessionId) {
        const resultsRef = doc(db, `sessions/${sessionId}/quiz/results`);
        await setDoc(resultsRef, {
          score,
          total: questions.length,
          completedAt: serverTimestamp(),
          questions: questions.map((q, idx) => ({
            question: q.question,
            correctAnswer: q.answer,
            selectedAnswer: q.options[selected ?? -1], // You can improve this if needed
            wasCorrect: q.options[selected ?? -1] === q.answer
          }))
        });
      }
  
      setShowResult(true);
    }
  };
  

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card - Same size as flashcard */}
      <div className="relative w-full">
        <div className="bg-gray-800 border border-gray-600 rounded-3xl p-12 shadow-xl w-full h-96 flex items-center justify-center overflow-hidden">
          <div className="text-center w-full h-full flex flex-col justify-center px-4 overflow-hidden">
            <div className="text-base font-semibold text-purple-400 mb-6 uppercase tracking-wider flex-shrink-0">
              Question {current + 1} of {questions.length}
            </div>
            <div className="text-2xl font-bold text-white leading-relaxed max-w-3xl mx-auto flex-1 flex items-center justify-center overflow-y-auto">
              <div className="max-h-full overflow-y-auto px-2">
                {q.question}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options - Fixed size buttons */}
      <div className="w-full max-w-3xl space-y-4">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={`w-full h-16 px-6 rounded-xl font-semibold text-lg transition-all duration-200 border-2 flex items-center justify-start ${
              selected === null 
                ? "bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600/50 hover:border-purple-400" 
                : idx === selected 
                  ? (opt === q.answer ? "bg-green-600/20 border-green-400 text-green-300" : "bg-red-600/20 border-red-400 text-red-300")
                  : opt === q.answer && selected !== null
                    ? "bg-green-600/20 border-green-400 text-green-300"
                    : "bg-gray-800/50 border-gray-700 text-gray-400"
            }`}
            onClick={() => handleOption(idx)}
            disabled={selected !== null}
          >
            <span className="mr-4 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold">
              {String.fromCharCode(65 + idx)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {/* Next Button */}
      {selected !== null && (
        <button
          className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          onClick={handleNext}
        >
          {current + 1 < questions.length ? "Next Question" : "Finish Quiz"}
          <ChevronRight size={22} />
        </button>
      )}

      {/* Quiz Stats */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-lg">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-white">{questions.length}</div>
          <div className="text-base text-gray-400">Total Questions</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-purple-400">{current + 1}</div>
          <div className="text-base text-gray-400">Current</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-green-400">{score}</div>
          <div className="text-base text-gray-400">Correct</div>
        </div>
      </div>
    </div>
  );
}
