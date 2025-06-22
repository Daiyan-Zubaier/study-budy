"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface SessionItem {
  id: string;
  title: string;
  startedAt: any;
}

export default function SidebarSessionList() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "sessions"), orderBy("startedAt", "desc"));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as any),
      }));
      setSessions(docs);
    });

    return () => unsub();
  }, []);

  return (
    <div className="h-screen flex flex-col p-4">
      <h2 className="text-lg font-semibold mb-4 text-white">Previous Sessions</h2>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {sessions.map((sesh) => (
          <div
            key={sesh.id}
            className="cursor-pointer rounded bg-gray-800 p-3 hover:bg-gray-700 transition-colors text-gray-100"
            onClick={() => router.push(`/session/${sesh.id}`)}
          >
            <div className="font-medium truncate">
              {sesh.title || "Untitled Session"}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {sesh.startedAt?.toDate?.()?.toLocaleDateString() || "Recent"}
            </div>
          </div>
        ))}
        
        {sessions.length === 0 && (
          <div className="text-gray-400 text-sm italic">
            No sessions yet
          </div>
        )}
      </div>
    </div>
  );
}
