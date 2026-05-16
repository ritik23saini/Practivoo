"use client";

import React, { useState, Suspense } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import forgetPasswordImage from '../../../app/assets/Forget_Password.png';
import Logo from "../../../app/assets/Practivoo_Logo.png"

const ResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const email = searchParams ? searchParams.get('email') || "" : "";
    const role = searchParams ? searchParams.get('role') || "" : "";

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [newPassword, setnewPassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');

    const router = useRouter();

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        if (newPassword.length < 8 || newPassword.length > 16) {
            alert("Password must be between 8 and 16 characters.");
            return;
        }
        if (newPassword.length !== confirmPassword.length) {
            setMessage("New and Confirm password must be same ");
            return;
        }
        setIsSubmitting(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, newPassword, usertype: role && role.toString() }),

            });
            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                toast.success(data.message);
                setTimeout(() => {
                    router.replace(role === "admin" ? `/${role}/login` : '/login');
                }, 1500);
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full flex">
                {/* Left Side - Branding */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-12 flex flex-col justify-center items-center text-white w-2/5 relative">
                    <div className="text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <Image src={Logo} alt="My asset" width={200} height={200} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-wide">Practivoo</h1>
                        </div>
                        <div className="space-y-2">
                            <p className="text-lg font-medium">Practice Today</p>
                            <p className="text-lg font-medium">Progress Tomorrow</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-12 w-3/5 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-blue-600 mb-6">
                                Create a New Password
                            </h2>
                            <div className="mb-6 flex justify-center">
                                <Image
                                    src={forgetPasswordImage}
                                    alt="Forget Password"
                                    width={200}
                                    height={200}
                                />
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Email: {email}
                            </p>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Please enter a strong password and confirm it to reset your account password
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setnewPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Enter new Password"
                                    />
                                </div>

                                <label className="block mt-5 text-sm font-medium text-gray-700 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setconfirmPassword(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                                        placeholder="Confirm new Password"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`text-sm text-center p-3 rounded-lg ${message.includes('reset') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <a
                                href="/login"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                            >
                                ← Back to Login
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component with Suspense wrapper
const ResetPasswordPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
};

export default ResetPasswordPage;
