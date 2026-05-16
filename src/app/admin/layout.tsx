// app/admin/layout.tsx
"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { AdminAuthProvider } from "@/app/context/AdminAuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const publicRoutes = ["/admin/login"];
  const isPublicRoute = publicRoutes.includes(pathname);

  return (
    <AdminAuthProvider>
      {isPublicRoute ? (
        <>{children}</>
      ) : (
        <div className="flex min-h-screen bg-[#F1F3FB]">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <ToastContainer position="top-right" autoClose={3000} />
            <main className="flex-1 p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      )}
    </AdminAuthProvider>
  );
}
