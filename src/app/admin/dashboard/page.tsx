"use client";

import { useEffect, useMemo, useState } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { useRouter } from "next/navigation";
import IssuesPanel from "./IssuesPanel";

type Question = {
  _id: string;
  heading?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  media?: { image?: string; audio?: string };
  type?: "single" | "multi";
};

type Task = {
  _id: string;
  topic: string;
  level: string;
  category: string;
  status: "Assigned" | "Drafts";
  questions: Question[] | string[];
  term: number;
  week: number;
  createdAt: string;
  title?: string;
  type?: string;
  questionCount?: number;
};

type Level = {
  _id: string;
  code: string;
  defaultName: string;
};

type Issue = {
  _id: string;
  user: string;
  studentId?: string;
  school: string;
  type: string;
  message: string;
  topic?: string;
  status: "pending" | "resolved";
  createdAt: string;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalSchools: 0, totalIssues: 0, pendingIssues: 0, resolvedIssues: 0 });
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [schools, setSchools] = useState<any[]>([]);
  const [activePanel, setActivePanel] = useState<"schools" | "issues">("schools");
  const [loading, setLoading] = useState(true);
  const [levels, setLevels] = useState<Level[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const router = useRouter();

  // ✅ Calculate issue counts from issues array using useMemo
  const pendingCount = useMemo(() => issues.filter(i => i.status === "pending").length, [issues]);
  const resolvedCount = useMemo(() => issues.filter(i => i.status === "resolved").length, [issues]);
  const totalIssuesCount = useMemo(() => issues.length, [issues]);

  // Fetch data (dashboard, levels, issues)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [dashboardRes, levelsRes, issuesRes] = await Promise.all([
          fetch("/api/admin/dashboard", { cache: "no-store", credentials: "include" }),
          fetch("/api/admin/levels", { cache: "no-store", credentials: "include" }),
          fetch("/api/issues", { cache: "no-store" }),
        ]);
        if (!dashboardRes.ok || !levelsRes.ok || !issuesRes.ok) {
          router.replace('/admin/login');
          return;
        }
        const dashboardData = await dashboardRes.json();
        const levelsData = await levelsRes.json();
        const issuesData = await issuesRes.json();

        console.log("Dashboard data:", dashboardData);
        console.log("Issues data:", issuesData);

        // ✅ Handle different response formats from /api/issues
        let issuesArray: Issue[] = [];
        if (issuesData?.success && issuesData?.notifications) {
          issuesArray = issuesData.notifications;
        } else if (issuesData?.data) {
          issuesArray = issuesData.data;
        }

        const enrichedTasks: Task[] = (dashboardData.recentTasks || []).map((task: Task) => ({
          ...task,
          questionCount: Array.isArray(task.questions) ? task.questions.length : 0,
          title: `${task.topic} (${Array.isArray(task.questions) ? task.questions.length : 0} Ques.)`,
          type: task.status || "Drafts",
        }));

        // ✅ Calculate issue counts from fetched data
        const pending = issuesArray.filter(i => i.status === "pending").length;
        const resolved = issuesArray.filter(i => i.status === "resolved").length;

        setStats({
          totalSchools: dashboardData?.stats?.totalSchools || 0,
          totalIssues: issuesArray.length,
          pendingIssues: pending,
          resolvedIssues: resolved,
        });

        setAllTasks(enrichedTasks);
        setFilteredTasks(enrichedTasks);
        setSchools(dashboardData.schools || []);
        setLevels(levelsData.levels || []);
        setIssues(issuesArray);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Update stats whenever issues array changes
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      totalIssues: totalIssuesCount,
      pendingIssues: pendingCount,
      resolvedIssues: resolvedCount,
    }));
  }, [totalIssuesCount, pendingCount, resolvedCount]);

  // Level filter for tasks
  useEffect(() => {
    if (selectedLevel === "All") {
      setFilteredTasks(allTasks);
    } else {
      setFilteredTasks(allTasks.filter((task) => task.level === selectedLevel));
    }
  }, [selectedLevel, allTasks]);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Main Content */}
      <div className="flex-1">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div
            onClick={() => {
              router.push("/admin/schools");
            }}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Total Schools</p>
                <p className="text-3xl font-bold text-[#0046D2]">{stats.totalSchools}</p>
              </div>
              <button className="bg-[#0046D2] text-white w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>

          <div
            onClick={() => setActivePanel("issues")}
            className="bg-white rounded-2xl p-6 shadow text-[#2D3E50] cursor-pointer hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Issues & Feedbacks</p>
                {/* ✅ Show total issues count */}
                <p className="text-3xl font-bold text-[#0046D2]">
                  {stats.totalIssues}
                </p>
                {/* ✅ Show breakdown of pending and resolved */}
                <p className="text-xs text-gray-500 mt-1">
                  {stats.pendingIssues} pending • {stats.resolvedIssues} resolved
                </p>
              </div>
              <button className="bg-white border border-[#0046D2] text-[#0046D2] w-9 h-9 rounded-full flex items-center justify-center">
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="bg-white p-6 rounded-2xl shadow mb-6 max-h-svh overflow-auto">
          <h3 className="text-[#2D3E50] font-semibold text-lg mb-4">Tasks Assigned</h3>

          {/* Level Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`rounded-full border px-3 py-1 text-sm transition ${selectedLevel === "All" ? "bg-blue-200 border-blue-400" : "hover:bg-gray-50"
                }`}
              onClick={() => setSelectedLevel("All")}
            >
              All
            </button>
            {levels.map((level) => (
              <button
                key={level._id}
                className={`rounded-full border px-3 py-1 text-sm transition ${selectedLevel === level.defaultName ? "bg-blue-200 border-blue-400" : "hover:bg-gray-50"
                  }`}
                onClick={() => setSelectedLevel(level.defaultName)}
              >
                {level.defaultName}
              </button>
            ))}
          </div>

          {/* Task List */}
          {loading ? (
            <p className="text-sm text-gray-500">Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm text-gray-500">No tasks found</p>
          ) : (
            filteredTasks.map((task, i) => (
              <div
                key={i}
                className="flex justify-between items-center border border-[#0046D2] rounded-full px-5 py-3 mb-3 hover:shadow-sm"
              >
                <div>
                  <p className="font-bold text-sm text-[#2D3E50]">{task.title}</p>
                  <p className="text-xs text-[#999]">Type - {task.type}</p>
                </div>
                <button
                  onClick={() => {
                    sessionStorage.setItem("taskId", task._id);
                    router.push("/admin/tasks");
                  }}
                  className="text-[#0046D2] border border-[#0046D2] px-4 py-1.5 text-sm rounded-full hover:bg-[#0046D2] hover:text-white transition"
                >
                  View
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[420px] bg-transparent md:bg-transparent p-0 md:p-0">
        {activePanel === "schools" ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#2D3E50] flex items-center gap-2">
                <span role="img" aria-label="school">
                  🏫
                </span>{" "}
                Schools
              </h3>
            </div>
            {loading ? (
              <p className="text-sm text-gray-500">Loading schools...</p>
            ) : schools.length === 0 ? (
              <p className="text-sm text-gray-500">No schools found</p>
            ) : (
              schools.slice(0, 7).map((school: any, i) => (
                <div
                  onClick={() => {
                    router.push(`/admin/schools`);
                    console.log(school);
                    sessionStorage.setItem("school", school.name);
                  }}
                  key={i}
                  className="flex justify-between items-center border border-[#D9D9D9] rounded-full px-4 py-3 mb-3 hover:shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={school.image ? school.image : `/user.png`}
                      alt="profilepic"
                      className="w-8 h-8 bg-gray-300 rounded-full"
                    />
                    <span className="text-sm font-medium text-[#2D3E50]">{school.name}</span>
                  </div>
                  <button className="text-[#0046D2] text-xl">→</button>
                </div>
              ))
            )}
            <button
              onClick={() => {
                router.push(`/admin/schools`);
              }}
              className="w-full border-1 rounded-full flex justify-center py-2 hover:bg-blue-400 text-black font-bold text-md"
            >
              View All
            </button>
          </>
        ) : (
          <IssuesPanel />
        )}
      </div>
    </div>
  );
}