"use client";

import Link from "next/link";

// /app/page.tsx


import { Brain, Clock, Trophy, Target, Play } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col gap-40">
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
      <main className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-bold mb-6 leading-tight max-w-5xl mx-auto">
            Your study companion for<br />
            <span className="text-blue-400">better learning</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Track your posture, create AI-powered flashcards, and test your<br />
            knowledge with intelligent quizzes. All in one place.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-8 max-w-4xl w-full mb-12">
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 flex items-center gap-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <Clock className="text-green-400" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">24h 32m</h2>
              <p className="text-gray-500 text-base">Study time this week</p>
            </div>
          </div>
          
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 flex items-center gap-6">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Trophy className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">87%</h2>
              <p className="text-gray-500 text-base">Average quiz score</p>
            </div>
          </div>
          
          <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 flex items-center gap-6">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Target className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">92%</h2>
              <p className="text-gray-500 text-base">Posture improvement</p>
            </div>
          </div>
        </div>

        {/* Start Session Button */}
        <div>
        <Link href="/session">
        <button className="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700
         to-blue-800 hover:from-blue-700 hover:via-blue-800 hover:to-blue-900 text-white px-16 py-6 rounded-2xl text-xl 
         font-bold transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 border border-blue-500/30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <div className="relative flex items-center gap-3">
            <Play size={28} className="group-hover:scale-110 transition-transform duration-300" />
            <span>Start New Session</span>
          </div>
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