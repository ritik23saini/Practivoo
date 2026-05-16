'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { toast } from "react-toastify";
import { BiTask } from 'react-icons/bi';
import { Search } from 'lucide-react';
import { matchThePairs } from '../questions/create/page';

export type Question = {
  _id: string;
  heading?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  media?: {
    image?: string;
    audio?: string;
  };
  matchThePairs?: matchThePairs[];
  questiontype: string;
  type?: 'single' | 'multi';
};

export type Task = {
  _id: string;
  topic: string;
  level: string;
  category: string;
  status: 'Assigned' | 'Drafts';
  questions: Question[];
  term: number;
  week: number;
  createdAt: string;
};

export type Level = {
  _id: string;
  code: string;
  defaultName: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksflag, setTasksflag] = useState(0);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskForm, seteditTaskForm] = useState<Task | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const taskId = sessionStorage.getItem("taskId");
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t._id === taskId);
      if (task) {
        setSelectedTask(task);
        sessionStorage.removeItem("taskId");
      }
    }
  }, [tasks]);

  // Fetch tasks & levels
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [tasksRes, levelsRes] = await Promise.all([
          fetch('/api/admin/tasks', { credentials: 'include' }),
          fetch('/api/admin/levels', { credentials: 'include' })
        ]);

        if (!tasksRes.ok || !levelsRes.ok) {
          router.replace('/admin/login');
          return;
        }
        const tasksData = await tasksRes.json();
        const levelsData = await levelsRes.json();

        setTasks(tasksData.tasks || []);
        setLevels(levelsData.levels || []);
        console.log(levelsData.levels)
        console.log(tasksData)
        console.log('Fetched tasks:', tasksData.tasks);



      } catch (err) {
        console.error('Failed to fetch tasks/levels:', err);
      }
    };
    fetchAll();
  }, [tasksflag]);

  // Filter by level + status + search
  useEffect(() => {
    const lower = searchTerm.trim().toLowerCase();

    const updated = tasks.filter(task => {
      // Level filter
      const matchesLevel = selectedLevel === 'All' || task.level === selectedLevel;
      // Status filter
      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Assigned' && task.status === 'Assigned') ||
        (selectedStatus === 'Drafts' && task.status === 'Drafts');
      // Search filter
      const matchesSearch =
        !lower ||
        task.topic.toLowerCase().includes(lower) ||
        task.category.toLowerCase().includes(lower);

      return matchesLevel && matchesStatus && matchesSearch;
    });

    setFilteredTasks(updated);

    // Keep selected task if it's in the filtered list
    if (selectedTask && !updated.some(task => task._id === selectedTask._id)) {
      setSelectedTask(null);
    }
  }, [selectedLevel, selectedStatus, searchTerm, tasks, selectedTask]);

  // Edit task
  const handleEditClick = (task: Task) => {
    seteditTaskForm({ ...task });
    setShowEditModal(true);
  };

  // Edit task
  const handleUpdateTask = async () => {
    if (!editTaskForm) return;

    try {
      const res = await fetch(`/api/admin/tasks/${editTaskForm._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editTaskForm),
      });

      if (res.ok) {
        toast.success("Task updated successfully");
        // Increment the flag to trigger data re-fetch
        setTasksflag(prev => prev + 1);

        setShowEditModal(false);
        seteditTaskForm(null);
      } else {
        toast.error("Failed to update task");
      }
    } catch (err) {
      toast.error("Error updating task");
      console.error(err);
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    const res = await fetch(`/api/admin/tasks/${taskId}`, { method: 'DELETE' });
    const result = await res.json();

    if (res.ok) {
      toast.success("Task deleted successfully");
      setTasksflag(prev => prev + 1);
      setSelectedTask(null);
    } else {
      alert(result.message || "Could not delete task.");
    }
  };

  // Remove question from task
  const handleRemoveQuestion = async (taskId: string, questionId: string) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this question from the task?");
    if (!confirmDelete) return;
    try {
      setRemoving(questionId);
      const res = await fetch(`/api/admin/tasks/${taskId}/questions/${questionId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to remove');

      toast.success('Question removed from task');

      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t =>
          t._id === taskId ? { ...t, questions: t.questions.filter(q => q._id !== questionId) } : t
        );
        const updatedSelectedTask = updatedTasks.find(t => t._id === taskId) || null;
        setSelectedTask(updatedSelectedTask);
        return updatedTasks;
      });

    } catch (e: any) {
      toast.error(e.message || 'Could not remove question');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="flex ">
      {/* Left Panel */}
      <div className="w-2/3 p-4 bg-[#e9efff]">
        <div className="flex items-center justify-between mb-4">
          <div className='flex gap-3 items-center'>
            <BiTask />
            <h2 className="text-xl font-bold">Tasks List ({filteredTasks.length})</h2>
          </div>
          <div className='flex bg-white gap-3 p-2'>
            <Search />
            <input
              type="text"
              placeholder='Search by topic or category'
              className='outline-none'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => router.push('/admin/tasks/create')}
            className="text-black px-4 py-1.5 rounded-lg text-sm border hover:bg-blue-600 hover:text-white"
          >
            + Create New Task
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-3 py-1 text-sm ${selectedLevel === 'All' ? 'bg-blue-200' : ''}`}
            onClick={() => setSelectedLevel('All')}
          >
            All
          </button>
          {levels.map((level) => (
            <button
              key={level._id}
              className={`rounded-full border px-3 py-1 text-sm ${selectedLevel === level.code ? 'bg-blue-200' : ''}`}
              onClick={() => setSelectedLevel(level.code)}
            >
              {level.defaultName}
            </button>
          ))}
        </div>
        {/* Status Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            className={`rounded-full border px-3 py-1 text-sm ${selectedStatus === 'All' ? 'bg-blue-200' : ''}`}
            onClick={() => setSelectedStatus('All')}
          >
            All
          </button>
          <button
            className={`rounded-full border px-3 py-1 text-sm ${selectedStatus === 'Assigned' ? 'bg-blue-200' : ''}`}
            onClick={() => setSelectedStatus('Assigned')}
          >
            Assigned
          </button>
          <button
            className={`rounded-full border px-3 py-1 text-sm ${selectedStatus === 'Drafts' ? 'bg-blue-200' : ''}`}
            onClick={() => setSelectedStatus('Drafts')}
          >
            Drafts
          </button>
        </div>

        {/* Table */}
        <div className=" grid grid-cols-4 font-extrabold mt-10s mb-2 text-sm">
          <span>Topic</span>
          <span >Category</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {/* Table Rows */}
        <div className=' max-h-[600px] overflow-auto'>
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className="grid grid-cols-4 py-2 items-center hover:bg-white cursor-pointer text-sm border-b"
              onClick={() => setSelectedTask(task)}
            >
              <span>{task.topic}</span>
              <span className='font-bold'>{task.category}</span>
              <span>
                <button
                  className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm border ${task.status === 'Assigned'
                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                    : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                    }`}
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      const res = await fetch(`/api/admin/tasks/${task._id}`, { method: 'PATCH' });
                      if (res.ok) {
                        toast.success("Status updated successfully");
                        setTasksflag(prev => prev + 1);
                      } else {
                        toast.error("Task is in use and cannot be changed.");
                      }
                    } catch {
                      toast.error("Error updating status");
                    }
                  }}
                >
                  {task.status === "Assigned" ? "Assigned" : "Drafts"}
                </button>
              </span>
              <span className=" space-x-2">
                <button className='bg-white p-1 rounded-md mt-2 hover:bg-slate-200'
                  title="Assign Questions"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/admin/questions?taskid=${task._id}`);
                  }}
                >
                  📝 Assign
                </button>
                <button className='bg-white p-1 rounded-md mt-2 hover:bg-slate-200'
                  title="Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(task);
                  }}
                >
                  ✏️ Edit
                </button>
                <button className='bg-white p-1 rounded-md mt-2 hover:bg-slate-200'
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task._id);
                  }}
                >
                  🗑️ Remove
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className=" h-[800px]  w-1/3 p-4 bg-white border-l overflow-y-auto">
        {selectedTask ? (
          <div>
            <div className='flex justify-between items-center'>
              <span>
                <h3 className="text-lg font-bold mb-2">Topic: {selectedTask.topic}</h3>
                <p className="text-sm mb-4">{selectedTask?.questions?.length === 0 ? "No questions to view " : `Questions:${selectedTask?.questions?.length}`}</p>
              </span>
              <span className=' flex gap-3 '>
                {/*  <button onClick={() => { router.push("questions/create") }} className='border px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100'>{selectedTask?.questions?.length === 0 ? "Add Questions" : "Add more Questions"}</button> */}
                {selectedTask?.questions?.length > 0 && <button onClick={() => { router.push("questions") }} className='border px-2 py-1 rounded-lg cursor-pointer hover:bg-blue-100'>View All questions</button>}
              </span>
            </div>

            {selectedTask?.questions?.map((q, i) => (
              <div key={q._id || i} className="mb-4 border p-3 rounded shadow-sm">
                <div className='flex-col  flex-wrap justify-between items-center mb-2'>
                  <div className=" ">
                    <p className="font-semibold">Question {i + 1}</p>
                    {q.heading && <p className="text-sm italic">{q.heading}</p>}
                    <p className="text-sm">{q.question}</p>
                  </div>

                  <div className='flex gap-2 m-2 justify-end'>
                    <button
                      onClick={() => router.push(`/admin/questions/${q._id}`)}
                      className='bg-blue-200 rounded-lg px-3 py-1 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleRemoveQuestion(selectedTask._id, q._id)}
                      disabled={removing === q._id}
                      className='bg-red-200 rounded-lg px-2 py-1 text-sm'
                    >
                      {removing === q._id ? "Removing…" : "Remove"}
                    </button>

                  </div>
                </div>


                {/* Media */}
                {
                  q.media?.image && (
                    <img src={q.media.image} alt="Question image" className="w-full rounded mb-2" />
                  )
                }
                {q.media?.audio && (
                  <audio controls className="w-full mb-2" src={q.media.audio}>
                    Your browser does not support the audio element.
                  </audio>
                )}

                {/* Match The Pairs */}
                {q.questiontype === "Match The Pairs" && Array.isArray(q?.matchThePairs) && (
                  <div className="grid grid-cols-2 gap-2 mb-2 w-full">

                    {q.matchThePairs.map((pair, idx) => {
                      const correctVal = q.correctAnswer[idx]; // take value from correctAnswer order

                      return (
                        <React.Fragment key={idx}>
                          {/* Keys column */}
                          <div className="border px-2 py-1 rounded text-sm w-full text-center">
                            {pair.key.includes("https") ? (
                              <img className="h-24 w-full" src={pair.key} />
                            ) : (
                              <p>{pair.key}</p>
                            )}
                          </div>

                          {/* Correct Values column */}
                          <div className="bg-green-200 border px-2 py-1 flex justify-center items-center rounded text-sm w-full text-center">
                            {correctVal}
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}

                {/* Options */}
                {q.questiontype !== "Match The Pairs" && Array.isArray(q?.options) && (
                  <div
                    className={`grid gap-2 mb-2 w-full ${q.options.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      }`}
                  >
                    {q.options.map((opt, j) => (
                      <div
                        key={j}
                        className={`w-full text-center border px-2 py-2 rounded text-sm ${q.correctAnswer.includes(opt) ? "bg-green-200" : ""
                          }`}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
                {q.questiontype !== "Match The Pairs" && <p><span className='font-bold'>Note*- </span>Question will appear to student in above order </p>}



                {/* Explanation */}
                <details>

                  <summary className="cursor-pointer text-sm text-blue-500 underline">View Explanation </summary>
                  <p className="text-sm mt-1">{q.explanation}</p>

                </details>
              </div >
            ))
            }
          </div >
        ) : (
          <p className="text-center text-gray-400 mt-20">No task selected</p>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Edit Task</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Topic</label>
              <input
                value={editTaskForm.topic}
                onChange={(e) => seteditTaskForm({ ...editTaskForm, topic: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter task topic"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={editTaskForm.category}
                onChange={(e) => seteditTaskForm({ ...editTaskForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                {[...new Set(tasks.map((t) => t.category))].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/*       <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={editTaskForm.level}
                onChange={(e) => seteditTaskForm({ ...editTaskForm, level: e.target.value })}
                className="w-full px-3 py-2 border rounded"
              >
                {levels.map((lvl) => (
                  <option key={lvl._id} value={lvl.defaultName}>{lvl.defaultName}</option>
                ))}
              </select>
            </div> */}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}