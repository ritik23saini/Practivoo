"use client";

import { FiSearch, FiChevronLeft } from "react-icons/fi";
import Image from "next/image";

export default function ClassList({
  className,
  levelName,
  onBack,
}: {
  className: string;
  levelName:number;
  onBack: () => void;
}) {
  const students = [
    { name: "Joy", avatar: "/avatar1.png" },
    { name: "Gabby", avatar: "/avatar2.png" },
    { name: "Billy", avatar: "/avatar3.png" },
    { name: "Neena", avatar: "/avatar4.png" },
    { name: "Juliana", avatar: "/avatar5.png" },
    { name: "Juliana", avatar: "/avatar5.png" },
    { name: "Juliana", avatar: "/avatar5.png" },
    { name: "Juliana", avatar: "/avatar5.png" },
    { name: "Juliana", avatar: "/avatar5.png" },
  ];

  return (
    <div className="bg-white w-full p-6 rounded-2xl space-y-6 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="text-lg text-gray-800 hover:text-black"
          >
            <FiChevronLeft />
          </button>
          <h2 className="text-lg font-bold text-gray-800">{className}</h2>
          <span className="text-xs font-medium border border-gray-400 px-2 py-[2px] rounded-full">
            Level {levelName}
          </span>
        </div>
      </div>

      {/* Search Box */}
      <div className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl text-sm text-gray-700">
        <FiSearch />
        <input
          type="text"
          placeholder="Search by name"
          className="flex-1 outline-none bg-transparent"
        />
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {students.map((student, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-[#EDF1FF] px-4 py-2 rounded-full"
          >
            <div className="flex items-center gap-3">
              <Image
                src={student.avatar}
                alt={student.name}
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
              <span className="text-sm font-medium text-gray-800">
                {student.name}
              </span>
            </div>
            <button className="text-xs bg-white border border-blue-500 text-blue-600 px-3 py-1 rounded-full font-medium hover:bg-blue-50">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}