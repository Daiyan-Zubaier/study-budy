"use client";
import { useEffect, useState } from "react";
import { doc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Monitor, Wifi, WifiOff } from "lucide-react";

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
    <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-2xl p-6 shadow-2xl w-72 text-center z-30">
      <div className="flex items-center justify-center gap-3 mb-4">
        <Monitor className="text-blue-400" size={24} />
        <h3 className="font-bold text-white text-lg">Posture Monitor</h3>
      </div>
      
      <div className="mb-4">
        <p className="text-4xl font-bold text-white mb-2">
          {angle !== null ? `${angle.toFixed(1)}°` : "..."}
        </p>
      </div>
      
      <div className="flex items-center justify-center gap-2">
        {status === "disconnected" ? (
          <WifiOff className="text-red-400" size={20} />
        ) : (
          <Wifi className="text-green-400" size={20} />
        )}
        <p className={`font-semibold uppercase text-sm ${
          status === "good"
            ? "text-green-400"
            : status === "bad"
            ? "text-yellow-400"
            : "text-red-400"
        }`}>
          {status === "good"
            ? "Posture Good ✅"
            : status === "bad"
            ? "Fix Your Posture ⚠️"
            : "Disconnected ❌"}
        </p>
      </div>
    </div>
  );
}
