"use client";

import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiMessageCircle,
  FiChevronRight,
} from "react-icons/fi";
import { useState } from "react";
import EditProfile from "./EditProfile";
import MessageBox from "./MessageBox";
import RemoveConfirmation from "./RemoveConfirmation";
import ClassList from "./ClassList";
import { toast } from "react-toastify";


export default function TeachersProfile({ teacher, levels, setTeacher, setTeachers }: { teacher: any, levels?: any; setTeacher: (teacher: any) => void; setTeachers?: React.Dispatch<React.SetStateAction<any[]>>; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showRemovePopup, setShowRemovePopup] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ label: string; count: number } | null>(null);

  const handleSaveProfile = async (updatedUser: any) => {
    try {
      const res = await fetch(`/api/teachers/${teacher._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!res.ok) throw new Error("Failed to update student");

      const updatedData = await res.json();
      toast.success("Profile updated successfully!");

      setIsEditing(false);


      setTeacher(updatedData.data);
      if (setTeachers) {
        setTeachers((prev) =>
          prev.map((t) => (t._id === teacher._id ? updatedData.data : t))
        );
      }
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      const res = await fetch(`/api/teachers/${teacher._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete student");

      toast.success(`${teacher.name} removed successfully!`);
      setShowRemovePopup(false);
      setTeacher(null); // Clear profile view

      // Remove student from table
      if (setTeachers) {
        setTeachers((prev) => prev.filter((s) => s._id !== teacher._id));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to remove student");
    }
  };

  if (!teacher) return null;

  if (isEditing) return <EditProfile onBack={() => setIsEditing(false)} user={teacher} levels={levels} onSave={handleSaveProfile} />;
  if (isChatOpen) return <MessageBox onBack={() => setIsChatOpen(false)} user={teacher} />;
  if (selectedClass) {
    return (
      <ClassList
        className={selectedClass.label}
        levelName={selectedClass.count}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

 // console.log("Levels page :", JSON.stringify(teacher, null, 2));

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md w-full space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <img
            src={teacher.avatar || "/avatar5.png"}
            alt={teacher.name}
            className="w-20 h-20 rounded-full object-cover"
          />
          <div>
            <h2 className="text-lg font-bold text-gray-800">{teacher.name}</h2>
            <p className="text-sm text-gray-400">Teacher ID: {teacher.teacherId}</p>
          </div>
        </div>
        <FiMessageCircle
          className="text-gray-500 cursor-pointer"
          onClick={() => setIsChatOpen(true)}
        />
      </div>

      {/* Levels */}
      {teacher.levels?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {teacher.levels.map((level: string, idx: number) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs bg-[#EDF1FF] text-blue-800 rounded-full"
            >
              {level}
            </span>
          ))}
        </div>
      )}

      {/* Classes Overview */}
      <div className="grid grid-cols-2 gap-3">
        {(teacher.classes || []).map((cls: any, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedClass({ label: cls.name, count: cls.studentCount })}
            className="flex items-center justify-between bg-[#EDF1FF] text-sm px-4 py-2 rounded-full text-gray-800 font-medium w-full"
          >
            <span>
              {cls.name} - <span className="font-bold">{cls.studentCount}</span>
            </span>
            <FiChevronRight className="text-gray-500 text-base" />
          </button>
        ))}
      </div>


      {/* Personal Info */}
      <div className="bg-[#F6F8FF] p-4 rounded-xl space-y-2">
        <h4 className="text-sm font-semibold text-gray-800">Personal Details</h4>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiUser className="text-gray-500" />
          <span>{teacher.name}</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiMail className="text-gray-500" />
          <span>{teacher.email}</span>
        </div>
      </div>

      {/* Password */}
      {/*     <div className="bg-[#F6F8FF] p-4 rounded-xl">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">Password</h4>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl text-sm">
          <FiLock className="text-gray-500" />
          <span>************</span>
          <FiEye className="ml-auto text-gray-500" />
        </div>
      </div> */}

      {/* Footer Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowRemovePopup(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#F6F8FF] py-2 rounded-full text-sm text-black border border-gray-300"
        >
          🗑 Remove {teacher.name}
        </button>
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-[#F6F8FF] py-2 rounded-full text-sm text-black border border-gray-300"
        >
          ✏️ Edit Profile
        </button>
      </div>

      {/* Popup */}
      {showRemovePopup && (
        <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10 rounded-2xl">
          <RemoveConfirmation
            name={teacher.name}
            onCancel={() => setShowRemovePopup(false)}
            onConfirm={handleDeleteTeacher}
          />
        </div>
      )}
    </div>
  );
}