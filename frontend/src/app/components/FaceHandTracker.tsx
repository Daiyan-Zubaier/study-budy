import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";

export default function FaceHandTracker() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [detected, setDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const detectionBuffer = useRef<boolean[]>([]);
  const [lastDrank, setLastDrank] = useState<number | null>(null);
  const [reminder, setReminder] = useState(false);
  const reminderInterval = useRef<NodeJS.Timeout | null>(null);
  const [faceStart, setFaceStart] = useState<number | null>(null);
  const [faceBreak, setFaceBreak] = useState(false);
  const faceBreakInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let running = true;
    let faceLandmarker: FaceLandmarker | null = null;
    let handLandmarker: HandLandmarker | null = null;
    let stream: MediaStream;

    async function runDetection() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/shared/models/face_landmarker.task",
          },
          runningMode: "VIDEO",
        });
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "/shared/models/hand_landmarker.task",
          },
          runningMode: "VIDEO",
        });

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        async function detect() {
          if (!videoRef.current || !faceLandmarker || !handLandmarker) return;
          const video = videoRef.current;
          const faceResults = faceLandmarker.detectForVideo(video, Date.now());
          const handResults = handLandmarker.detectForVideo(video, Date.now());

          let drinking = false;
          let faceDetected = !!faceResults.faceLandmarks?.length;
          let handDetected = !!handResults.landmarks?.length;
          // Face break timer logic
          if (faceDetected) {
            setFaceStart((prev) => prev ?? Date.now());
          } else {
            setFaceStart(null);
          }
          if (faceDetected && handDetected) {
            const face = faceResults.faceLandmarks[0];
            const hand = handResults.landmarks[0];
            const mouth =
              face[13] && face[14]
                ? {
                    x: (face[13].x + face[14].x) / 2,
                    y: (face[13].y + face[14].y) / 2,
                    z: (face[13].z + face[14].z) / 2,
                  }
                : null;
            // Check multiple hand landmarks
            const handPoints = [hand[0], hand[5], hand[8], hand[12]];
            const threshold = 0.45;
            function isNearMouth(point: any) {
              if (!mouth || !point) return false;
              const dx = point.x - mouth.x;
              const dy = point.y - mouth.y;
              const dz = (point.z || 0) - (mouth.z || 0);
              const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
              return dist < threshold;
            }
            if (handPoints.some(isNearMouth)) {
              drinking = true;
            }
          }
          detectionBuffer.current.push(drinking);
          if (detectionBuffer.current.length > 5) detectionBuffer.current.shift();
          const count = detectionBuffer.current.filter(Boolean).length;
          setDetected(count >= 3);
          if (count >= 3) {
            setLastDrank(Date.now());
          }

          if (running) requestAnimationFrame(detect);
        }
        detect();
      } catch (err: any) {
        if (err instanceof Event) {
          console.error("MediaPipe Tasks load error (Event):", err, JSON.stringify(err));
          setError("Failed to load MediaPipe Tasks: Event type: " + err.type);
        } else {
          console.error("MediaPipe Tasks load error:", err);
          setError("Failed to load MediaPipe Tasks: " + (err?.message || String(err)));
        }
      }
    }

    runDetection();
    return () => {
      running = false;
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    // Timer to check for reminder
    if (reminderInterval.current) clearInterval(reminderInterval.current);
    reminderInterval.current = setInterval(() => {
      if (lastDrank !== null) {
        const now = Date.now();
        if (now - lastDrank > 10000) {
          setReminder(true);
        } else {
          setReminder(false);
        }
      }
    }, 1000);
    return () => {
      if (reminderInterval.current) clearInterval(reminderInterval.current);
    };
  }, [lastDrank]);

  useEffect(() => {
    // Timer to check for face break
    if (faceBreakInterval.current) clearInterval(faceBreakInterval.current);
    faceBreakInterval.current = setInterval(() => {
      if (faceStart !== null) {
        const now = Date.now();
        if (now - faceStart > 30000) {
          setFaceBreak(true);
        } else {
          setFaceBreak(false);
        }
      } else {
        setFaceBreak(false);
      }
    }, 1000);
    return () => {
      if (faceBreakInterval.current) clearInterval(faceBreakInterval.current);
    };
  }, [faceStart]);

  // Suppress TensorFlow Lite XNNPACK delegate INFO logs
  const originalConsoleError = console.error;
  console.error = function (...args) {
    if (
      typeof args[0] === "string" &&
      args[0].includes("INFO: Created TensorFlow Lite XNNPACK delegate for CPU.")
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  return (
    <div>
      <video ref={videoRef} style={{ display: "none" }} playsInline />
      {error && <div className="bg-red-200 text-red-800 p-2 rounded mb-2">{error}</div>}
      {detected && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg animate-bounce">
          👋 Face and hand detected!
        </div>
      )}
      {reminder && (
        <div className="bg-yellow-300 text-yellow-800 p-2 rounded mt-2">
          ⏰ Reminder: It's been a while since you last drank. Stay hydrated!
        </div>
      )}
      {faceBreak && (
        <div className="bg-orange-300 text-orange-900 p-2 rounded mt-2">
          🛑 You've been working for a while! Consider taking a short break.
        </div>
      )}
    </div>
  );
}
