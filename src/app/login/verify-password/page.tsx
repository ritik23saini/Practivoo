"use client";

import React, { useState, Suspense } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import verifyimage from '../../../app/assets/verify-image.png';
import Logo from "../../../app/assets/Practivoo_Logo.png"
import { toast } from 'react-toastify';

// Separate component that uses useSearchParams
const VerifyPasswordForm = () => {
    const searchParams = useSearchParams();
    const role = searchParams ? searchParams.get('role') || "" : "";
    const email = searchParams ? searchParams.get('email') || "" : "";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [Otp, setOtp] = useState('');

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        setMessage('');

        try {
            let otp = Number(Otp);
            const response = await fetch('/api/auth/verify-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, usertype: role && role.toString() }),
            });
            const data = await response.json();

            if (response.ok) {
                toast.success(data.message)
                setMessage(data.message);
                setTimeout(() => {
                    router.replace(`/login/reset-password?email=${email}&role=${role}`);
                }, 1500)
            } else {
                setMessage(data.message || 'Error sending verification code. Please try again.');
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
                        {/* Logo */}
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                                <Image src={Logo} alt="My asset" width={200} height={200} />
                            </div>
                            <h1 className="text-3xl font-bold tracking-wide">Practivoo</h1>
                        </div>

                        {/* Tagline */}
                        <div className="space-y-2">
                            <p className="text-lg font-medium">Practice Today</p>
                            <p className="text-lg font-medium">Progress Tomorrow</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="p-12 w-3/5 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-blue-600 mb-6">
                                Verify Your Email
                            </h2>

                            {/* Illustration */}
                            <div className="mb-6 flex justify-center">
                                <Image
                                    src={verifyimage}
                                    alt="Verify Email"
                                    width={200}
                                    height={200}
                                />
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">
                                {email ? `Please enter the 4-digit code sent to ${email}` : 'Please enter the 4-digit verification code'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <div className="flex justify-center">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        pattern="[0-9]{4}"
                                        required
                                        value={Otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-32 text-center p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500 text-xl tracking-widest"
                                        placeholder="0000"
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className={`text-sm text-center p-3 rounded-lg ${message.includes('success') || message.includes('verified')
                                    ? 'text-green-600 bg-green-50'
                                    : 'text-red-600 bg-red-50'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || Otp.length !== 4}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Verifying...' : 'Verify'}
                            </button>
                        </form>

                        {/* Resend Code */}
                        <div className="mt-4 text-center">
                            <button
                                type="button"
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                                onClick={() => {
                                    // Add resend functionality here
                                    console.log('Resend code for:', email);
                                }}
                            >
                                Didn't receive code? Resend
                            </button>
                        </div>

                        {/* Back to Login */}
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
const VerifyPasswordPage = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <div className="text-blue-600 text-lg font-medium">Loading verification page...</div>
                </div>
            </div>
        }>
            <VerifyPasswordForm />
        </Suspense>
    );
};

export default VerifyPasswordPage;