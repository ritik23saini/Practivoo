'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Select from 'react-select';
import { Search } from 'lucide-react';

type Question = {
  _id: string;
  heading?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  media?: {
    image?: string;
    audio?: string;
  };
  questiontype: string;
  type?: 'single' | 'multi';
};

type Task = {
  _id: string;
  topic: string;
};

export default function Page() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [taskId, setTaskId] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [Qtype, setQtype] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  const questionType = [
    "MCQs",
    "Fill in the gaps",
    "Match The Pairs",
    "Word Order exercise",
    "Find the Mistakes",
    "Complete The Sentence"
  ];

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchAll = async () => {
      const [qRes, tRes] = await Promise.all([
        fetch('/api/admin/questions', { credentials: 'include' }),
        fetch('/api/admin/tasks', { credentials: 'include' }),
      ]);

      const questionsData = await qRes.json();
      const tasksData = await tRes.json();

      setQuestions(questionsData.questions || []);
      setTasks(tasksData.tasks || []);

      const urlTaskId = searchParams!.get('taskid');
      if (urlTaskId) setTaskId(urlTaskId);
    };

    fetchAll();
  }, [searchParams]);

  // Fixed filtering logic with AND conditions
  const filteredQuestions = questions.filter((q) => {
    // Search filter - checks heading OR question
    const matchesSearch =
      !searchQuery ||
      q.heading?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.question.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter - exact match when Qtype is set
    const matchesType = !Qtype || q.questiontype === Qtype;

    // Both conditions must be true (AND)
    return matchesSearch && matchesType;
  });

  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  const handleToggleSelect = (id: string) => {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(qid => qid !== id) : [...prev, id]
    );
  };

  const handleAssignToTask = async () => {
    if (!taskId || selectedQuestions.length === 0) {
      toast.error('Select at least one question and choose a task.');
      return;
    }

    const res = await fetch(`/api/admin/tasks/${taskId}/assign-questions`, {
      method: 'PATCH',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds: selectedQuestions }),
    });

    if (res.ok) {
      toast.success('Questions assigned to task!');
      setSelectedQuestions([]);
      setTaskId('');
    } else {
      toast.error('Failed to assign questions.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    const res = await fetch(`/api/admin/questions/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const response = await res.json();
    if (res.ok) {
      toast.success('Question deleted!');
      setQuestions((prev) => prev.filter((q) => q._id !== id));
      setSelectedQuestions((prev) => prev.filter((qid) => qid !== id));
    } else {
      toast.error(response.error || 'Failed to delete question.');
    }
  };

  const handleTypeFilter = (type: string) => {
    if (Qtype === type) {
      setQtype(''); // Clear filter if clicking the same button
    } else {
      setQtype(type);
    }
    setPage(1); // Reset to first page
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">All Questions</h1>
        <button
          onClick={() => router.push('/admin/questions/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          + Create New Question
        </button>
      </div>

      {/* Task Select */}
      <div className="mb-4 max-w-sm">
        <label className="block mb-1 text-sm font-medium text-gray-700">
          Select Task to Assign Questions
        </label>
        <Select
          instanceId="task-select"
          placeholder="Select a Task..."
          value={
            tasks.find((task) => task._id === taskId)
              ? {
                value: taskId,
                label: tasks.find((task) => task._id === taskId)?.topic || '',
              }
              : null
          }
          options={tasks.map((task) => ({
            value: task._id,
            label: task.topic,
          }))}
          onChange={(selectedOption) => {
            setTaskId(selectedOption?.value || '');
          }}
          isSearchable
        />

        <button
          onClick={handleAssignToTask}
          className="mt-2 bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700"
        >
          Assign Selected Questions
        </button>
      </div>

      {/* Selected Count, Search & Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-2 gap-3">
        <span className="text-sm font-medium">
          Selected: {selectedQuestions.length} / {filteredQuestions.length}
          {Qtype && <span className="text-blue-600 ml-1">({Qtype})</span>}
        </span>

        {/* Search Bar */}
        <div className="flex items-center bg-white border rounded-md px-2 w-full md:w-72">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by Question or Heading..."
            className="text-sm outline-0 flex-1 px-2 py-1"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Pagination */}
        <div className="space-x-2">
          <button
            className="px-2 py-1 border rounded text-sm disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            Prev
          </button>
          <span className="text-sm">
            Page {page} of {Math.ceil(filteredQuestions.length / pageSize) || 1}
          </span>
          <button
            className="px-2 py-1 border rounded text-sm disabled:opacity-50"
            disabled={endIndex >= filteredQuestions.length}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Question Type Filter Buttons */}
      <div className="flex gap-2 p-2 mb-4 overflow-x-auto flex-wrap">
        {questionType.map((t) => (
          <button
            key={t}
            onClick={() => handleTypeFilter(t)}
            className={`px-3 py-1.5 text-nowrap rounded-2xl text-sm transition-colors ${Qtype === t
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100 border'
              }`}
          >
            {t}
          </button>
        ))}
        {Qtype && (
          <button
            onClick={() => {
              setQtype('');
              setPage(1);
            }}
            className="px-3 py-1.5 text-nowrap rounded-2xl text-sm bg-red-100 text-red-600 hover:bg-red-200 border border-red-300"
          >
            ✕ Clear Filter
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="border rounded overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-2 font-semibold text-sm border-b">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-1 text-center">✔</div>
          <div className="col-span-5">Heading</div>
          <div className="col-span-5">Question</div>
        </div>

        {paginatedQuestions.map((q, idx) => (
          <div
            key={q._id}
            className="grid grid-cols-12 p-2 border-b items-center text-sm"
          >
            <div className="col-span-1 text-center">{startIndex + idx + 1}</div>
            <div className="col-span-1 text-center">
              <input
                type="checkbox"
                checked={selectedQuestions.includes(q._id)}
                onChange={() => handleToggleSelect(q._id)}
              />
            </div>
            <div className="col-span-5 flex flex-col">
              <span>{q.heading || '—'}</span>
              <div className="mt-1 flex gap-2 text-xs text-blue-600">
                <button
                  onClick={() => router.push(`/admin/questions/${q._id}`)}
                  className="hover:underline"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q._id)}
                  className="text-red-600 hover:underline"
                >
                  🗑 Delete
                </button>
              </div>
            </div>
            <div className="col-span-5">{q.question}</div>
          </div>
        ))}

        {filteredQuestions.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No questions found{Qtype ? ` for "${Qtype}"` : ''}.
          </div>
        )}
      </div>
    </div>
  );
}
