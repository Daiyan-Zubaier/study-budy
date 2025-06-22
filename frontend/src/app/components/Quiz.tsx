"use client";
import React, { useState, useEffect } from "react";

interface QuizProps { file: File | null; autoGenerate?: boolean }

export default function Quiz({ file, autoGenerate = false }: QuizProps) {
  const [fileText, setFileText] = useState<string | null>(null);
  const [quiz, setQuiz] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setQuiz(null);

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

    setQuiz(
      data.candidates?.[0]?.content?.parts?.[0]?.text || "No quiz generated."
    );
    setLoading(false);
  };

  useEffect(() => {
    if (autoGenerate) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  if (!file) {
    return (
      <div className="p-4 bg-gray-800 text-gray-100 rounded shadow text-center">
        Please upload a file first.
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 text-gray-100 rounded shadow text-center">
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 mb-4"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Quiz"}
      </button>
      {quiz && (
        <div>
          <p className="text-sm text-gray-300">Generated Quiz:</p>
          <pre className="text-xs bg-gray-700 p-2 rounded max-h-40 overflow-auto text-gray-100">
            {quiz}
          </pre>
        </div>
      )}
      {fileText && !quiz && (
        <div>
          <p className="text-sm text-gray-300">File contents (for demo):</p>
          <pre className="text-xs bg-gray-700 p-2 rounded max-h-40 overflow-auto text-gray-100">
            {fileText}
          </pre>
        </div>
      )}
    </div>
  );
}
