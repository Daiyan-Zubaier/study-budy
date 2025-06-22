// /app/session/layout.tsx
import type { ReactNode } from "react";
import SidebarSessionList from "../components/SidebarSessionList";

export default function SessionLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Takes up fixed width, no overlap */}
      <aside className="w-64 bg-gray-900 text-white flex-shrink-0">
        <SidebarSessionList />
      </aside>

      {/* Main Content Area - Takes up remaining space */}
      <div className="flex-1 flex flex-col">
        {/* Header - Sticky at top of main content area only */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-white px-6 py-4 shadow-sm">
          <span className="text-xl font-bold text-gray-800">blanked</span>
          <span className="text-sm text-blue-600 cursor-pointer hover:text-blue-800">Login</span>
        </header>

        {/* Main content - Scrollable area */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
