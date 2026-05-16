"use client";

import { useState } from "react";
import TermTabs from "./TermTabs";
import WeekSelector from "./WeekSelector";
import TaskCard from "./TaskCard";

interface Task {
  _id: string;
  topic: string;
  category: string;
  level: string;
  score: number;
  maxScore: number;
  submissions: number;
  status: string;
  totalquestions: number;
  term: number;
  week: number;
  createdAt: string;
  postQuizFeedback: boolean;
  answers: any[];
}

interface WeeklyTasksProps {
  tasklist: Task[];
  selectedTerm: number;
  onTermChange: (term: number) => void;
  selectedWeek: number;
  onWeekChange: (week: number) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  levelsList: { code: string; _id: string, customName: string }[];
  termTaskCounts?: Record<number, number>;
  weekTaskCounts?: Record<number, number>;
  hasData: boolean;
}

export default function WeeklyTasks({
  tasklist,
  selectedTerm,
  onTermChange,
  selectedWeek,
  onWeekChange,
  setSelectedLevel,
  selectedLevel,
  levelsList,
  termTaskCounts = {},
  weekTaskCounts = {},
  hasData
}: WeeklyTasksProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskSelect = (task: Task) => {
    if (!task) return;
    setSelectedTask((prevTask) => (prevTask?._id === task._id ? null : task));
  };

  return (
    <div className="bg-white rounded-[20px] p-6 shadow flex flex-col h-full">
      <div className=" flex  justify-between mb-4">
        <h2 className="text-xl font-bold text-[#2C2F5A] mb-4">Weekly Tasks</h2>
        <div className="flex  gap-4 items-center mb-4">

          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>All levels</option>
            {Array.isArray(levelsList) && levelsList.map((level) => (
              <option key={level._id} value={level.customName}>
                {level.customName}
              </option>
            ))}
          </select>
        </div>
      </div>


      <TermTabs
        selectedTerm={selectedTerm}
        onSelect={onTermChange}
        termTaskCounts={termTaskCounts} // ✅ Pass down
      />
      <WeekSelector
        selectedweek={selectedWeek}
        onSelect={onWeekChange}
        weekTaskCounts={weekTaskCounts} />

      <div className="space-y-4 pb-6 overflow-y-auto mt-4">
        {!hasData ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-center">
              No tasks found for the selected filters.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try selecting a different term, week, or level.
            </p>
          </div>
        ) : tasklist.length > 0 ? (
          tasklist.map((task) => (
            <TaskCard
              dashboard={true}
              key={task._id}
              task={task}
              onClick={handleTaskSelect}
              isSelected={selectedTask?._id === task._id}
            />
          ))
        ) : (
          <p className="flex text-center justify-center items-center py-8 text-gray-500">
            No tasks available.
          </p>
        )}
      </div>
    </div>
  );
}
