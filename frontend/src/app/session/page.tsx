// /frontend/app/session/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Upload from "../components/Upload";
import Quiz from "../components/Quiz";
import Flashcards from "../components/Flashcards";
import { db } from "../../lib/firebase";
import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import PostureMonitor from "../components/PostureMonitor";


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
      console.log("Session ID:", newDocRef.id); // 👈 Add this if it's not there

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
      <div className="flex flex-col items-center gap-4">
        <Upload onFile={setUploadedFile} />
        {uploadedFile && (
          <div className="flex gap-4">
            <button
              className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              onClick={() => setOption("flashcards")}
            >
              Generate Flashcards
            </button>
            <button
              className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
              onClick={() => setOption("quiz")}
            >
              Generate Quiz
            </button>
          </div>
        )}
      </div>
    );
  } else if (option === "quiz") {
    content = <Quiz file={uploadedFile} autoGenerate />;
  } else if (option === "flashcards") {
    content = <Flashcards file={uploadedFile} autoGenerate sessionId={sessionId ?? "temp-session"} />;
  }

  return (
    <div className="text-gray-100 flex flex-col items-center justify-center min-h-[70vh] gap-10 bg-gray-800 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold">{sessionTitle || "New Study Session"}</h1>

      <div className="flex flex-wrap items-end justify-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm">Session Title:</label>
          <input
            type="text"
            placeholder="e.g. Physics Review"
            value={sessionTitle}
            onChange={(e) => setSessionTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
            className="w-56 rounded border border-gray-600 bg-gray-700 px-3 py-1 text-center shadow-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <label className="text-sm">Minutes:</label>
          <input
            type="number"
            min={0}
            value={inputMinutes}
            onChange={handleMinutesChange}
            className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-center shadow-sm focus:border-blue-500 focus:outline-none"
            disabled={running}
          />
        </div>

        <div className="flex flex-col items-center gap-2">
          <label className="text-sm">Seconds:</label>
          <input
            type="number"
            min={0}
            max={59}
            value={inputSeconds}
            onChange={handleSecondsChange}
            className="w-20 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-center shadow-sm focus:border-blue-500 focus:outline-none"
            disabled={running}
          />
        </div>
      </div>

      <div className="text-4xl font-bold">
        {Math.floor(secondsLeft / 60).toString().padStart(2, "0")}
        :
        {(secondsLeft % 60).toString().padStart(2, "0")}
      </div>
      <div className="flex gap-4">
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={startTimer} disabled={running || secondsLeft === 0}>Start</button>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={stopTimer} disabled={!running}>Stop</button>
        <button className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500" onClick={resetTimer}>Reset</button>
      </div>

      <div>
        <select
          className="rounded border border-gray-600 bg-gray-700 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
          value={option}
          onChange={(e) => setOption(e.target.value as "upload" | "flashcards" | "quiz")}
        >
          <option value="upload">Upload</option>
          <option value="quiz">Quiz</option>
          <option value="flashcards">Flashcards</option>
        </select>
      </div>

      <div className="flex w-full justify-center">{content}</div>
      
      <div className="fixed bottom-6 right-6 z-50">
        {sessionId && running && (
          <PostureMonitor
            sessionId={sessionId}
            esp32Url="https://settings-aviation-diversity-encouraged.trycloudflare.com/posture"
            isRunning={running}
          />
        )}
      </div>
    </div>
  );
}
