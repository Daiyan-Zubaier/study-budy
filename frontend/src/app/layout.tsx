// frontend/app/layout.tsx
import "../styles/globals.css";   // pulls in Tailwind + your resets
import type { ReactNode } from "react";
import SidebarSessionList from "./components/SidebarSessionList";

export const metadata = {
  title: "My Site",
  description: "Whatever description you like",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-white">
        {/* Left Sticky Sidebar */}
        <SidebarSessionList/>

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
