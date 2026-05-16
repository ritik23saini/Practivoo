"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineUser,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineLogout,
} from "react-icons/hi";
import { FiPlus, FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function Sidebar() {
 const rawPath = usePathname();
  const pathname = rawPath ?? ""; 
  const { logout } = useAuth();
  const [addExpanded, setAddExpanded] = useState(true);

  const navItems = [
    { name: "Dashboard", icon: <HiOutlineHome />, href: "/dashboard" },
    { name: "Students", icon: <HiOutlineUserGroup />, href: "/students" },
    { name: "Teachers", icon: <HiOutlineUser />, href: "/teachers" },
    { name: "Tasks", icon: <HiOutlineClipboardList />, href: "/tasks" },
    { name: "Levels", icon: <HiOutlineChartBar />, href: "/levels" },
  ];

  const addItems = [
    { name: "Class", href: "/add/class" },
    { name: "Student", href: "/add/student" },
    { name: "Teacher", href: "/add/teacher" },
  ];

  return (
    <aside className="bg-[#0046D2] text-white w-60 h-screen flex flex-col justify-between py-6 px-4">
      {/* Logo */}
      <div>
        <div className="text-white text-2xl font-bold mb-10 px-2">
          <span className="font-logo text-3xl">P</span>ractivoo
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link href={item.href} key={item.name}>
              <div
                className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm cursor-pointer transition ${
                  pathname === item.href
                    ? "bg-white text-[#0046D2] font-semibold"
                    : "hover:bg-blue-800"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </div>
            </Link>
          ))}

          {/* Add Dropdown */}
          <div className="mt-2">
            <button
              onClick={() => setAddExpanded(!addExpanded)}
              className={`w-full flex items-center justify-between px-4 py-2 rounded-full text-sm transition ${
                pathname.startsWith("/add")
                  ? "bg-white text-[#0046D2] font-semibold"
                  : "hover:bg-blue-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <FiPlus className="text-lg" />
                <span>Add</span>
              </div>
              {addExpanded ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {addExpanded && (
              <div className="ml-8 mt-2 space-y-1">
                {addItems.map((item) => (
                  <Link href={item.href} key={item.name}>
                    <div
                      className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition ${
                        pathname === item.href
                          ? "bg-white text-[#0046D2] font-semibold"
                          : "hover:bg-blue-800 text-white"
                      }`}
                    >
                      • {item.name}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Logout */}
      <div className="border-t border-white/20 pt-6">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border border-white text-white px-4 py-2 rounded-lg text-sm hover:bg-white hover:text-[#0046D2] transition"
        >
          <HiOutlineLogout />
          Log Out
        </button>
      </div>
    </aside>
  );
}
