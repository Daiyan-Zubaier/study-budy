import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  FaceLandmarker,
  HandLandmarker,
} from "@mediapipe/tasks-vision";
import { Droplets, Coffee, Eye, EyeOff } from "lucide-react";

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
    <div className="relative">
      <video ref={videoRef} style={{ display: "none" }} playsInline />
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
              <EyeOff className="text-red-400" size={16} />
            </div>
            <div>
              <h4 className="text-red-400 font-semibold">Camera Error</h4>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detection Status */}
      {detected && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-blue-500/90 backdrop-blur-sm border border-blue-400/30 rounded-2xl px-6 py-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-400/20 rounded-full flex items-center justify-center">
                <Eye className="text-blue-300" size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold">Detection Active</h4>
                <p className="text-blue-100 text-sm">Face and hand tracking enabled</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hydration Reminder */}
      {reminder && (
        <div className="fixed bottom-24 left-6 z-50 animate-pulse">
          <div className="bg-cyan-500/90 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-cyan-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Droplets className="text-cyan-300" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Stay Hydrated!</h4>
                <p className="text-cyan-100 text-sm leading-relaxed">
                  It's been a while since you last drank water. Take a quick sip to stay focused! 💧
                </p>
              </div>
            </div>
            <button 
              onClick={() => setReminder(false)}
              className="mt-4 w-full bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/30 rounded-xl py-2 px-4 text-cyan-100 font-medium transition-all duration-200"
            >
              Thanks for the reminder!
            </button>
          </div>
        </div>
      )}

      {/* Break Reminder */}
      {faceBreak && (
        <div className="fixed bottom-24 right-6 z-50 animate-pulse">
          <div className="bg-orange-500/90 backdrop-blur-sm border border-orange-400/30 rounded-2xl p-6 shadow-2xl max-w-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Coffee className="text-orange-300" size={24} />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Take a Break!</h4>
                <p className="text-orange-100 text-sm leading-relaxed">
                  You've been studying hard! Consider taking a 5-minute break to rest your eyes. ☕
                </p>
              </div>
            </div>
            <button 
              onClick={() => setFaceBreak(false)}
              className="mt-4 w-full bg-orange-600/30 hover:bg-orange-600/50 border border-orange-400/30 rounded-xl py-2 px-4 text-orange-100 font-medium transition-all duration-200"
            >
              I'll take a break soon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
