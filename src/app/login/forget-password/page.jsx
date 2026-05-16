"use client";

import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import forgetPasswordImage from '../../../app/assets/Forget_Password.png';
import Logo from "../../../app/assets/Practivoo_Logo.png";

const ForgotPasswordPage = () => {
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Read role from URL query string on client side via useEffect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setRole(urlParams.get('role') || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');


   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Length validations
    if (email.length > 50) {
      alert("Email must not exceed 50 characters.");
      return;
    }


    try {
      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, usertype: role }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setMessage(data.message);
        setTimeout(() => {
          router.replace(`/login/verify-password?email=${email}&role=${role}`);
        }, 1500);
      } else {
        setMessage('Error sending verification code. Please try again.');
      }
    } catch (error) {
      console.error(error);
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
                <Image src={Logo} alt="Logo" width={200} height={200} />
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
                Forgot Your Password?
              </h2>

              {/* Illustration */}
              <div className="mb-6 flex justify-center">
                <Image
                  src={forgetPasswordImage}
                  alt="Forget Password"
                  width={200}
                  height={200}
                />
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                Please enter your registered email address to<br />
                receive a Verification Code
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="Alex123@gmail.com"
                  />
                </div>
              </div>

              {message && (
                <div
                  className={`text-sm text-center p-3 rounded-lg ${message.includes('sent')
                    ? 'text-green-600 bg-green-50'
                    : 'text-red-600 bg-red-50'
                    }`}
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send'}
              </button>
            </form>

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

export default ForgotPasswordPage;
