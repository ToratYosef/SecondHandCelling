import { Link, useLocation } from "wouter";
import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/api";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Quick stats for top bar
  const { data: stats } = useQuery({
    queryKey: ["admin-quick-stats"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/quick-stats"));
      if (!res.ok) return { todayOrders: 0, pending: 0, needsPrinting: 0 };
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const navItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/aging", label: "Aging Orders", icon: "⏰" },
    { path: "/admin/analytics", label: "Analytics", icon: "📈" },
    { path: "/admin/print-queue", label: "Print Queue", icon: "🖨️" },
    { path: "/admin/clicks", label: "Clicks", icon: "👆" },
    { path: "/admin/email", label: "Email", icon: "📧" },
    { path: "/admin/devices", label: "Devices", icon: "📱" },
    { path: "/admin/pricing", label: "Pricing", icon: "💰" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const isActive = (path: string) => location === path || location.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo & Menu Toggle */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                SHC
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-bold text-gray-900 dark:text-white">SecondHandCell</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Admin Portal</div>
              </div>
            </Link>
          </div>

          {/* Center: Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Today</span>
              <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{stats?.todayOrders || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Pending</span>
              <span className="text-sm font-bold text-amber-700 dark:text-amber-300">{stats?.pending || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400">To Print</span>
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{stats?.needsPrinting || 0}</span>
            </div>
          </div>

          {/* Right: Admin Info & Logout */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Store
              </Link>
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white">Admin</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await fetch(getApiUrl("/api/auth/logout"), { method: "POST" });
                window.location.href = "/login";
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-[57px] left-0 z-30 h-[calc(100vh-57px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          } ${sidebarOpen ? "w-64" : "lg:w-16"}`}
        >
          <nav className="p-3 space-y-1">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive(item.path)
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={sidebarOpen ? "block" : "hidden lg:hidden"}>{item.label}</span>
                </div>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-57px)]">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
