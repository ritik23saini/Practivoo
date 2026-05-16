"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiSettings, FiBell } from "react-icons/fi";

export default function Header() {
  const [hasUnread, setHasUnread] = useState(false);
  const rawPath = usePathname();
  const pathname = rawPath ?? "";
  const [image, setImage] = useState<string | null>(null);
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname.startsWith("/students")) return "Students";
    if (pathname.startsWith("/teachers")) return "Teachers";
    if (pathname.startsWith("/tasks")) return "Tasks";
    if (pathname.startsWith("/levels")) return "Levels";
    if (pathname.startsWith("/add")) return "Add";
    if (pathname.startsWith("/settings")) return "Settings";
    if (pathname.startsWith("/notifications")) return "Notification";
    if (pathname.startsWith("/profile")) return "School Profile";
    return "Dashboard";
  };

  useEffect(() => {

    // Fetch unread notification status
    const fetchUnreadStatus = async () => {
      try {

        const response = await fetch(`/api/schools/notification/`, { credentials: "include" });
        if (!response.ok) {
          console.log("Failed to fetch notifications:", response.statusText);
          return;
        }
        const data = await response.json();
        console.log("Notification response:", data);

        // Check if there are unread notifications
        // The API returns { notifications: [], count: number }
        if (data.notifications && Array.isArray(data.notifications)) {
          const unreadExists = data.notifications.some((n: any) => !n.isRead);
          setHasUnread(unreadExists);
        }
        else {
          setHasUnread(false)
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    // Fetch school profile image
    const fetchSchoolProfile = async () => {
      try {
      

        const response = await fetch(`/api/schools/`, { credentials: "include" });
        const schoolData = await response.json();

        if (response.ok) {
          setImage(schoolData.image || "/user.png");
        } else {
          setImage("/user.png");
        }
      } catch (error) {
        console.error("Failed to fetch school profile:", error);
        setImage("/user.png");
      }
    };

    fetchUnreadStatus();
    fetchSchoolProfile();

    // Optional: Poll for new notifications every 120 seconds
   /*  const interval = setInterval(fetchUnreadStatus, 1200000);
    console.log(interval)
    return () => clearInterval(interval); */
  }, []); // Empty dependency array - runs once on mount

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white rounded-t-2xl shadow-sm">
      {/* Dynamic Page Title */}
      <h2 className="text-xl font-semibold text-[#2C2F5A]">{getPageTitle()}</h2>

      {/* Icons + Avatar */}
      <div className="flex items-center gap-4">
        <Link href="/settings">
          <button className="w-9 h-9 cursor-pointer rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiSettings className="text-blue-900 text-base" />
          </button>
        </Link>

        <Link href="/notifications">
          <button className="relative w-9 h-9 cursor-pointer rounded-full bg-[#F1F3FB] flex items-center justify-center shadow-sm hover:shadow-md transition">
            <FiBell className="text-gray-700 text-base" />
            {/* Red notification dot badge */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </button>
        </Link>

        {/* Conditionally render image only when it's available */}
        {image && (
          <img
            onClick={() => router.push("/profile")}
            src={image}
            alt="User Avatar"
            className="w-9 h-9 cursor-pointer rounded-full object-cover border border-gray-200 hover:shadow-lg transition"
          />
        )}
      </div>
    </div>
  );
}
