"use client";

import { useState } from "react";
import { FaBuilding, FaLock } from "react-icons/fa";
import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

import Image from "next/image";
import Logo from "../../app/assets/Practivoo_Logo.png"
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    if (!password) {
      alert("Password is required.");
      return;
    }

    if (password.length < 8 || password.length > 16) {
      alert("Password must be between 8 and 16 characters.");
      return;
    }

    // Prevent basic script injection patterns
    const dangerousPattern = /<script|javascript:|onerror=|onclick=/i;
    if (dangerousPattern.test(email) || dangerousPattern.test(password)) {
      alert("Invalid characters detected in input.");
      return;
    }

    try {
      const res = await fetch("/api/schools/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      router.push("/dashboard");

    } catch (err) {
      alert("Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen flex gap-10 flex-col items-center justify-center bg-[#0046D2] p-4 md:p-8">
      <div className="bg-white rounded-[60px] overflow-hidden flex flex-col md:flex-row w-full max-w-6xl shadow-xl">
        {/* Left Side */}
        <div className="md:w-1/2 flex justify-center items-center p-6">
          <div className="w-full h-full bg-[#0046D2] text-white flex flex-col items-center justify-center px-10 py-20 rounded-[60px] shadow-md">
            <Image src={Logo} alt="My asset" width={200} height={200} />
            <div className="text-2xl mt-1">Practivoo</div>
            <div className="text-sm text-center mt-10 leading-5">
              <p>Practice Today</p>
              <p>Progress Tomorrow</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="md:w-1/2 flex items-center justify-center px-6 md:px-10 py-16">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-1">
              Welcome to Practivoo
            </h1>
            <p className="text-center text-gray-600 text-sm mb-8">
              Please Enter Your Login Credentials
            </p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
                <FaBuilding className="text-gray-400 mr-2" />
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="w-full outline-none bg-transparent text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2">
                  <FaLock className="text-gray-400 mr-2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className="w-full outline-none bg-transparent text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400"
                  >
                    {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
                  </button>
                </div>
                <div className="text-right">
                  <a  href="/login/forget-password?role=school" className="text-xs text-red-500 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#7DA5F8] text-white py-2 rounded-full text-sm font-semibold hover:bg-blue-600"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
      <p className='text-blue-100'>
        © {new Date().getFullYear()} Practivoo. All rights reserved.
      </p>
    </div>
  );
}