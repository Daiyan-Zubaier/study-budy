"use client";
import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "../../lib/firebase"; // or wherever you initialize Firebase

import { useState, useEffect } from "react"
import { getFirestore, collection, addDoc } from "firebase/firestore"
import { app } from "../../lib/firebase"
import { Zap, Loader2, RefreshCw, ChevronLeft, ChevronRight, Sparkles, RotateCcw } from "lucide-react"

interface FlashcardsProps {
  file: File | null
  autoGenerate?: boolean
  sessionId: string
}

type Flashcard = {
  question: string
  answer: string
}

export default function Flashcards({ file, autoGenerate = false, sessionId }: FlashcardsProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [fileText, setFileText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  const handleGenerate = async () => {
    if (!file) return
    setLoading(true)
    setFlashcards([])
    setCurrentIndex(0)
    setShowAnswer(false)

    let text = ""
    if (file.type === "application/pdf") {
      const { extractTextFromPDF } = await import("../utils/pdfUtils")
      text = await extractTextFromPDF(file)
    } else {
      text = await file.text()
    }
    setFileText(text)

    const res = await fetch("/api/gemini/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })

    const data = await res.json()

    try {
      let raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
      raw = raw.trim()

      if (raw.startsWith("```")) {
        raw = raw.replace(/^```json\n?/, "").replace(/^```\n?/, "").replace(/```$/, "")
      }

      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setFlashcards(parsed)
        const db = getFirestore(app)
        const flashcardsRef = collection(db, "sessions", sessionId, "flashcards")

        await Promise.all(
          parsed.map(async (card: Flashcard) => {
            await addDoc(flashcardsRef, {
              question: card.question,
              answer: card.answer
            })
          })
        )
      } else {
        console.error("Parsed flashcards not an array:", parsed)
      }
    } catch (err) {
      console.error("Failed to parse flashcards:", err)
    }

    setLoading(false)
  }

  useEffect(() => {
    if (autoGenerate) handleGenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate])

  if (!file) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-6 text-center text-gray-300">
        Please upload a file first.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mx-auto mb-4" />
        <p className="text-white font-medium mb-2">Creating your flashcard set...</p>
        <p className="text-sm text-gray-400">Generating optimized study cards</p>
      </div>
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="space-y-4">
        <button
          className="w-full bg-white text-black hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/20 flex items-center justify-center gap-2"
          onClick={handleGenerate}
        >
          <Sparkles className="w-4 h-4" /> Generate Flashcards
        </button>
      </div>
    )
  }

  const current = flashcards[currentIndex]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
          <Zap className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Flashcards</h3>
          <p className="text-gray-400 text-sm">Click to flip between question & answer</p>
        </div>
      </div>

      {/* Flashcard */}
      <div
        className={`bg-white/[0.02] border border-white/10 rounded-xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all duration-300 transform ${
          showAnswer ? "scale-105" : ""
        }`}
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <RotateCcw className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Click to flip</span>
          </div>

          {!showAnswer ? (
            <>
              <div className="text-sm text-yellow-400 mb-4 font-medium">QUESTION</div>
              <p className="text-lg font-medium text-white leading-relaxed">{current.question}</p>
            </>
          ) : (
            <>
              <div className="text-sm text-yellow-400 mb-4 font-medium">ANSWER</div>
              <p className="text-base text-gray-200 leading-relaxed">{current.answer}</p>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setCurrentIndex(i => Math.max(0, i - 1))
            setShowAnswer(false)
          }}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-50 disabled:cursor-not-allowed text-white border border-white/10 font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <div className="text-sm text-gray-400">
          {currentIndex + 1} / {flashcards.length}
        </div>

        <button
          onClick={() => {
            setCurrentIndex(i => Math.min(flashcards.length - 1, i + 1))
            setShowAnswer(false)
          }}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center gap-2 bg-white text-black hover:bg-gray-100 disabled:bg-white/10 disabled:text-gray-500 disabled:cursor-not-allowed font-medium py-2 px-4 rounded-lg transition-all duration-200"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
