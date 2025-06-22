import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Study Buddy - AI-Powered Learning",
  description: "Your intelligent study companion for enhanced learning",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex min-h-screen bg-[#0a0a0a] text-[#ededed] antialiased`}>
        {/* Left Sidebar */}
        <aside className="sticky top-0 h-screen w-64 overflow-y-auto bg-gray-900 text-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4">Previous Sessions</h2>
          <div className="space-y-2">
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">
              Session 1
            </div>
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">
              Session 2
            </div>
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">
              Session 3
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col">
          {/* Top Navbar */}
          <header className="flex items-center justify-between border-b border-gray-700 bg-[#0a0a0a] px-6 py-4">
            <span className="text-xl font-bold text-[#ededed]">Study Buddy</span>
            <span className="text-sm text-blue-500 cursor-pointer">Login</span>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
