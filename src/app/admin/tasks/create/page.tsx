"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


export default function CreateTaskPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [postQuizFeedback, setPostQuizFeedback] = useState(false);

  const [levels, setLevels] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchLevels();
    fetchCategories();
  }, []);

  const fetchLevels = async () => {
    const res = await fetch("/api/admin/levels");
    const json = await res.json();
    console.log(json.levels);
    setLevels(json.levels);
  };

  const fetchCategories = async () => {
    const res = await fetch("/api/admin/categories");
    const json = await res.json();
    if (json.success) setCategories(json.data);
  };

  const handleNext = async () => {
    console.log({ topic, level, category, postQuizFeedback });
    const res = await fetch("/api/admin/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, level, category, postQuizFeedback }),
    });

    const json = await res.json();
    if (json.success) {
      toast.success("Task created successfully");
      router.push('/admin/tasks')
    }
  };

  return (
    <div className="p-6 bg-indigo-100 space-y-4 text-2xl font-bold">
      <h2 >📝 Create New Task</h2>
      {/* Topic Input */}
      <div className="flex w-full gap-5 py-15 ">
        <div className="w-2/3">
          <label>Topic</label>
          <input
            className="border-0 p-3 mt-5 rounded-lg outline-0 w-full bg-white"
            placeholder="Enter Topic Name"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>


        {/* Level Dropdown */}
        <div className="w-1/3">
          <label>Level</label>
          <select
            className="border-0 p-3 outline-0 mt-5 rounded-lg  w-full bg-white"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            <option value="">Select Level</option>
            {levels.map((lvl: any) => (
              <option key={lvl._id} value={lvl.code}>
                {lvl.defaultName}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Category Dropdown */}
      <div className=" flex justify-between place-items-end  gap-10">
        <div className="md:w-2/3 w-auto">
          <label>Category</label>
          <select
            className="border-0  bg-white  p-3 mt-5 rounded-lg  w-full"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select Category</option>

            {categories.map((cat: any) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {/* Next Button */}

        </div>
        <div className=" md:w-1/3 w-auto flex items-center justify-end gap-3 whitespace-nowrap">
          <label>
            Post-Quiz Feedback
          </label>
          <input className="h-8 w-8 "
            type="checkbox"
            checked={postQuizFeedback}
            onChange={(e) => setPostQuizFeedback(e.target.checked)}
          />
          <button
            onClick={handleNext}
            className=" border-1 text-slate-600  px-3 py-2 rounded-lg "
          >
            Create
          </button>
        </div>

      </div>
    </div>

  );
}