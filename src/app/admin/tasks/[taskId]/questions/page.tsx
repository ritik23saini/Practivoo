"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface Question {
  heading: string;
  question: string;
  answers: Answer[];
  explanation: string;
  additional: string;
  type: string;
}

const defaultQuestion = (): Question => ({
  heading: "",
  question: "",
  answers: [{ text: "", isCorrect: false }],
  explanation: "",
  additional: "",
  type: "MCQs",
});

export default function CreateQuestionPage() {
  const [questions, setQuestions] = useState<Question[]>([defaultQuestion()]);
  const [activeIndex, setActiveIndex] = useState(0);

  const current = questions[activeIndex];

  const updateCurrent = (data: Partial<Question>) => {
    const updated = [...questions];
    updated[activeIndex] = { ...updated[activeIndex], ...data };
    setQuestions(updated);
  };

  const updateAnswer = (index: number, text: string) => {
    const updatedAnswers = current.answers.map((a, i) =>
      i === index ? { ...a, text } : a
    );
    updateCurrent({ answers: updatedAnswers });
  };

  const markCorrect = (index: number) => {
    const updatedAnswers = current.answers.map((a, i) => ({
      ...a,
      isCorrect: i === index,
    }));
    updateCurrent({ answers: updatedAnswers });
  };

  const addAnswer = () => {
    updateCurrent({ answers: [...current.answers, { text: "", isCorrect: false }] });
  };

  const removeAnswer = (index: number) => {
    const updated = current.answers.filter((_, i) => i !== index);
    updateCurrent({ answers: updated });
  };

  const addNextQuestion = () => {
    setQuestions([...questions, defaultQuestion()]);
    setActiveIndex(questions.length);
  };

  const deleteQuestion = () => {
    if (questions.length <= 1) return;
    const updated = questions.filter((_, i) => i !== activeIndex);
    setQuestions(updated);
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <h2 className="text-xl font-semibold">Create New Question</h2>

      {/* Question Nav Buttons */}
      <div className="flex flex-wrap gap-2">
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`w-8 h-8 text-sm rounded-full border ${
              i === activeIndex ? "bg-blue-600 text-white" : "bg-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question Input */}
      <div className="border rounded p-4 space-y-4 bg-white">
        <textarea
          placeholder="Heading"
          className="w-full border p-2 rounded"
          value={current.heading}
          onChange={(e) => updateCurrent({ heading: e.target.value })}
        />

        {/* Question Type Buttons */}
        <div className="flex flex-wrap gap-2">
          {["MCQs", "Fill in the gaps", "Match", "Order", "Mistakes", "Sentence"].map(
            (type) => (
              <button
                key={type}
                onClick={() => updateCurrent({ type })}
                className={`border px-3 py-1 rounded ${
                  current.type === type ? "bg-black text-white" : ""
                }`}
              >
                {type}
              </button>
            )
          )}
        </div>

        <textarea
          placeholder="Enter your question..."
          className="w-full border p-2 rounded"
          value={current.question}
          onChange={(e) => updateCurrent({ question: e.target.value })}
        />

        {/* Answer Options */}
        <div>
          <label className="font-semibold">Answers</label>
          <div className="space-y-2 mt-2">
            {current.answers.map((a, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  value={a.text}
                  onChange={(e) => updateAnswer(idx, e.target.value)}
                  className="border px-2 py-1 rounded flex-1"
                />
                <button onClick={() => markCorrect(idx)}>
                  <Check
                    size={20}
                    className={`${a.isCorrect ? "text-green-600" : "text-gray-400"}`}
                  />
                </button>
                <button onClick={() => removeAnswer(idx)}>
                  <Trash2 size={18} className="text-red-500" />
                </button>
              </div>
            ))}
            <button onClick={addAnswer} className="text-sm text-blue-600 mt-1">
              + Add Answer
            </button>
          </div>
        </div>

        {/* Explanation and Message */}
        <div>
          <label className="font-semibold">Explanation</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            value={current.explanation}
            onChange={(e) => updateCurrent({ explanation: e.target.value })}
          />
        </div>
        <div>
          <label className="font-semibold">Additional Message</label>
          <textarea
            className="w-full border p-2 rounded mt-1"
            value={current.additional}
            onChange={(e) => updateCurrent({ additional: e.target.value })}
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={deleteQuestion}
            className="text-sm border px-4 py-1 rounded text-red-600"
          >
            🗑️ Delete Question
          </button>
          <div className="flex gap-4">
            <button
              onClick={addNextQuestion}
              className="border px-4 py-1 rounded text-sm"
            >
              ➕ Add Next Question
            </button>
            <button className="bg-black text-white px-4 py-1 rounded text-sm">
              💾 Save {questions.length} Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}