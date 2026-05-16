"use client";

import { useState } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FiChevronRight } from "react-icons/fi";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const genders = ["Male", "Female", "Other", "Prefer Not to Say"];
const newTeachers = [
  "Elena Muller",
  "Luca Moretti",
  "Sofia Lindstrom",
  "Pierre Dubois",
];


export default function AddTeacherPage() {
  const [form, setForm] = useState({
    name: "",
    yoe: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
  });

  const router = useRouter()
  type Teacher = {
    _id: string;
    name: string;
    teacherId: string;
    email: string;
    gender: string;
    avatar?: string;
    levels: string[];
  }
  const [newTeachers, setNewTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);



  useEffect(() => {

    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch(`/api/teachers`, { credentials: "include" });
      const data = await res.json();

      if (res.ok && Array.isArray(data.teachers)) {
        setNewTeachers(data.teachers);
        console.log(data.teachers)
      } else {
        console.log("Failed to load teachers");
        router.replace('/login');
        return;
      }
    } catch (err) {
      console.error("Error fetching teachers:", err);
    }
  };


  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password || !form.gender || !form.yoe) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/teachers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to add teacher.");
      } else {
        alert("Teacher added successfully!");
        setForm({
          name: "",
          yoe: "",
          gender: "",
          phone: "",
          email: "",
          password: "",
        });

        fetchTeachers();
      }
    } catch (err) {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Form Section */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Teacher</h1>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <select
              value={form.yoe}
              onChange={(e) => handleChange("yoe", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">
                YOE
              </option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} years
                </option>
              ))}
            </select>

            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">
                Gender
              </option>
              {genders.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Phone number (Optional)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="mb-4">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm"
          >
            {loading ? "Submitting..." : "Add Teacher"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">New Teachers</h2>

          <div className="space-y-2 pt-2">
            {newTeachers.map((teacher) => (
              <div
                key={teacher._id}
                className="w-full cursor-pointer  flex items-center justify-between px-4 py-2 border border-black rounded-full text-sm font-medium text-gray-800"
                onClick={() => {
                  router.push("/teachers")
                  console.log(teacher.name)
                  sessionStorage.setItem("teacherid", teacher._id)
                }}>
                <div className="flex items-center gap-2">
                  <div className=" w-6 h-6 rounded-full bg-pink-300" />
                  {teacher.name}
                </div>
                <FiChevronRight />
              </div>
            ))}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}