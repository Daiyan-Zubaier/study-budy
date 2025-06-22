"use client";

import Link from "next/link";

// /app/page.tsx


import { Brain, Clock, Trophy, Target } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold">StudyBuddy</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button className="hover:text-blue-400">Log out</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 pb-20 gap-20">
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Your study companion for<br />
            <span className="text-blue-400">better learning</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Track your posture, create AI-powered flashcards, and test your<br />
            knowledge with intelligent quizzes. All in one place.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl w-full">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">24h 32m</h2>
              <p className="text-gray-500 text-sm">Study time this week</p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Trophy className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">87%</h2>
              <p className="text-gray-500 text-sm">Average quiz score</p>
            </div>
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Target className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">92%</h2>
              <p className="text-gray-500 text-sm">Posture improvement</p>
            </div>
          </div>
        </div>

        {/* Start Session Button */}
        <div className="mt-16">
          <Link href="/session">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors">
              Start New Session
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}













// export default function Page() {
//   return (
//     <div className="flex h-full items-center justify-center p-4">
//       <Link href="/session">
//         <button className="rounded bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
//           Start session
//         </button>
//       </Link>
//     </div>
//   );
// }
//   );
// }