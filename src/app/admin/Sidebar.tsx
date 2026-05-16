"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/app/context/AdminAuthContext";
import {
  HiOutlineHome,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineLogout,
} from "react-icons/hi";
import { FaSchool } from "react-icons/fa6";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Sidebar() {
  const rawPath = usePathname();
  const pathname = rawPath ?? ""; // <-- guard against null
  const { logout } = useAdminAuth();

  const [isTasksOpen, setIsTasksOpen] = useState(pathname?.startsWith("/admin/tasks"));

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="w-56 min-h-screen bg-[#0046D2] text-white flex flex-col justify-between px-4 py-6">
      {/* Logo */}
      <div className="mb-10 px-2">
        <h1 className="text-3xl font-extrabold text-white tracking-wide">Practivoo</h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-4 flex-grow">
        {/* Main Nav Items */}
        <Link href="/admin/dashboard">
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition ${isActive("/admin/dashboard")
              ? "bg-white text-[#0046D2] font-semibold"
              : "hover:bg-blue-700"
              }`}
          >
            <HiOutlineHome className="text-lg" />
            <span>Dashboard</span>
          </div>
        </Link>

        <Link href="/admin/schools">
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition ${isActive("/admin/schools")
              ? "bg-white text-[#0046D2] font-semibold"
              : "hover:bg-blue-700"
              }`}
          >
            <FaSchool className="text-lg" />
            <span>Schools</span>
          </div>
        </Link>

        <Link href="/admin/levels">
          <div
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition ${isActive("/admin/levels")
              ? "bg-white text-[#0046D2] font-semibold"
              : "hover:bg-blue-700"
              }`}
          >
            <HiOutlineChartBar className="text-lg" />
            <span>Levels</span>
          </div>
        </Link>

        {/* Tasks Section */}
        <div className="space-y-1">
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer transition ${pathname.startsWith("/admin/tasks")
              ? "bg-white text-[#0046D2] font-semibold"
              : "hover:bg-blue-700"
              }`}
            onClick={() => setIsTasksOpen(!isTasksOpen)}
          >
            <div className="flex items-center gap-3">
              <HiOutlineClipboardList className="text-lg" />
              <span>Tasks</span>
            </div>
            {isTasksOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>

          {isTasksOpen && (
            <div className="ml-5 space-y-2 text-sm">
              {[
                { name: "All  ", path: "/admin/tasks" },
                { name: "Category", path: "/admin/tasks/category" },
                { name: "Assign / Create Questions ", path: "/admin/questions" },
                { name: "Create New Task  ", path: "/admin/tasks/create" },
              ].map((item) => (
                <Link key={item.name} href={item.path}>
                  <div
                    className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-md ${isActive(item.path)
                      ? "bg-white text-[#0046D2] font-semibold"
                      : "hover:bg-blue-600"
                      }`}
                  >
                    {/* Dot for current active */}
                    {isActive(item.path) ? (
                      <span className="h-2 w-2 rounded-full bg-[#0046D2]" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-white/50" />
                    )}
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Logout */}
      <div className="pt-6 border-t border-white/20">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border border-white text-white py-2 rounded-md text-sm hover:bg-white hover:text-[#0046D2] transition"
        >
          <HiOutlineLogout className="text-lg" />
          Log Out
        </button>
      </div>
    </aside>
  );
}