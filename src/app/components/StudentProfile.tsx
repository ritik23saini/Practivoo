"use client";

import {
  FiUser,
  FiMail,
  FiMessageCircle,
  FiBarChart2,
  FiSettings,
} from "react-icons/fi";
import { BsGraphUpArrow } from "react-icons/bs";
import { useEffect, useState } from "react";
import EditProfile from "./EditProfile";
import DonutProgress from "./DonutProgress";
import MessageBox from "./MessageBox";
import RemoveConfirmation from "./RemoveConfirmation";
import { toast } from "react-toastify";

interface WeeklyReport {
  totalTasks?: number;
  pending?: number;
  completed?: number;
  maxScore?: number;
  minScore?: number;
  scores?: number[];
}

interface WeeklyTaskData {
  weeklyReport?: WeeklyReport;
}

export default function StudentProfile({
  student,
  levels,
  setStudent,
  setStudents,
}: {
  student: any;
  levels?: any;
  setStudent: (student: any) => void;
  setStudents?: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [term, setTerm] = useState(1);
  const [week, setWeek] = useState(1);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [weeklyTask, setweeklyTask] = useState<WeeklyTaskData | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  const total = weeklyTask?.weeklyReport?.totalTasks || 0;
  const pending = weeklyTask?.weeklyReport?.pending || 0;
  const percentage = total > 0 ? ((total - pending) / total) * 100 : 0;


  const points = weeklyTask?.weeklyReport?.scores?.reduce((acc, sum) => acc + sum, 0) || 0;

  const fetchWeeklyReport = async (term: number, week: number) => {
    try {
      const res = await fetch(
        `/api/students/${student._id}?term=${term}&week=${week}`
      );
      if (!res.ok) throw new Error("Failed to fetch report");
      const data = await res.json();
      setweeklyTask(data || null);
      console.log("Weekly Report Data:", data);
    } catch (error) {
      console.error("Error fetching weekly report:", error);
      toast.error("Failed to load weekly report");
    }
  };

  useEffect(() => {
    if (student) {
      fetchWeeklyReport(term, week);
    }
  }, [student, term, week]);

  const handleSaveProfile = async (updatedUser: any) => {
    try {
      const res = await fetch(`/api/students/${student._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      const updatedData = await res.json();
      console.log(updatedData);

      if (!res.ok) {
        return toast.error(updatedData.error);
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);

      setStudent(updatedData.data);
      if (setStudents) {
        setStudents((prev) =>
          prev.map((s) => (s._id === student._id ? updatedData.data : s))
        );
      }
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteStudent = async () => {
    try {
      const res = await fetch(`/api/students/${student._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete student");

      toast.success(`${student.name} removed successfully!`);
      setShowRemovePopup(false);
      setStudent(null);

      if (setStudents) {
        setStudents((prev) => prev.filter((s) => s._id !== student._id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to remove student");
    }
  };

  if (!student) return null;

  if (isEditing) {
    return (
      <EditProfile
        onBack={() => setIsEditing(false)}
        user={student}//
        levels={levels}
        onSave={handleSaveProfile}
      />
    );
  }

  if (isChatOpen) {
    return <MessageBox onBack={() => setIsChatOpen(false)} user={student} />;
  }

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img
            src={student.image || "/avatar5.png"}
            alt={student.name}
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">{student.name}</h2>
            <p className="text-sm text-gray-400">Student ID: {student.studentId}</p>
          </div>
        </div>
        <FiMessageCircle
          className="text-gray-500 cursor-pointer"
          onClick={() => setIsChatOpen(true)}
        />
      </div>

      {/* Points + Level */}
      <div className="flex gap-4">
        <div className="flex-1 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <div className="bg-[#F1F3FB] p-2 rounded-full">
            <FiBarChart2 className="text-blue-600 text-lg" />
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Points</p>
            <p className="text-sm font-bold">{points || 0}</p>
          </div>
        </div>
        <div className="flex-1 border border-gray-200 rounded-xl p-3 flex items-center gap-2">
          <div className="bg-[#F1F3FB] p-2 rounded-full">
            <BsGraphUpArrow className="text-purple-600 text-lg" />
          </div>
          <div className="text-sm">
            <p className="text-gray-500">Level</p>
            <p className="text-sm font-bold">{student.level}</p>
          </div>
        </div>
      </div>

      {/* Weekly Report */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-sm">{student.name}'s Weekly Report</h3>
          <div className="px-3 py-1 flex items-center border rounded-full gap-2 text-xs text-gray-500">
            <button className="cursor-default">
              Week {week}, Term {term}
            </button>
            <FiSettings
              size={20}
              className="cursor-pointer"
              onClick={() => setShowFilter((v) => !v)}
              title="Filter Term and Week"
            />
          </div>
        </div>

        {/* Filter Modal */}
        {showFilter && (
          <div className="absolute top-16 right-6 bg-white border rounded-xl p-4 shadow-lg z-20 w-48">
            <div className="mb-2">
              <label className="block text-xs mb-1 font-semibold">Select Term</label>
              <select
                className="w-full border rounded p-1 text-xs"
                value={term}
                onChange={(e) => setTerm(Number(e.target.value))}
              >
                {[1, 2, 3, 4].map((t) => (
                  <option key={t} value={t}>
                    Term {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs mb-1 font-semibold">Select Week</label>
              <select
                className="w-full border rounded p-1 text-xs"
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Week {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowFilter(false)}
              className="w-full bg-blue-600 text-white text-xs py-1 rounded hover:bg-blue-700 transition"
            >
              Apply
            </button>
          </div>
        )}

        <div className="flex gap-4 items-center">
          <div className="relative w-20 h-20">
            <DonutProgress percentage={percentage} />
            <div className="absolute inset-0 flex flex-col justify-center items-center text-xs text-blue-600 font-bold leading-tight">
              <span>Total Tasks</span>
              <span className="text-lg">{weeklyTask?.weeklyReport?.totalTasks ?? 0}</span>
            </div>
          </div>

          <div className="text-xs text-gray-800 space-y-1">
            <p>
              <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
              Pending <b>{weeklyTask?.weeklyReport?.pending ?? 0}</b>
            </p>
            <p>
              <span className="inline-block w-2 h-2 bg-black rounded-full mr-2"></span>
              Completed <b>{weeklyTask?.weeklyReport?.completed ?? 0}</b>
            </p>
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium text-gray-700">
          <span>
            Max Score <b>{weeklyTask?.weeklyReport?.maxScore ?? 0}</b>
          </span>
          <span>
            Min Score <b>{weeklyTask?.weeklyReport?.minScore ?? 0}</b>
          </span>
        </div>
      </div>

      {/* Personal Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Personal Details</h4>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm mb-2">
          <FiUser className="text-gray-500" />
          <span>{student.name}</span>
        </div>
        <div className="flex items-center gap-2 bg-[#F9FAFF] px-4 py-2 rounded-xl text-sm">
          <FiMail className="text-gray-500" />
          <span>{student.email}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-full text-sm hover:bg-gray-100 transition"
          onClick={() => setShowRemovePopup(true)}
        >
          🗑 Remove {student.name}
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 bg-[#0046D2] text-white py-2 rounded-full text-sm hover:bg-blue-700 transition"
          onClick={() => setIsEditing(true)}
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Popup - Remove Confirmation */}
      {showRemovePopup && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded-2xl">
          <RemoveConfirmation
            name={student.name}
            onCancel={() => setShowRemovePopup(false)}
            onConfirm={handleDeleteStudent}
          />
        </div>
      )}
    </div>
  );
}