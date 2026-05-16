"use client"
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import WeeklyTasks from "../components/WeeklyTasks";
import StudentList from "../components/StudentList";
import { FiUsers, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type DashboardData = {
  studentCount: number;
  teacherCount: number;
  tasks: any[];
  students: any[];
  classes: any[];
  termTaskCounts: Record<number, number>;
  weekTaskCounts: Record<number, number>;
  hasData: boolean;
};

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelsList, setLevelsList] = useState<{ _id: string, code: string, customName: string }[]>([]);
  const [isRead, setisRead] = useState(false);
  const router = useRouter();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/schools/dashboard?level=${encodeURIComponent(selectedLevel)}&term=${selectedTerm}&week=${selectedWeek}`,
        { credentials: "include" } // ✅ Send cookies
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
         console.log(`Error: ${response.status} ${response.statusText}`);
          router.push('/login');
          
        }
      }

      const res = await response.json();
      setDashboardData(res);

      console.log("dashres:", res);
      // Fetch levels list
      const levelData = await fetch(`/api/levels`, { credentials: "include" });
      const levelsRes = await levelData.json();

      console.log("levelsRes:", levelsRes);
      setLevelsList(levelsRes);
    } catch (error) {
      console.error("Error fetching school dashboard:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, [selectedTerm, selectedWeek, selectedLevel]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Left Section: 8 Columns */}
        <div className="lg:col-span-8 space-y-6">
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard
              member="students"
              title="Total Students"
              count={dashboardData?.studentCount || 0}
              icon={<FiUsers />}
            />
            <StatCard
              member="teachers"
              title="Total Teachers"
              count={dashboardData?.teacherCount || 0}
              icon={<FiUser />}
            />
          </div>

          {/* Weekly Tasks with filters */}
          <WeeklyTasks
            setSelectedLevel={setSelectedLevel}
            selectedLevel={selectedLevel}
            levelsList={levelsList}
            tasklist={dashboardData?.tasks || []}
            selectedTerm={selectedTerm}
            onTermChange={setSelectedTerm}
            selectedWeek={selectedWeek}
            onWeekChange={setSelectedWeek}
            termTaskCounts={dashboardData?.termTaskCounts || {}}
            weekTaskCounts={dashboardData?.weekTaskCounts || {}}
            hasData={dashboardData?.hasData || false}
          />
        </div>

        {/* Right Section: Student List */}
        <div className="lg:col-span-4">
          <StudentList
            studentlist={dashboardData?.students || []}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            classes={dashboardData?.classes || []}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
