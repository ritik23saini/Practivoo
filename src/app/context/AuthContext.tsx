// app/context/AuthContext.tsx
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";


const AuthContext = createContext<{
  logout: () => void;
} | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();



  const logout = async () => {
    try {
      await fetch("/api/admin/logout", {  //simliar api call for school/admin logout 
        method: "POST", 
        credentials: "include"
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
     ;
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
