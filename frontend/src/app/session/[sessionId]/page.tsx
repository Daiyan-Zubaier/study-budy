// app/session/[sessionId]/page.tsx
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export default async function SessionStatsPage({ params }: { params: { sessionId: string } }) {
  const sessionRef = doc(db, "sessions", params.sessionId);
  const sessionSnap = await getDoc(sessionRef);
  const sessionData = sessionSnap.exists() ? sessionSnap.data() : null;

  const postureSnap = await getDocs(collection(db, "sessions", params.sessionId, "postureLogs"));
  const postureLogs = postureSnap.docs.map((doc) => doc.data());

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{sessionData?.title || "Untitled"}</h1>
      <p>Status: {sessionData?.status}</p>
      <p>Started: {sessionData?.startedAt?.toDate?.().toLocaleString()}</p>
      <p>Ended: {sessionData?.endedAt?.toDate?.().toLocaleString()}</p>
      <p>Duration: {sessionData?.durationSeconds}s</p>

      <h2 className="mt-6 font-semibold">Posture Logs:</h2>
      <ul className="mt-2 list-disc list-inside">
        {postureLogs.map((log: any, idx) => (
          <li key={idx}>
            {log.timestamp?.toDate?.().toLocaleTimeString()} – Angle: {log.angle}, Status: {log.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
