"use client";

import { useEffect, useState } from "react";


interface StudentTableProps {
  onSelectStudent: (student: any) => void;
  levels: any[];
  students: any[];
  setStudents: (students: any[]) => void;
}

export default function StudentTable({
  onSelectStudent,
  levels,
  students,
  setStudents,
}: StudentTableProps) {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");


  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel = selectedLevel === "All" || s.level === selectedLevel;

    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      {/* Search + Filters */}
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <input
          type="text"
          placeholder="Search by student name or email"
          className="w-full px-4 py-2 rounded-md border text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          <button
            onClick={() => setSelectedLevel("All")}
            className={`px-3 py-1 rounded-full border ${selectedLevel === "All"
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-700"
              }`}
          >
            All
          </button>
          {levels.map((level: any) => (
            <button
              key={level._id}
              onClick={() => setSelectedLevel(level.customName)}
              className={`px-3 py-1 rounded-full border ${selectedLevel === level.customName
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {level.customName}
            </button>
          ))}
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl shadow overflow-y-auto max-h-[450px]">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FF] text-left font-semibold">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Student ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Gender</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student, index) => (
              <tr
                key={index}
                className="odd:bg-[#F9FAFF] cursor-pointer"
                onClick={() => onSelectStudent(student)}
              >
                <td className="p-3 flex items-center gap-2">
                  <img
                    src={student.avatar || "/user.png"}
                    alt={student.name}
                    className="w-6 h-6 rounded-full"
                  />
                  {student.name}
                </td>
                <td className="p-3">{student.studentId}</td>
                <td className="p-3">{student.email}</td>
                <td className="p-3">{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
