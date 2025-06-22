import { db } from "@/lib/firebase"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"

export default async function SessionStatsPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params

  try {
    const sessionRef = doc(db, "sessions", sessionId)
    const sessionSnap = await getDoc(sessionRef)
    const sessionData = sessionSnap.exists() ? sessionSnap.data() : null

    const postureSnap = await getDocs(collection(db, "sessions", sessionId, "postureLogs"))
    const postureLogs = postureSnap.docs.map((doc) => doc.data())

    const quizRef = doc(db, "sessions", sessionId, "quiz", "results");
    const quizSnap = await getDoc(quizRef);
    const quizData = quizSnap.exists() ? quizSnap.data() : null;

    const flashcardSnap = await getDocs(collection(db, "sessions", sessionId, "flashcards"));
    const flashcards = flashcardSnap.docs.map((doc) => doc.data());

    if (!sessionData) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-md w-full text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white mb-2">Session Not Found</h1>
            <p className="text-zinc-400 text-sm mb-1">Session ID: {sessionId}</p>
            <p className="text-zinc-500 text-sm">This session doesn't exist or couldn't be loaded.</p>
          </div>
        </div>
      )
    }

    const goodPostureCount = postureLogs.filter((log) => log.status === "good").length
    const totalLogs = postureLogs.length
    const postureScore = totalLogs > 0 ? Math.round((goodPostureCount / totalLogs) * 100) : 0

    return (
      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center mb-10">
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3">{sessionData?.title || "Untitled Session"}</h1>
            <p className="text-zinc-400 text-base">Session Analytics & Posture Monitoring</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Status */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${sessionData?.status === "completed"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-blue-500/10 text-blue-400"
                    }`}
                >
                  {sessionData?.status || "unknown"}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">Session Status</p>
              <p className="text-white font-semibold capitalize">{sessionData?.status || "Unknown"}</p>
            </div>

            {/* Duration */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-1">Duration</p>
              <p className="text-white font-semibold">
                {sessionData?.durationSeconds
                  ? `${Math.floor(sessionData.durationSeconds / 60)}m ${sessionData.durationSeconds % 60}s`
                  : "N/A"}
              </p>
            </div>

            {/* Posture Score */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-xs text-zinc-500">
                  {goodPostureCount}/{totalLogs}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-1">Posture Score</p>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold">{postureScore}%</p>
                <div className="flex-1 bg-zinc-800 rounded-full h-1.5">
                  <div
                    className="bg-green-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${postureScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Data Points */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 bg-orange-500/10 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-1">Data Points</p>
              <p className="text-white font-semibold">{totalLogs}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Session Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center mb-6">
                <div className="w-8 h-8 bg-blue-500/10 rounded-md flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Session Details</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">Started At</p>
                  <p className="text-white text-sm font-mono">
                    {sessionData?.startedAt?.toDate?.()?.toLocaleString() || "N/A"}
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-400 text-sm mb-1">Ended At</p>
                  <p className="text-white text-sm font-mono">
                    {sessionData?.endedAt?.toDate?.()?.toLocaleString() || "In Progress"}
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-zinc-400 text-sm mb-1">Good Posture Ratio</p>
                  <div className="flex items-center justify-between">
                    <p className="text-green-400 font-semibold">
                      {goodPostureCount} / {totalLogs}
                    </p>
                    <p
                      className={`font-semibold ${postureScore >= 80 ? "text-green-400" : postureScore >= 60 ? "text-yellow-400" : "text-red-400"
                        }`}
                    >
                      {postureScore}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Posture Monitoring */}
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500/10 rounded-md flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">Posture Monitoring</h2>
                </div>
                <div className="text-right">
                  <p className="text-zinc-400 text-sm">Real-time tracking</p>
                  <p className="text-white text-sm font-medium">{totalLogs} measurements</p>
                </div>
              </div>

              {postureLogs.length > 0 ? (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {postureLogs.map((log: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-md hover:bg-zinc-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${log.status === "good" ? "bg-green-400" : "bg-yellow-400"}`}
                        />
                        <span className="text-zinc-300 text-sm font-mono">
                          {log.timestamp?.toDate?.()?.toLocaleTimeString() || `Entry ${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-white font-mono text-sm">{log.angle?.toFixed?.(1) || log.angle}°</p>
                          <p className="text-zinc-500 text-xs">angle</p>
                        </div>

                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${log.status === "good"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-yellow-500/10 text-yellow-400"
                            }`}
                        >
                          {log.status || "unknown"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white font-medium mb-1">No Data Available</h3>
                  <p className="text-zinc-400 text-sm">No posture data has been recorded for this session.</p>
                </div>
              )}
            </div>
          </div>

          {flashcards.length > 0 && (
            <div className="bg-black rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-6 text-white text-center">🧠 Flashcards</h2>
              <div className="space-y-4">
                {flashcards.map((card: any, idx: number) => (
                  <div key={idx} className="border border-gray-300 rounded-xl p-4 bg-gray-50">
                    <p className="text-gray-800 font-medium">Q{idx + 1}: {card.question}</p>
                    <p className="text-gray-700 mt-2"><span className="font-semibold text-green-700">Answer:</span> {card.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quizData && (
            <div className="bg-black rounded-lg shadow-md p-6 mt-6">
              <h2 className="text-2xl font-semibold mb-6 text-white text-center">📘 Quiz Results</h2>

              <div className="text-center text-lg text-gray-100 mb-6">
                Score: <span className="text-green-600 font-bold">{quizData.score}</span> / {quizData.total}
              </div>

              <div className="space-y-6">
                {quizData.questions?.map((q: any, idx: number) => {
                  const isCorrect = q.wasCorrect;
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg shadow-sm border-2 ${isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
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



          {/* Footer */}
          <div className="text-center mt-12 pt-6 border-t border-zinc-800">

            <p className="text-zinc-500 text-sm">
              Session ID: <span className="font-mono text-zinc-400">{sessionId}</span>
            </p>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 max-w-lg w-full text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-500/10 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Error Loading Session</h1>
          <p className="text-zinc-400 text-sm mb-1">Session ID: {sessionId}</p>
          <div className="bg-red-500/5 border border-red-500/20 rounded-md p-3 mt-4">
            <p className="text-red-400 text-sm font-mono">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
          </div>
        </div>
      </div>
    )
  }
}
