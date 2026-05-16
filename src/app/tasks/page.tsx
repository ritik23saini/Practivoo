"use client";

import { useEffect, useState } from "react";
import TermTabs from "../components/TermTabs";
import WeekSelector from "../components/WeekSelector";
import TaskTags from "../components/TaskTags";
import TaskCard from "../components/TaskCard";
import DashboardLayout from "../components/DashboardLayout";
import AddTaskPanel from "../components/AddTaskPanel";
import { TaskStatsPanel } from "../components/TaskStatsPanel";
import { Cross, Plus, Trash, Trash2 } from "lucide-react";
import RemoveTaskpanel from "../components/RemoveTaskpanel";
import { useRouter } from "next/navigation";

interface Task {
  _id: string;
  topic: string;
  level: string;
  category: string;
  postQuizFeedback?: boolean;
  status: 'Assigned' | 'Drafts';
  questions: any[];
  term?: number;
  week?: number;
  createdAt: string;
  __v: number;
}

interface TaskResult {
  level: undefined;
  category: string;
  status: string;
  _id: string;
  student: string;
  task: Task | null;
  classId: string;
  answers: {
    question: string;
    selected: string;
    isCorrect: boolean;
    _id: string;
  }[];
  term: number;
  week: number;
  evaluationStatus: "pending" | "completed";
  score: number;
  createdAt: string;
}

export default function TasksPage() {
  const [selectedWeek, setSelectedWeek] = useState<number | undefined>();
  const [selectedTerm, setSelectedTerm] = useState<number | undefined>();
  const [filteredTasks, setFilteredTasks] = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskResult | null>(null);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [Addtask, setAddtask] = useState(false);
  const [Removetask, setremovetask] = useState(false);
  const [Levellist, setLevelslist] = useState<{ _id: string, code: string, customName: string }[]>([]);
  const [TaskResult, setTaskResult] = useState<TaskResult[]>([]);
  const [submissions, setsubmissions] = useState<any>(null);
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const [isremoved, setisremoved] = useState(false);
  const [isassigned, setisassigned] = useState(false);


  const router = useRouter();
  useEffect(() => {
    const fetchTasksResult = async () => {

      setLoading(true);
      try {
        const rr = await fetch(`/api/schools/tasks-dashboard/taskresult`, { credentials: 'include' });
        if (!rr.ok) {
          router.push('/login');
          return;
        }

        const r = await rr.json();
        const validResults = Array.isArray(r)
          ? r
          : [];
        setTaskResult(validResults);

        console.log(validResults)
        const leveldata = await fetch(`/api/levels`, { credentials: 'include' });
        const levelsres = await leveldata.json();
        console.log(levelsres)
        setLevelslist(levelsres);

        const uniqueCategories = [
          ...new Set(
            validResults
              .map((res) => res?.category)
              .filter(Boolean)
          ),
        ];
        setAvailableCategories(uniqueCategories);

        setFilteredTasks(validResults);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setAvailableCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTasksResult();
  }, [isassigned, isremoved]); // render dashboard as task are assigned and unassigned

  useEffect(() => {

    const fetchSubmissions = async () => {
      if (!selectedTask) {
        setsubmissions(null);
        return;
      }
      console.log(selectedTask)
      const selectedTaskId = selectedTask._id;
      const term = selectedTask.term !== undefined ? String(selectedTask.term) : "";
      const week = selectedTask.week !== undefined ? String(selectedTask.week) : "";
      const level = selectedTask.level !== undefined ? String(selectedTask.level) : "";
      try {
        const params = new URLSearchParams({
          term: term.toString(),
          week: week.toString(),
          level: level,
          selectedTaskId: selectedTaskId
        });
        console.log(params.toString())
        const submmisonres = await fetch(
          `/api/schools/tasks-dashboard?${params.toString()}`
          , { credentials: 'include' }
        );
        const submmisondata = await submmisonres.json();
        setsubmissions(submmisondata.data || null); //if empty  send no submission
        console.log(submmisondata.data)
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setsubmissions(null);
      }
    };
    fetchSubmissions();
  }, [selectedTask,]);

  useEffect(() => {
    let filtered: TaskResult[] = TaskResult;

    if (selectedCategory) filtered = filtered.filter((t) => t?.category === selectedCategory);
    if (selectedTerm !== undefined) filtered = filtered.filter((t) => t?.term === selectedTerm);
    if (selectedWeek !== undefined) filtered = filtered.filter((t) => t?.week === selectedWeek);
    if (selectedLevel) filtered = filtered.filter((t) => t?.level === selectedLevel);

    const assignedOnly = filtered.filter((t) => t?.status !== "Drafts");
    setFilteredTasks(assignedOnly);

    if (selectedTask && !assignedOnly.find((t) => t._id === selectedTask._id)) setSelectedTask(null);
  }, [TaskResult, selectedCategory, selectedTerm, selectedWeek, selectedLevel, selectedTask]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setSelectedTask(null);
  };

  const handleTaskSelect = (task: TaskResult) => {
    console.log(task)
    setAddtask(false);
    if (!task) return;
    setSelectedTask((prevTask) => (prevTask?._id === task._id ? null : task));
  };


  return (
    <DashboardLayout>
      <div className="flex gap-6 px-6 py-6 bg-[#F6F8FF] ">
        <div className={`space-y-4 transition-all duration-300 ${selectedTask ? "flex-1" : "w-2/3"}`}>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#2C2F5A]">Tasks Dashboard</h1>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="text-sm border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All levels</option>
              {Array.isArray(Levellist) && Levellist.length > 0 ? (
                Levellist.map((lvl) => (
                  <option key={lvl._id} value={lvl.customName}>
                    {lvl.customName}
                  </option>
                ))
              ) : (
                <option disabled>No levels available</option>
              )}
            </select>
          </div>

          <TermTabs selectedTerm={selectedTerm ?? 1} onSelect={setSelectedTerm} />
          <WeekSelector selectedweek={selectedWeek ?? 1} onSelect={setSelectedWeek} />

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-sm font-semibold text-gray-700">All Weekly Task (Week {selectedWeek ?? "All"})  </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddtask(true)}
                className="text-xs px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1"
              >
                <Plus /> Add Tasks
              </button>
              <button onClick={() => {
                setAddtask(false);
                setSelectedTask(null)
                setremovetask(true)
              }} className="text-xs px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-1">
                <Trash2 /> Remove Tasks
              </button>
            </div>
          </div>

          <TaskTags availableCategories={availableCategories} selectedCategory={selectedCategory} onCategorySelect={handleCategoryFilter} />

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <div className="space-y-4 p-2 h-[600px] overflow-auto">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onClick={handleTaskSelect} isSelected={selectedTask?._id === task._id} />
                ))
              ) : (
                <p className="flex text-center justify-center items-center">No valid tasks found.</p>
              )}
            </div>
          )}
        </div>

        <div className="w-1/3 bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm ">
          {Addtask ? (
            <AddTaskPanel setisassigned={setisassigned} setaddTask={setAddtask} Levellist={Levellist} />
          ) : selectedTask && selectedTask ? (
            <TaskStatsPanel selectedtask={selectedTask} taskResult={submissions} />
          ) :
            Removetask ? (
              <RemoveTaskpanel setisremoved={setisremoved} setremovetask={setremovetask} Levellist={Levellist} />
            ) :
              (
                <p className="flex text-center justify-center items-center">Select task to view detailed info.</p>
              )}
        </div>
      </div>
    </DashboardLayout>
  );
}