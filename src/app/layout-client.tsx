// app/layout-client.tsx
"use client";
import { Geist, Geist_Mono } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export function RootLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <AuthProvider>
        {children}
        <ToastContainer />
      </AuthProvider>
    </div>
  );
}
