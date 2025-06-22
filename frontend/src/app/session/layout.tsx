// /app/session/layout.tsx
"use client"
import type { ReactNode } from "react";
import SidebarSessionList from "../components/SidebarSessionList";
import { Brain } from "lucide-react";
import Link from "next/link";
import { motion } from 'framer-motion'

export default function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <motion.div
    className="min-h-screen bg-black text-white"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    <div className="flex min-h-screen bg-black">
      {/* Sidebar - Takes up fixed width, no overlap */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <SidebarSessionList />
      </aside>

      {/* Main Content Area - Takes up remaining space */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/session" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-semibold">StudyBuddy </h1>
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <button className="hover:text-blue-400">Log out</button>
        </div>
      </header>

        {/* Main content - Scrollable area */}
        <main className="flex-1 overflow-y-auto p-6 bg-black">
          {children}
        </main>
      </div>
    </div>
    </motion.div>
  );
}
