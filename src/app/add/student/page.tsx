"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/app/components/DashboardLayout";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function AddStudentPage() {

  const [form, setForm] = useState({
    name: "",
    level: "",
    classId: "",
    gender: "",
    phone: "",
    email: "",
    password: "",
  });

  const router = useRouter()

  const [levels, setLevels] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [loading, setLoading] = useState(false);


  useEffect(() => {


    fetch(`/api/levels`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          console.log(res);
          router.replace('/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setLevels(data || []);
        console.log(data);
      })
      .catch((err) => {
        console.error("Error fetching levels:", err);
      });


    fetch(`/api/classes`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          console.log(res);

          router.replace('/login');
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        const uniqueClasses = data?.classes?.filter((cls: any, index: number, arr: any[]) =>
          arr.findIndex((c: any) => c.name === cls.name) === index
        );
        setClasses(data.classes || []);
        console.log(data.classes);
      })
      .catch((err) => {
        console.error("Error fetching classes:", err);
      });



    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students`, { credentials: "include" });
      if (!res.ok) {
        console.log(res);
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      console.log(data)


      setStudents(data['students'] || []);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(value);

    if (field === "classId") {
      try {
        const classObj = JSON.parse(value);
        setForm({
          ...form,
          classId: classObj._id,
          level: classObj.level,
        });
      } catch (error) {
        console.error("Error parsing class object:", error);
      }
    } else {
      setForm({ ...form, [field]: value });
    }
  };

  const handleSubmit = async () => {
    const { name, level, gender, email, password, classId } = form;

    if (!name || !email || !password || !gender || !level || !classId) {
      alert("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Error adding student");
      } else {
        alert("Student added successfully");
        setForm({
          name: "",
          level: "",
          classId: "",
          gender: "",
          phone: "",
          email: "",
          password: "",
        });
        fetchStudents();
      }
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents =
    selectedFilter === "All"
      ? students
      : students.filter((s) => s.level === selectedFilter);


  const levelSpecificClasses = form.level
    ? classes.filter((cls) => cls.name === form.level)
    : [];
  console.log(levelSpecificClasses)
  return (
    <DashboardLayout>
      <div className="flex p-6 gap-6">
        {/* Left Form */}
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 mb-6">Add Student</h1>

          {/* Name + Level */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
            {/*  <select
              value={form.level}
              onChange={(e) => handleChange("level", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-40"
            >
              <option disabled value="">Level</option>
              {levels.map((lvl) => (
                <option key={lvl.defaultName} value={lvl.defaultName}>
                  {lvl.defaultName}
                </option>
              ))}
            </select> */}
          </div>

          {/* Class + Gender */}
          <div className="flex gap-4 mb-4">
            <select
              value={form.classId}
              onChange={(e) => {
                const selectedClass = classes.find(cls => cls._id === e.target.value);
                if (selectedClass) {
                  handleChange("classId", JSON.stringify(selectedClass));
                }
              }}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">Class</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name} - {cls.level}
                </option>
              ))}
            </select>



            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className="px-4 py-2 border rounded-md text-sm w-full"
            >
              <option disabled value="">Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer Not to say</option>
            </select>
          </div>

          {/* Phone */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Phone number (Optional)"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full px-4 py-2 border rounded-md text-sm"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-[#0046D2] text-white rounded-md text-sm"
          >
            {loading ? "Submitting..." : "Add student"}
          </button>
        </div>

        {/* Right Panel */}
        <div className="w-[320px] bg-white rounded-xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">New Students</h2>

          {/* Filter Tags */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter("All")}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedFilter === "All"
                ? "bg-black text-white"
                : "bg-white text-gray-700 border-gray-300"
                }`}
            >
              All
            </button>
            {Array.isArray(levels) && levels.map((lvl) => (
              <button
                key={lvl._id}
                onClick={() => setSelectedFilter(lvl.customName)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedFilter === lvl.customName
                  ? "bg-black text-white"
                  : "bg-white text-gray-700 border-gray-300"
                  }`}
              >
                {lvl.customName}
              </button>
            ))}
          </div>

          {/* Student List */}
          <div className="space-y-2 pt-2">
            {Array.isArray(filteredStudents) &&
              filteredStudents.map((student) => (
                <div
                  key={student._id}
                  onClick={() => {
                    router.push("/students")
                    console.log(student.name)
                    sessionStorage.setItem("studentid", student._id)
                  }}
                  className="w-full cursor-pointer flex items-center justify-between px-4 py-2 border border-black rounded-full text-sm font-medium text-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-pink-300" />
                    {student.name}
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