"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, ImageIcon, Volume2 } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { BiLeftArrow, BiLeftArrowCircle } from "react-icons/bi";
import { toast } from "react-toastify";
import { QuestionViewerModal } from "./QuestionViewerModal";

interface Level {
    _id: string, code: string, customName: string
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
}

interface Task {
    _id: string;
    topic: string;
    level?: string;
    questions?: Question[];
    status: string;
}

// Updated interface to match API response structure
interface TaskResponse {
    _id: string;
    task: Task;
    level?: string; // level might be at the top level
}

interface RemoveTaskPanelProps {
    Levellist: Level[];
    setremovetask: React.Dispatch<React.SetStateAction<boolean>>;
    setisremoved: React.Dispatch<React.SetStateAction<boolean>>;
}



const RemoveTaskPanel: React.FC<RemoveTaskPanelProps> = ({ setisremoved, setremovetask, Levellist }) => {
    const [allTasks, setAllTasks] = useState<TaskResponse[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string>("");  // Empty string shows all by default
    const [assignTask, setAssignTask] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        const fetchadminAssigntask = async () => {

            try {
                const res = await fetch(`/api/schools/remove-task`, { credentials: "include" });
                const assignedTask = await res.json();
                console.log(assignedTask.tasks)
                /*    const taskdata = await fetch(`/api/admin/tasks`);
                  const alltask = await taskdata.json();
  
                  const filtered = alltask.tasks.filter((task: any) =>
                      task.status !== "Drafts" && (task.term == null && task.week == null)
                  );
  
                  console.log(filtered);  */
                setAllTasks(assignedTask.tasks);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
        fetchadminAssigntask();
    }, []);

    // This filters tasks based on selected level
    const filteredTasks = useMemo(() => {
        if (!selectedLevel || selectedLevel === "") {
            // Only return tasks where task is not null
            return allTasks.filter(item => item.task !== null);
        }
        console.log(selectedLevel);
        // Filter by level and exclude null tasks
        return allTasks.filter(task => task.task && task.task.level === selectedLevel);
    }, [allTasks, selectedLevel]);

    const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLevel = e.target.value;
        console.log("Level changed to:", newLevel);
        setSelectedLevel(newLevel);
        setAssignTask([]);  // Clear selections when changing level
    };

    const handleTaskSelect = (taskId: string) => {
        setAssignTask((prev) =>
            prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
        );
    };
    const handleViewQuestions = async (taskItem: TaskResponse) => {
        try {
            console.log("Selected task item:", taskItem);
            const task = taskItem.task || taskItem;

            if (!task.questions || task.questions.length === 0) {
                const response = await fetch(`/api/admin/tasks/${task._id}`);
                const taskDetails = await response.json();
                setSelectedTask(taskDetails.task);
            } else {
                setSelectedTask(task as Task);
            }
            setIsModalOpen(true);
        } catch (error) {
            console.error("Error fetching task details:", error);
            alert("Failed to load questions");
        }
    };

    const handleunAssign = async () => {
        try {

            const response = await fetch(`/api/schools/remove-task`, {
                method: "DELETE",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    taskIds: assignTask,
                }),
            });

            const res = await response.json();
            console.log("Remove response:", res.message);
            if (!response.ok) {
                toast.error(res.message)
                return
            }
            // Refresh the tasks after successful removal
            const updatedTasks = allTasks.filter(taskItem => !assignTask.includes(taskItem._id));
            setAllTasks(updatedTasks);
            setAssignTask([]);
            toast.success(res.message)
            setisremoved(true)

        } catch (err) {
            console.error("Error removing task:", err);
            alert("Failed to remove tasks. Please try again.");
        }
    };

    return (
        <div className="">
            {isModalOpen ? (
                <QuestionViewerModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    task={selectedTask}
                />
            ) : (
                <div className=" h-full flex flex-col">
                    <div className="flex gap-3">
                        <BiLeftArrowCircle
                            className="hover:bg-blue-300 rounded-full cursor-pointer"
                            onClick={() => setremovetask(false)}
                            size={25}
                        />
                        <h2 className="text-xl font-semibold  text-gray-800 mb-6">Remove Tasks</h2>
                    </div>
                    <div className="">
                        <h3 className="mb-2">Search Task</h3>
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



                    <div className="flex-1">
                        <div className="space-y-3 h-[500px] overflow-y-auto mb-6">
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((taskItem) => {
                                    const task = taskItem.task || taskItem;
                                    return (
                                        <div className="flex gap-4 items-center" key={taskItem._id}>
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                onChange={() => handleTaskSelect(taskItem._id)}
                                                checked={assignTask.includes(taskItem._id)}
                                            />
                                            <div className="flex w-fit px-5 py-2 items-center justify-between rounded-full gap-3 bg-[#EEF3FF] border border-blue-100">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-gray-800">{task.topic}</span>

                                                    <span className="whitespace-nowrap text-black">
                                                        ({task.questions?.length || 0} Ques.)
                                                    </span>
                                                    <button
                                                        onClick={() => handleViewQuestions(taskItem)}
                                                        className="border rounded-2xl  px-2 py-1 hover:bg-blue-200 transition-colors"
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
                                    {selectedLevel
                                        ? `No tasks found for the selected level `
                                        : 'Please select a level to view tasks'
                                    }
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between gap-5 items-center mb-4">
                            <button
                                onClick={() => setremovetask(false)}
                                className="px-6 py-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleunAssign}
                                disabled={assignTask.length === 0}
                                className="px-6 py-3 bg-red-600 text-white  whitespace-nowrap rounded-full hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Remove Task{assignTask.length > 1 ? "s" : ""} ({assignTask.length})
                            </button>
                        </div>


                    </div>
                </div>
            )}
        </div>
    );
};

export default RemoveTaskPanel;