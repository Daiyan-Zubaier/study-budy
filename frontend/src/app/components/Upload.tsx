"use client";
import React, { useState, useRef } from "react";

export default function SessionPage() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [option, setOption] = useState("upload");

  const startTimer = () => {
    if (!running) {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setSeconds(0);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="text-4xl font-bold">
        {Math.floor(seconds / 60)
          .toString()
          .padStart(2, "0")}
        :{(seconds % 60).toString().padStart(2, "0")}
      </div>
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={startTimer}
          disabled={running}
        >
          Start
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={stopTimer}
          disabled={!running}
        >
          Stop
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={resetTimer}
        >
          Reset
        </button>
      </div>
      <div>
        <select
          className="border rounded px-4 py-2"
          value={option}
          onChange={(e) => setOption(e.target.value)}
        >
          <option value="upload">Upload</option>
          <option value="quiz">Quiz</option>
          <option value="flashcards">Flashcards</option>
        </select>
      </div>
    </div>
  );
}