"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BiLeftArrowCircle } from "react-icons/bi";
import { QuestionViewerModal } from "./QuestionViewerModal";

const STATIC_TERMS = [1, 2, 3, 4];
const STATIC_WEEKS = Array.from({ length: 12 }, (_, i) => i + 1);

interface Level {
    _id: string, code: string, customName: string
}

interface MediaContent {
    image?: string;
    audio?: string;
}

interface MatchPair {
    key: string;
    value: string;
}

interface Question {
    _id: string;
    heading: string;
    question: string;
    options: string[];
    correctAnswer: string[];
    questiontype: string;
    matchThePairs?: MatchPair[];
    explanation?: string;
    type?: string;
    media?: MediaContent;
}

interface Task {
    _id: string;
    topic: string;
    level?: string;
    questions?: Question[];
    status: string;
}

interface AddTaskPanelProps {
    Levellist: Level[];
    setaddTask: React.Dispatch<React.SetStateAction<boolean>>;
    setisassigned: React.Dispatch<React.SetStateAction<boolean>>;
}



// Toast Component for error messages
const Toast: React.FC<{
    message: string;
    type: 'error' | 'success';
    onClose: () => void;
}> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}>
            <div className="flex items-center justify-between">
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const AddTaskPanel: React.FC<AddTaskPanelProps> = ({ setisassigned, setaddTask, Levellist }) => {
    const [allTasks, setAllTasks] = useState<Task[]>([]);
    const [selectedTerm, setSelectedTerm] = useState<number | "">("");
    const [selectedWeek, setSelectedWeek] = useState<number | "">("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");
    const [assignTask, setAssignTask] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    useEffect(() => {


        const fetchadminAssigntask = async () => {
            try {

                const res = await fetch(`/api/schools/assign-task`, { credentials: "include" });
                const unassignedTask = await res.json();
                console.log(unassignedTask.tasks)
                setAllTasks(unassignedTask.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchadminAssigntask();
    }, [refreshTrigger]);

    const filteredTasks = useMemo(() => {
        if (!selectedLevel || selectedLevel === "") {
            return allTasks;
        }
        return allTasks.filter(task => task.level === selectedLevel);
    }, [allTasks, selectedLevel]);

    // ✅ New function to check if task can be selected
    const canSelectTask = (taskId: string, taskLevel: string | undefined): { canSelect: boolean; errorMessage?: string } => {
        // If a specific level is selected, only allow tasks from that level
        if (selectedLevel && selectedLevel !== "") {
            return { canSelect: true };
        }

        // If "All Levels" is selected, check for level consistency
        if (assignTask.length === 0) {
            return { canSelect: true }; // First task can always be selected
        }

        // Get the levels of already selected tasks
        const selectedTaskLevels = new Set(
            assignTask.map(id => {
                const task = allTasks.find(t => t._id === id);
                return task?.level;
            }).filter(Boolean)
        );

        // If no level is defined for the new task
        if (!taskLevel) {
            if (selectedTaskLevels.size > 0) {
                return {
                    canSelect: false,
                    errorMessage: "Cannot mix tasks without level specification with level-specific tasks"
                };
            }
            return { canSelect: true };
        }

        // If this task has a level, check consistency
        if (selectedTaskLevels.size > 0 && !selectedTaskLevels.has(taskLevel)) {
            const selectedLevelNames = Array.from(selectedTaskLevels).map(level =>
                Levellist.find(lvl => lvl.code === level)
            );
            const currentLevelName = Levellist.find(lvl => lvl.code === taskLevel);

            return {
                canSelect: false,
                errorMessage: `Cannot assign ${currentLevelName} tasks with ${selectedLevelNames.join(', ')} tasks. Please select tasks from the same level only.`
            };
        }

        return { canSelect: true };
    };

    // ✅ Updated handleTaskSelect with validation
    const handleTaskSelect = (taskId: string) => {
        const task = allTasks.find(t => t._id === taskId);

        // If unchecking, always allow
        if (assignTask.includes(taskId)) {
            setAssignTask((prev) => prev.filter((id) => id !== taskId));
            return;
        }

        // If checking, validate level consistency
        const validation = canSelectTask(taskId, task?.level);

        if (!validation.canSelect) {
            setToast({
                message: validation.errorMessage || "Cannot select this task",
                type: 'error'
            });
            return;
        }

        // Add the task if validation passes
        setAssignTask((prev) => [...prev, taskId]);
    };

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        setSelectedLevel(newLevel);
        console.log(newLevel)
        setAssignTask([]); // Clear selected tasks when level changes
    };

    const handleViewQuestions = async (task: Task) => {
        try {
            console.log("Selected task:", task);
            if (!task.questions || task.questions.length === 0) {
                const response = await fetch(`/api/admin/tasks/${task._id}`);
                const taskDetails = await response.json();
                setSelectedTask(taskDetails.task);
            } else {
                setSelectedTask(task);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching task details:", error);
            setToast({
                message: "Failed to load questions",
                type: 'error'
            });
        }
    };

    const handleAssign = async () => {
        try {
            
            if (selectedTerm === "" || selectedWeek === "") {
                setToast({
                    message: "Please select Term, Week, and Level before assigning tasks",
                    type: 'error'
                });
                return;
            }

            console.log(selectedLevel, selectedTerm, selectedWeek);
            const level = Levellist.find(lvl => lvl.code === selectedLevel)
            const response = await fetch(`/api/schools/assign-task`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    term: selectedTerm,
                    week: selectedWeek,
                    level: level?.customName,
                    taskIds: assignTask,
                }),
            });

            const res = await response.json();

            if (!response.ok) {
                setToast({
                    message: res.message || `Request failed with status ${response.status}`,
                    type: 'error'
                });
                return;
            }

            console.log("Assign response:", res);
            setAssignTask([]);
            setToast({
                message: res.message || "Tasks assigned successfully!",
                type: 'success'
            });
            setRefreshTrigger(prev => prev + 1);
            setisassigned(true)
        } catch (err) {
            console.error("Error assigning task:", err);
            setToast({
                message: "Network error. Please check your connection and try again.",
                type: 'error'
            });
        }
    };


    return (
        <div className="">
            {/* Toast notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {isModalOpen ? (
                <QuestionViewerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                />
            ) : (
                <div className="h-full flex flex-col">
                    <div className=" flex gap-3">
                        <BiLeftArrowCircle className=" hover:bg-blue-300 rounded-full" onClick={() => setaddTask(false)} size={25} />
                        <h2 className="text-xl font-semibold text-gray-800 mb-6">Add Tasks</h2>
                    </div>

                    <div className="">
                        <h3 className="mb-2">Select Task To add</h3>
                        <select
                            className="border rounded px-3 py-2 mb-5 w-full max-w-xs"
                            value={selectedLevel}
                            onChange={handleLevelChange}
                        >
                            <option value="">All Levels</option>
                            {Levellist.map((lvl) => (
                                <option key={lvl._id} value={lvl.code}>
                                    {lvl.customName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-10">
                        <div className="flex gap-4">
                            <select
                                className="border rounded px-3 py-2"
                                value={selectedTerm}
                                onChange={(e) => setSelectedTerm(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Select Term</option>
                                {STATIC_TERMS.map((t) => (
                                    <option key={t} value={t}>
                                        Term {t}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="border rounded px-3 py-2"
                                value={selectedWeek}
                                onChange={(e) => setSelectedWeek(e.target.value === "" ? "" : Number(e.target.value))}
                            >
                                <option value="">Select Week</option>
                                {STATIC_WEEKS.map((w) => (
                                    <option key={w} value={w}>
                                        Week {w}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-3 h-[500px] overflow-auto mb-6">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => {
                                const validation = canSelectTask(task._id, task.level);
                                const isDisabled = !validation.canSelect && !assignTask.includes(task._id);

                                return (
                                    <div className="flex gap-4 items-center" key={task._id}>
                                        <input
                                            type="checkbox"
                                            className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                                }`}
                                            onChange={() => handleTaskSelect(task._id)}
                                            checked={assignTask.includes(task._id)}
                                            disabled={isDisabled}
                                        />
                                        <div
                                            className={`flex w-fit px-5 py-2 items-center justify-between rounded-full gap-3 bg-[#EEF3FF] border border-blue-100 ${isDisabled ? 'opacity-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-800">{task.topic}</span>
                                                <span className="whitespace-nowrap text-black">
                                                    ({task.questions?.length || 0} Ques.)
                                                </span>
                                                <button
                                                    onClick={() => handleViewQuestions(task)}
                                                    className="border rounded-2xl px-2 py-1 hover:bg-blue-200 transition-colors"
                                                >
                                                    View Question
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                {allTasks.length === 0
                                    ? 'No tasks available'
                                    : selectedLevel
                                        ? `No tasks found for ${Levellist.find((lvl) => lvl.code === selectedLevel)}`
                                        : 'No tasks available'}
                            </div>
                        )}
                    </div>


                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={() => setaddTask(false)}
                                className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assignTask.length === 0}
                                className="px-6 py-3 bg-red-400 text-white rounded-full hover:bg-gray-900 transition-colors font-medium disabled:opacity-50"
                            >
                                Add Task{assignTask.length > 1 ? "s" : ""} ({assignTask.length})
                            </button>
                        </div>

                        <div className="text-sm text-black">
                            <span className="font-bold">Task will be added to:</span>
                            {/*  <br />
                            Class - {selectedLevel ? (Levellist.find(lvl => lvl.customName === selectedLevel)?.name || selectedLevel) : 'All Levels'} */}
                            <br />
                            Term - {selectedTerm || 'Not Selected'} <br />
                            Week - {selectedWeek || 'Not Selected'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddTaskPanel;