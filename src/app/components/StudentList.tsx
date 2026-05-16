"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Student {
  _id: string;
  name: string;
  class: string;
  image: string;
  studentId: string;
}

interface Class {
  _id: string;
  name: string;
}

interface StudentListProps {
  studentlist: Student[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  classes: Class[];
}

export default function StudentList({
  studentlist,
  searchQuery,
  onSearchChange,
  classes
}: StudentListProps) {
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  console.log(classes)
  const levels = ["All", ...new Set(classes.map(cls => cls.name))];
  const router = useRouter();
  useEffect(() => {
    if (!studentlist || studentlist.length === 0) {
      setFilteredStudents([]);
      return;
    }

    let filtered = studentlist;

    if (selectedLevel !== "All") {
      filtered = filtered.filter(student => student.class === selectedLevel);
    }

    if (searchQuery && searchQuery.trim() !== "") {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [studentlist, selectedLevel, searchQuery]);

  // Determine what type of "no data" message to show
  const getNoDataMessage = () => {
    if (!studentlist || studentlist.length === 0) {
      return {
        icon: "🎓",
        title: "No Students Found",
        description: "No students are enrolled in this school yet",
        suggestion: "Students will appear here once they are added to the system"
      };
    }

    if (searchQuery && searchQuery.trim() !== "") {
      return {
        icon: "🔍",
        title: "No Search Results",
        description: `No students found matching "${searchQuery}"`,
        suggestion: "Try a different search term or clear the search"
      };
    }

    if (selectedLevel !== "All") {
      return {
        icon: "📚",
        title: "No Students in This Class",
        description: `No students found in ${selectedLevel}`,
        suggestion: "Try selecting 'All' or a different class"
      };
    }

    return {
      icon: "❌",
      title: "No Data Available",
      description: "No students match the current filters",
      suggestion: "Try adjusting your filters"
    };
  };

  const noDataMessage = getNoDataMessage();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md h-full flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">
          Total Students
          {studentlist && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({studentlist.length})
            </span>
          )}
        </h3>

      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3 text-xs font-medium">
        {levels.map((level) => {

          const studentsInLevel = level === "All"
            ? studentlist?.length || 0
            : studentlist?.filter(s => s.class === level).length || 0;

          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-full border transition-colors ${selectedLevel === level
                ? "bg-black text-white"
                : studentsInLevel > 0
                  ? "bg-[#F9FAFF] text-gray-600 hover:bg-gray-100"
                  : "bg-gray-100 text-gray-400"
                }`}
            >
              {level}
              {studentsInLevel > 0 && (
                <span className="ml-1">({studentsInLevel})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="absolute right-3 top-2.5 text-gray-400 text-sm">🔍</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-8 top-2.5 text-gray-400 hover:text-gray-600 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Student List */}
      <div className="overflow-y-auto pr-1 space-y-3 flex-1">
        {filteredStudents && filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student._id}
              className="flex justify-between items-center bg-[#F4F6FF] px-4 py-2 rounded-full shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={student.image || "/avatar2.png"}
                  alt={student.name}
                  className="w-7 h-7 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/avatar2.png";
                  }}
                />
                <div>
                  <span className="text-sm font-medium">{student.name}</span>
                  <p className="text-xs text-gray-500">{student.class}</p>
                </div>
              </div>
              <button onClick={() => {
                router.push("/students")
                sessionStorage.setItem("studentid", student._id)
              }} className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700 transition">
                View Profile
              </button>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-3">{noDataMessage.icon}</div>
            <p className="text-lg font-medium text-gray-700 mb-2">{noDataMessage.title}</p>
            <p className="text-sm text-gray-500 mb-2">{noDataMessage.description}</p>
            <p className="text-xs text-gray-400">{noDataMessage.suggestion}</p>
          </div>
        )}
      </div>
      <button onClick={() => {
        router.push("/students")
      }} className="text-lg border m-5 border-blue-600 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-700 transition">
        View All
      </button>
    </div>
  );
}
