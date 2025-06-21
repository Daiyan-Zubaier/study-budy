"use client";
import React, { useState, useEffect } from "react";

interface FlashcardsProps {
  file: File | null;
  autoGenerate?: boolean;
}

export default function Flashcards({ file, autoGenerate = false }: FlashcardsProps) {
  const [fileText, setFileText] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setFlashcards(null);

    let text = "";
    if (file.type === "application/pdf") {
      // Dynamically import only on client
      const { extractTextFromPDF } = await import("../utils/pdfUtils");
      text = await extractTextFromPDF(file);
    } else {
      text = await file.text();
    }
    setFileText(text);

    // Call your Gemini API route
    const res = await fetch("/api/gemini/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();

    setFlashcards(data.candidates?.[0]?.content?.parts?.[0]?.text || "No flashcards generated.");
    setLoading(false);
  };

  useEffect(() => {
    if (autoGenerate) {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate]);

  if (!file) {
    return <div className="p-4 bg-gray-100 rounded shadow text-center">Please upload a file first.</div>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded shadow text-center">
      {!flashcards && (
        <button
          className="mb-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>
      )}
      {flashcards && (
        <div>
          <p className="text-sm text-gray-600">Generated Flashcards:</p>
          <pre className="text-xs bg-white p-2 rounded max-h-40 overflow-auto">{flashcards}</pre>
        </div>
      )}
      {fileText && !flashcards && (
        <div>
          <p className="text-sm text-gray-600">File contents (for demo):</p>
          <pre className="text-xs bg-white p-2 rounded max-h-40 overflow-auto">{fileText}</pre>
        </div>
      )}
    </div>
  );
}