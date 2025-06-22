"use client"

import React, { useState, useEffect } from "react"
import { Loader2, Sparkles } from "lucide-react"

interface QuizProps {
  file: File | null
  autoGenerate?: boolean
}

export default function Quiz({ file, autoGenerate = false }: QuizProps) {
  const [fileText, setFileText] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!file) return
    setLoading(true)
    setQuiz(null)

    let text = ""
    if (file.type === "application/pdf") {
      const { extractTextFromPDF } = await import("../utils/pdfUtils")
      text = await extractTextFromPDF(file)
    } else {
      text = await file.text()
    }

    setFileText(text)

    const res = await fetch("/api/gemini/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
    const data = await res.json()

    setQuiz(
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No quiz generated."
    )
    setLoading(false)
  }

  useEffect(() => {
    if (autoGenerate) {
      handleGenerate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate])

  if (!file) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 text-center text-gray-300">
        Please upload a file first.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Generating...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" /> Generate Quiz
          </>
        )}
      </button>

      {quiz && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-2">Generated Quiz:</p>
          <pre className="text-xs bg-white/[0.05] text-white p-4 rounded max-h-60 overflow-auto whitespace-pre-wrap">
            {quiz}
          </pre>
        </div>
      )}

      {fileText && !quiz && (
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6">
          <p className="text-sm text-gray-400 mb-2">File contents:</p>
          <pre className="text-xs bg-white/[0.05] text-white p-4 rounded max-h-60 overflow-auto whitespace-pre-wrap">
            {fileText}
          </pre>
        </div>
      )}
    </div>
  )
}
