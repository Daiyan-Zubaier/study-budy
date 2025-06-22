// /frontend/app/session/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Upload from "../components/Upload";
import Quiz from "../components/Quiz";
import Flashcards from "../components/Flashcards";
import { db } from "../../lib/firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import PostureMonitor from "../components/PostureMonitor";
import FaceHandTracker from "../components/FaceHandTracker";
import { Play, Square, RotateCcw, Clock, FileText, Brain, Trophy } from "lucide-react";

export default function SessionPage() {
  const [inputMinutes, setInputMinutes] = useState(25);
  const [inputSeconds, setInputSeconds] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [option, setOption] = useState<"upload" | "flashcards" | "quiz">("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startTimer = async () => {
    if (!running && secondsLeft > 0) {
      setRunning(true);
      const newStartTime = new Date();
      setStartTime(newStartTime);

      // Create Firestore doc
      const newDocRef = doc(collection(db, "sessions"));
      await setDoc(newDocRef, {
        title: sessionTitle,
        startedAt: serverTimestamp(),
        status: "inProgress"
      });

      setSessionId(newDocRef.id);
      console.log("Session ID:", newDocRef.id);

      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            stopSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
  };

  const stopSession = async () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!sessionId || !startTime) return;

    const endedAt = new Date();
    const durationSeconds = Math.round((endedAt.getTime() - startTime.getTime()) / 1000);

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      endedAt,
      durationSeconds,
      status: "completed"
    });
  };

  const stopTimer = () => {
    stopSession();
  };

  const resetTimer = () => {
    setSecondsLeft(inputMinutes * 60 + inputSeconds);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(0, Number(e.target.value));
    setInputMinutes(val);
    setSecondsLeft(val * 60 + inputSeconds);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = Math.max(0, Number(e.target.value));
    if (val > 59) val = 59;
    setInputSeconds(val);
    setSecondsLeft(inputMinutes * 60 + val);
  };

  let content: React.ReactNode = null;
  if (option === "upload") {
    content = (
      <div className="flex flex-col items-center gap-8 py-8">
        <Upload onFile={setUploadedFile} />
        {uploadedFile && (
          <div className="flex gap-6 mt-6">
            <button
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setOption("flashcards")}
            >
              <Brain size={20} />
              Generate Flashcards
            </button>
            <button
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              onClick={() => setOption("quiz")}
            >
              <Trophy size={20} />
              Generate Quiz
            </button>
          </div>
        )}
      </div>
    );
  } else if (option === "quiz") {
    content = <div className="py-8"><Quiz file={uploadedFile} autoGenerate /></div>;
  } else if (option === "flashcards") {
    content = <div className="py-8"><Flashcards file={uploadedFile} autoGenerate sessionId={sessionId ?? "temp-session"} /></div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="flex flex-col items-center justify-start min-h-screen py-12 px-8h">
        <div className="flex flex-col gap-16 max-w-6xl mx-auto w-full">
          
          {/* Header Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-12 text-center mt-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              {sessionTitle || "New Study Session"}
            </h1>
            <p className="text-xl text-gray-400">Focus, learn, and track your progress</p>
          </div>

          {/* Session Configuration */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-300">Session Title</label>
                <input
                  type="text"
                  placeholder="e.g. Physics Review"
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-lg"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-300">Minutes</label>
                <input
                  type="number"
                  min={0}
                  value={inputMinutes}
                  onChange={handleMinutesChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-lg"
                  disabled={running}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-medium text-gray-300">Seconds</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={inputSeconds}
                  onChange={handleSecondsChange}
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-xl px-6 py-4 text-white text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-lg"
                  disabled={running}
                />
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-6 bg-gray-900/50 border border-gray-600 rounded-3xl px-12 py-10">
                <Clock className="text-blue-400" size={40} />
                <div className="text-7xl font-bold text-white font-mono">
                  {Math.floor(secondsLeft / 60).toString().padStart(2, "0")}
                  <span className="text-blue-400">:</span>
                  {(secondsLeft % 60).toString().padStart(2, "0")}
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex gap-6 justify-center">
              <button 
                className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none text-lg" 
                onClick={startTimer} 
                disabled={running || secondsLeft === 0}
              >
                <Play size={20} />
                Start
              </button>
              <button 
                className="flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none text-lg" 
                onClick={stopTimer} 
                disabled={!running}
              >
                <Square size={20} />
                Stop
              </button>
              <button 
                className="flex items-center gap-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-lg" 
                onClick={resetTimer}
              >
                <RotateCcw size={20} />
                Reset
              </button>
            </div>
          </div>

          {/* Activity Selection */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-12 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-4">Study Activity</h2>
              <p className="text-xl text-gray-400">Choose how you want to study</p>
            </div>

            <div className="flex justify-center mb-12">
              <div className="bg-gray-900/50 border border-gray-600 rounded-2xl p-2 inline-flex gap-2">
                <button
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all text-lg ${
                    option === "upload" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                  onClick={() => setOption("upload")}
                >
                  <FileText size={20} />
                  Upload
                </button>
                <button
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all text-lg ${
                    option === "flashcards" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                  onClick={() => setOption("flashcards")}
                >
                  <Brain size={20} />
                  Flashcards
                </button>
                <button
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-medium transition-all text-lg ${
                    option === "quiz" 
                      ? "bg-blue-600 text-white shadow-lg" 
                      : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                  }`}
                  onClick={() => setOption("quiz")}
                >
                  <Trophy size={20} />
                  Quiz
                </button>
              </div>
            </div>

            <div className="flex w-full justify-center">{content}</div>
          </div>
          
          <div className="pb-16">
            <FaceHandTracker />
          </div>
        </div>
      </div>
    </div>
  );
}