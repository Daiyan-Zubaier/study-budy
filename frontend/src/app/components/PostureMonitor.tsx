"use client";
import { useEffect, useState } from "react";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface PostureMonitorProps {
  sessionId: string;
  esp32Url: string; // full URL like https://defeat-robust-licence-frontier.trycloudflare.com/posture
  isRunning: boolean
}

export default function PostureMonitor({ sessionId, esp32Url, isRunning }: PostureMonitorProps) {
  const [angle, setAngle] = useState<number | null>(null);
  const [status, setStatus] = useState<"good" | "bad" | "disconnected">("disconnected");

  useEffect(() => {
    if (!isRunning) return; //dont poll if running

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/posture`, {
          method: "GET",
          credentials: "omit", // avoids 431 cookie header
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const angle = data.angle;

        setAngle(angle);
        const postureStatus = Math.abs(angle) <= 60 ? "bad" : "good";
        setStatus(postureStatus);

        // ⬇️ Save to Firestore under sessions/{sessionId}/postureLogs
        const docRef = collection(db, "sessions", sessionId, "postureLogs");
        await addDoc(docRef, {
          angle,
          status: postureStatus,
          timestamp: serverTimestamp(),
        });

      } catch (err) {
        console.error("Fetch/posture error:", err);
        setStatus("disconnected");
      }
    }, 1000); // every 1 second

    return () => clearInterval(interval);
  }, [isRunning, sessionId]);

  return (
    <div
      className={`rounded border p-4 shadow w-64 text-center ${
        status === "good"
          ? "bg-green-100 border-green-300 text-green-800"
          : status === "bad"
          ? "bg-yellow-100 border-yellow-300 text-yellow-800"
          : "bg-red-100 border-red-300 text-red-800"
      }`}
    >
      <h3 className="font-bold mb-2">Posture Monitor</h3>
      <p className="text-2xl">{angle !== null ? `${angle.toFixed(1)}°` : "..."}</p>
      <p className="mt-2 font-semibold uppercase">
        {status === "good"
          ? "Posture Good ✅"
          : status === "bad"
          ? "Fix Your Posture ⚠️"
          : "Disconnected ❌"}
      </p>
    </div>
  );
  
  
  
  
}
