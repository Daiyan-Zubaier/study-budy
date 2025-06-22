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
    <aside className="sticky top-0 h-screen w-64 overflow-y-auto bg-gray-900 text-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Previous Sessions</h2>
      <div className="space-y-2">
        {sessions.map((sesh) => (
          <div
            key={sesh.id}
            className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700"
            onClick={() => router.push(`/session/${sesh.id}`)}
          >
            {sesh.title || "Untitled"}
          </div>
        ))}
      </div>
    </aside>
  );
}
