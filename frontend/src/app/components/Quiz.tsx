"use client";
import React, { useState, useEffect } from "react";

interface QuizProps { file: File | null; autoGenerate?: boolean }
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export default function Quiz({ file, autoGenerate = false }: QuizProps) {
  const [fileText, setFileText] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

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
      <div className="p-4 bg-gray-100 rounded shadow text-center">
        Please upload a file first.
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 bg-gray-100 rounded shadow text-center">Generating quiz...</div>;
  }

  if (questions.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded shadow text-center">
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-4"
          onClick={handleGenerate}
        >
          Generate Quiz
        </button>
      </div>
    );
  }

  if (showResult) {
    const percent = ((score / questions.length) * 100).toFixed(2);
    return (
      <div className="p-4 bg-gray-100 rounded shadow text-center">
        <div className="text-xl font-bold mb-2">Quiz Complete!</div>
        <div className="mb-4">Your score: {score} / {questions.length} ({percent}%)</div>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleGenerate}
        >
          Try Again
        </button>
      </div>
    );
  }

  const q = questions[current];
  const handleOption = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (q.options[idx] === q.answer) setScore(s => s + 1);
  };
  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded shadow text-center w-full max-w-md mx-auto">
      <div className="mb-4 text-lg font-semibold">Question {current + 1} of {questions.length}</div>
      <div className="mb-4 bg-white rounded p-6 shadow text-lg min-h-[80px] flex items-center justify-center">
        {q.question}
      </div>
      <div className="flex flex-col gap-2 mb-4">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded border text-left ${selected === null ? "bg-purple-100 hover:bg-purple-200" : idx === selected ? (opt === q.answer ? "bg-green-200" : "bg-red-200") : "bg-gray-100"}`}
            onClick={() => handleOption(idx)}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleNext}
        >
          {current + 1 < questions.length ? "Next" : "Finish"}
        </button>
      )}
    </div>
  );
}
