"use client";
import React, { useState, useRef } from "react";
import Upload from "../components/Upload";
import Quiz from "../components/Quiz";
import Flashcards from "../components/Flashcards";

export default function SessionPage() {
  const [inputMinutes, setInputMinutes] = useState(25); // default 25 min
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [option, setOption] = useState("upload");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const startTimer = () => {
    if (!running && secondsLeft > 0) {
      setRunning(true);
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
  };

  const stopTimer = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    setSecondsLeft(inputMinutes * 60);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number(e.target.value));
    setInputMinutes(val);
    setSecondsLeft(val * 60);
  };

  let content = null;
  if (option === "upload") content = <Upload onFile={setUploadedFile} />;
  else if (option === "quiz") content = <Quiz file={uploadedFile} />;
  else if (option === "flashcards") content = <Flashcards file={uploadedFile} />;


  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8">
      <div className="flex flex-col items-center gap-2">
        <label className="text-sm">Set Minutes:</label>
        <input
          type="number"
          min={1}
          value={inputMinutes}
          onChange={handleMinutesChange}
          className="border rounded px-2 py-1 w-20 text-center"
          disabled={running}
        />
      </div>
      <div className="text-4xl font-bold">
        {Math.floor(secondsLeft / 60)
          .toString()
          .padStart(2, "0")}
        :{(secondsLeft % 60).toString().padStart(2, "0")}
      </div>
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          onClick={startTimer}
          disabled={running || secondsLeft === 0}
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
      <div className="w-full flex justify-center">{content}</div>
    </div>
  );
}