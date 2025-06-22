// frontend/app/layout.tsx
import "../styles/globals.css";   // pulls in Tailwind + your resets
import type { ReactNode } from "react";

export const metadata = {
  title: "StudyBuddy",
  description: "Whatever description you like",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-white">
        {/* Left Sticky Sidebar */}
        <aside className="sticky top-0 h-screen w-64 overflow-y-auto bg-gray-900 text-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4">Previous Sessions</h2>
          <div className="space-y-2">
            {/* Placeholder session items */}
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">Session 1</div>
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">Session 2</div>
            <div className="cursor-pointer rounded bg-gray-800 p-2 hover:bg-gray-700">Session 3</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col">
          {/* Top Navbar */}
          <header className="flex items-center justify-between border-b bg-white px-6 py-4">
            <span className="text-xl font-bold text-gray-800">blanked</span>
            {/* Placeholder for future auth */}
            <span className="text-sm text-blue-600 cursor-pointer">Login</span>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
