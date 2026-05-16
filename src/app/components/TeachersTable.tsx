"use client";

import { useState } from "react";
import { GiConsoleController } from "react-icons/gi";

interface Teacher {
  name: string;
  teacherId: string;
  email: string;
  gender: string;
  avatar?: string;
  levels: any[];
}

interface Level {
  _id: string;
  defaultName: string;
}

export default function TeachersTable({
  teachers,
  levels,
  onSelectTeacher,
}: {
  teachers: Teacher[];
  levels: Level[];
  onSelectTeacher: (teacher: Teacher) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = teachers?.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      selectedLevel === "All" || teacher.levels?.includes(selectedLevel);

    return matchesSearch && matchesLevel;
  });

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow mb-4">
        <input
          type="text"
          placeholder="Search by teacher name or email"
          className="w-full px-4 py-2 rounded-md border text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

    {/*     <div className="flex flex-wrap gap-2 mt-3 text-sm">
          <button
            onClick={() => setSelectedLevel("All")}
            className={`px-3 py-1 rounded-full border ${selectedLevel === "All" ? "bg-black text-white" : "bg-gray-100 text-gray-700"
              }`}
          >
            All
          </button>
          {levels.map((level) => (
            <button
              key={level._id}
              onClick={() => setSelectedLevel(level.defaultName)}
              className={`px-3 py-1 rounded-full border ${selectedLevel === level.defaultName
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
                }`}
            >
              {level.defaultName}
            </button>
          ))}
        </div> */}
      </div>

      <div className="bg-white rounded-xl shadow overflow-y-auto max-h-[450px]">
        <table className="w-full text-sm">
          <thead className="bg-[#F4F6FF] text-left font-semibold">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Teacher ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Gender</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((teacher, index) => (
              <tr
                key={index}
                className="odd:bg-[#F9FAFF] cursor-pointer"
                onClick={() => onSelectTeacher(teacher)}
              >
                <td className="p-3 flex items-center gap-2">
                  <img
                    src={teacher.avatar || "/user.png"}
                    alt={teacher.name}
                    className="w-6 h-6 rounded-full"
                  />
                  {teacher.name}
                </td>
                <td className="p-3">{teacher.teacherId}</td>
                <td className="p-3">{teacher.email}</td>
                <td className="p-3">{teacher.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}