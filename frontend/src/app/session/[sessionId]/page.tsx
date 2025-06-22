// app/session/[sessionId]/page.tsx
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";

export const dynamic = "force-dynamic"; // 🛠️ Tells Next.js to always render this page dynamically

export default async function SessionStatsPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = await params;

  console.log("Loading session:", sessionId); // Debug log

  try {
    const sessionRef = doc(db, "sessions", sessionId);
    const sessionSnap = await getDoc(sessionRef);
    const sessionData = sessionSnap.exists() ? sessionSnap.data() : null;

    console.log("Session data:", sessionData); // Debug log

    const postureSnap = await getDocs(collection(db, "sessions", sessionId, "postureLogs"));
    const postureLogs = postureSnap.docs.map((doc) => doc.data());

    const quizRef = doc(db, "sessions", sessionId, "quiz", "results");
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.exists() ? quizSnap.data() : null;


    console.log("Posture logs:", postureLogs); // Debug log

    if (!sessionData) {
      return (
        <div className="flex justify-center items-center min-h-full">
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Session Not Found</h1>
            <p>Session ID: {sessionId}</p>
            <p>This session doesn't exist or couldn't be loaded.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-center min-h-full p-6">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
              {sessionData?.title || "Untitled Session"}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700">Status</h3>
                <p className={`text-lg ${sessionData?.status === 'completed' ? 'text-green-600' : 'text-blue-600'}`}>
                  {sessionData?.status || 'Unknown'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700">Duration</h3>
                <p className="text-lg">
                  {sessionData?.durationSeconds 
                    ? `${Math.floor(sessionData.durationSeconds / 60)}m ${sessionData.durationSeconds % 60}s`
                    : 'N/A'
                  }
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700">Started</h3>
                <p className="text-lg">
                  {sessionData?.startedAt?.toDate?.()?.toLocaleString() || 'N/A'}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold text-gray-700">Ended</h3>
                <p className="text-lg">
                  {sessionData?.endedAt?.toDate?.()?.toLocaleString() || 'In Progress'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">Posture Monitoring</h2>
            {postureLogs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {postureLogs.map((log: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">
                      {log.timestamp?.toDate?.()?.toLocaleTimeString() || `Entry ${idx + 1}`}
                    </span>
                    <span className="font-mono">
                      {log.angle?.toFixed?.(1) || log.angle}°
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'good' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {log.status || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-center">No posture data recorded for this session.</p>
            )}
          </div>
          {quizData && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">📘 Quiz Results</h2>

            <div className="text-center text-lg text-gray-700 mb-6">
              Score: <span className="text-green-600 font-bold">{quizData.score}</span> / {quizData.total}
            </div>

            <div className="space-y-6">
              {quizData.questions?.map((q: any, idx: number) => {
                const isCorrect = q.wasCorrect;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg shadow-sm border-2 ${
                      isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                    }`}
                  >
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Q{idx + 1}: {q.question}
                      </h3>
                    </div>

                    <div className="text-gray-700 mb-1">
                      <span className="font-medium">Your Answer:</span>{" "}
                      <span className={isCorrect ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                        {q.selectedAnswer || "No answer"}
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="text-gray-700">
                        <span className="font-medium">Correct Answer:</span>{" "}
                        <span className="text-green-700 font-bold">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading session:", error);
    return (
      <div className="flex justify-center items-center min-h-full">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Session</h1>
          <p>Session ID: {sessionId}</p>
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}
