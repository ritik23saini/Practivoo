"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import TeachersProfile from "../components/TeachersProfile";
import TeachersTable from "../components/TeachersTable";
import { useRouter } from "next/navigation";


export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [levels, setLevels] = useState([]);

  const router = useRouter();
  useEffect(() => {

    fetchTeachers();
    fetchLevels();
  }, []);

  const fetchTeachers = async () => {

    const res = await fetch(`/api/teachers`, { credentials: "include" });
    if (!res.ok) {
      router.push('/login');
      return;
    }
    const data = await res.json();
    const teachersList = data.teachers || [];
    setTeachers(teachersList);

    //  Pick the correct teacher if sessionStorage has one
    getsessionTeacherName(teachersList);
  };

  const fetchLevels = async () => {
    const res = await fetch(`/api/levels/override`, { credentials: "include" });
    const data = await res.json();
    setLevels(data?.levels || []);
  };

  const getsessionTeacherName = (teachersList: any[]) => {
    const teacherId = sessionStorage.getItem("teacherid");
    if (teacherId) {
      const foundTeacher = teachersList.find((t) => t._id === teacherId);
      if (foundTeacher) {
        setSelectedTeacher(foundTeacher);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <div className="lg:col-span-8">
          <TeachersTable
            teachers={teachers}
            levels={levels}
            onSelectTeacher={setSelectedTeacher}
          />
        </div>

        <div className="lg:col-span-4">
          {selectedTeacher ? (
            <TeachersProfile
              teacher={selectedTeacher}
              setTeacher={setSelectedTeacher}
              levels={levels}
              setTeachers={setTeachers}
            />
          ) : (
            <div className="text-center text-gray-500 p-6 bg-white rounded-xl shadow">
              Select a teacher to view profile
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}