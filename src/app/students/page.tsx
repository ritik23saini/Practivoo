"use client";

import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import StudentProfile from "../components/StudentProfile";
import StudentTable from "../components/StudentTable";
import { useEffect, useState } from "react";


export default function StudentsPage() {
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [levels, setLevels] = useState([]);

  const router = useRouter();
  useEffect(() => {
    fetchStudents();
    fetchLevels();
  }, []);


  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/students`, { credentials: "include" });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      const studentsList = data.students || [];
      setStudents(studentsList);
      getsessionStudentName(studentsList);
      console.log(data.students)
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchLevels = async () => {
    try {

      const res = await fetch(`/api/levels`, { credentials: "include" });
      if (!res.ok) {
        router.push('/login');
        return;
      }
      const data = await res.json();
      setLevels(data || []);
    } catch (err) {
      console.error("Error fetching levels:", err);
    }
  };

  const getsessionStudentName = (studentsList: any[]) => {
    const studentId = sessionStorage.getItem("studentid");
    if (studentId) {
      const foundstudent = studentsList.find((t) => t._id === studentId);
      if (foundstudent) {
        setSelectedStudent(foundstudent);
      }
    }
  };
  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8">
          <StudentTable onSelectStudent={setSelectedStudent} levels={levels} students={students} setStudents={setStudents} />
        </div>
        <div className="lg:col-span-4">
          {selectedStudent ? (
            <StudentProfile
              student={selectedStudent}
              setStudent={setSelectedStudent}
              levels={levels}
              setStudents={setStudents} />
          ) : (
            <div className="text-center text-gray-500 p-6 bg-white rounded-xl shadow">
              Select a student to view profile
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}