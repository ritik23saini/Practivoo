// app/context/AdminAuthContext.tsx - WITH REFRESH
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const AdminAuthContext = createContext<{
  logout: () => void;
} | null>(null);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();


  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error('Logout API error:', error);
    }
    // ✅ Force refresh + redirect
    router.refresh(); // Clear Next.js cache
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider value={{ logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
};
