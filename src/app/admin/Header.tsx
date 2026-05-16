"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiSettings, FiBell } from "react-icons/fi";

export default function Header() {
  const rawPath = usePathname();
  const pathname = rawPath ?? ""; // <-- guard against null

  const getPageTitle = () => {
    if (pathname.startsWith("/admin/dashboard")) return "Dashboard";
    if (pathname.startsWith("/admin/schools")) return "Schools";
    if (pathname.startsWith("/admin/tasks")) return "Tasks";
    if (pathname.startsWith("/admin/levels")) return "Levels";
    return "Dashboard";
  };

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white rounded-t-2xl shadow-sm">
      {/* Dynamic Page Title */}
      <h2 className="text-xl font-semibold text-[#2C2F5A]">{getPageTitle()}</h2>

      {/* Icons + Avatar */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <button className="w-9 h-9 rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiSettings className="text-blue-900 text-base" />
          </button>
        </Link>

        <Link href="/admin/notifications">
          <button className="w-9 h-9 rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiBell className="text-red-500 text-base" />
          </button>
        </Link>

      </div>
    </div>
  );
}