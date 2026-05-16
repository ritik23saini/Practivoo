'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { QuesAnsComponents } from '@/app/components/QuesAnsComponent';
import { PlusCircle } from 'lucide-react';

export interface matchThePairs {
  key: string;
  value: string;
}

export interface Question {
  heading: string;
  question: string;
  options: string[];
  correctAnswer: string[];
  explanation: string;
  media: {
    image?: string;
    audio?: string;
  };
  matchThePairs?: matchThePairs[];
  questiontype: string;
  type: 'single' | 'multi';
  additionalMessage?: string;
}

const questiontypes: string[] = [
  "MCQs",
  "Fill in the gaps",
  "Match The Pairs",
  "Word Order exercise",
  "Find the Mistakes",
  "Complete The Sentence"
];

export default function EditQuestionPage() {
  const params = useParams() as { id: string };
  const id = params.id;
  const router = useRouter();

  const [question, setQuestion] = useState<Question | null>(null);
  const [preview, setPreview] = useState<{ image?: string; audio?: string }>({});
  const [activeQuesType, setActiveQuesType] = useState("MCQs");

  // Track pending uploads (files not yet uploaded to S3)
  const [pendingUploads, setPendingUploads] = useState<{
    type: 'image' | 'audio' | 'pair';
    file: File;
    pairIndex?: number;
    value?: string;
  }[]>([]);

  // fetch existing question
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/questions/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.question) {
        const fixed = {
          ...data.question,
          correctAnswer: Array.isArray(data.question.correctAnswer)
            ? data.question.correctAnswer
            : data.question.correctAnswer
              ? [data.question.correctAnswer]
              : [],
        };
        setQuestion(fixed);
        setActiveQuesType(fixed.questiontype || "MCQs");
      } else {
        toast.error('Failed to load question');
      }
    }
    if (id) fetchData();
  }, [id]);

  // helper to update fields
  const updateCurrent = (data: Partial<Question>) => {
    setQuestion(prev => prev ? { ...prev, ...data } : null);
  };

  // --- OPTIONS ---
  const updateOption = (index: number, value: string) => {
    if (!question) return;
    const oldOption = question.options[index];
    const updatedOptions = [...question.options];
    updatedOptions[index] = value;

    const updatedCorrectAnswer = question.correctAnswer.map(ans =>
      ans === oldOption ? value : ans
    );

    updateCurrent({
      options: updatedOptions,
      correctAnswer: updatedCorrectAnswer,
    });
  };

  const addOption = () => {
    if (!question) return;
    updateCurrent({ options: [...question.options, ""] });
  };

  const removeOption = (index: number) => {
    if (!question) return;
    const optionToRemove = question.options[index];
    const newOptions = question.options.filter((_, i) => i !== index);
    const newCorrectAnswer = question.correctAnswer.filter(ans => ans !== optionToRemove);
    updateCurrent({ options: newOptions, correctAnswer: newCorrectAnswer });
  };

  const setAsCorrectAnswer = (index: number) => {
    if (!question) return;
    const option = question.options[index];

    const singleAnswerTypes = ["MCQs"];
    if (singleAnswerTypes.includes(question.questiontype)) {
      updateCurrent({ correctAnswer: [option] });
    } else {
      if (question.correctAnswer.includes(option)) {
        updateCurrent({
          correctAnswer: question.correctAnswer.filter(ans => ans !== option),
        });
      } else {
        updateCurrent({ correctAnswer: [...question.correctAnswer, option] });
      }
    }
  };

  // --- MEDIA HANDLERS (Store locally until save) ---
  const showPreview = (file: File, type: "image" | "audio") => {
    const url = URL.createObjectURL(file);
    setPreview((prev) => ({ ...prev, [type]: url }));
  };

  const handleMediaUpload = async (
    file: File,
    type: "image" | "audio"
  ) => {
    // Show preview immediately
    showPreview(file, type);

    // Store file for later upload
    setPendingUploads(prev => [...prev, { type, file }]);

    // Mark as pending in question state
    updateCurrent({
      media: {
        ...question?.media,
        [type]: 'pending'
      }
    });
  };

  const handlePairUpload = async (
    file: File | null,
    value: string,
    pairIndex: number
  ) => {
    if (!question) return;

    if (file) {
      // Show preview
      showPreview(file, 'image');

      // Store for later upload
      setPendingUploads(prev => [...prev, {
        type: 'pair',
        file,
        pairIndex,
        value
      }]);

      // Mark as pending
      const updatedPairs = [...(question.matchThePairs || [])];
      updatedPairs[pairIndex] = {
        ...(updatedPairs[pairIndex] || {}),
        key: 'pending',
        value: value || ''
      };
      updateCurrent({ matchThePairs: updatedPairs });
    } else {
      // Just update text value
      const updatedPairs = [...(question.matchThePairs || [])];
      updatedPairs[pairIndex] = {
        ...(updatedPairs[pairIndex] || {}),
        value: value || ''
      };
      updateCurrent({ matchThePairs: updatedPairs });
    }
  };

  const clearMedia = (type: "image" | "audio") => {
    setPreview(prev => ({ ...prev, [type]: undefined }));

    if (question) {
      const updatedMedia = { ...question.media };
      delete updatedMedia[type];
      updateCurrent({ media: updatedMedia });

      // Remove from pending uploads
      setPendingUploads(prev =>
        prev.filter(upload => !(upload.type === type))
      );
    }
  };

  // --- SAVE WITH UPLOADS ---
  const handleSave = async () => {
    if (!question) return;

    try {
      // 1. Create a working copy of question
      let workingQuestion = { ...question };

      // 2. Upload all pending files and update workingQuestion
      const uploadPromises = pendingUploads.map(async (upload) => {
        const formData = new FormData();
        formData.append('file', upload.file);
        formData.append('type', upload.type === 'pair' ? 'image' : upload.type);

        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();

        if (res.ok && data.url) {
          if (upload.type === 'pair' && upload.pairIndex !== undefined) {
            // Update pair in workingQuestion
            if (!workingQuestion.matchThePairs) workingQuestion.matchThePairs = [];
            workingQuestion.matchThePairs[upload.pairIndex] = {
              key: data.url,
              value: upload.value || ''
            };
          } else {
            // Update media in workingQuestion
            workingQuestion.media = {
              ...workingQuestion.media,
              [upload.type]: data.url
            };
          }
          return data.url;
        }
        throw new Error('Upload failed');
      });

      await Promise.all(uploadPromises);

      // 3. Prepare final payload from workingQuestion (now has S3 URLs)
      const trimmedOptions = workingQuestion.options.map(opt => opt.trim());
      const trimmedCorrectAnswer = workingQuestion.correctAnswer.map(ans => ans.trim());

      const payload: Question = {
        ...workingQuestion,
        heading: workingQuestion.heading.trim(),
        question: workingQuestion.question.trim(),
        explanation: workingQuestion.explanation.trim(),
        additionalMessage: workingQuestion.additionalMessage?.trim() || "",
        options: trimmedOptions,
        correctAnswer: trimmedCorrectAnswer,
      };

      if (payload.questiontype === "Match The Pairs") {
        payload.matchThePairs = payload.matchThePairs?.map(p => ({
          key: p.key,
          value: p.value.trim()
        }));
      }

      // 4. Send payload to API
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Question updated!');
        router.push('/admin/questions');
        setPendingUploads([]);
        setPreview({});
      } else {
        const errorData = await res.json();
        console.error("Update error:", errorData);
        toast.error('Update failed!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Save failed!');
    }
  };

  if (!question) return <p className="p-6">Loading...</p>;

  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold">Edit Question</h2>

      <input
        placeholder="Heading"
        className="w-full border border-gray-500 p-2 rounded-lg"
        value={question.heading}
        onChange={(e) => updateCurrent({ heading: e.target.value })}
      />

      {/* Question type selector */}
      <h1 className="font-semibold text-md">Select Type</h1>
      <div className="flex flex-wrap text-sm gap-2">
        {questiontypes.map((type) => (
          <button
            key={type}
            onClick={() => {
              updateCurrent({ questiontype: type });
              setActiveQuesType(type);
            }}
            className={`border border-gray-500 flex items-center text-lg px-3 py-2 gap-3 rounded-lg ${activeQuesType === type ? "bg-black text-white" : "bg-white text-black"
              }`}
          >
            <PlusCircle className="size-5" />
            {type}
          </button>
        ))}
      </div>

      <QuesAnsComponents
        current={question}
        activeQuesType={activeQuesType}
        activeIndex={0}
        addOption={addOption}
        updateOption={updateOption}
        setAsCorrectAnswer={setAsCorrectAnswer}
        removeOption={removeOption}
        updateCurrent={updateCurrent}
        handleMediaUpload={handleMediaUpload}
        clearMedia={clearMedia}
        showPreview={showPreview}
        preview={preview}
        handlePairUpload={handlePairUpload}
      />

      <div>
        <label className="font-semibold">Explanation</label>
        <textarea
          className="w-full border border-gray-500 p-2 rounded mt-1"
          value={question.explanation}
          onChange={(e) => updateCurrent({ explanation: e.target.value })}
        />
      </div>

      <div>
        <label className="font-semibold">Additional Message <span className="text-gray-500">(Optional)</span></label>
        <textarea
          className="w-full border border-gray-500 p-2 rounded mt-1"
          value={question.additionalMessage || ""}
          onChange={(e) => updateCurrent({ additionalMessage: e.target.value })}
        />
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => router.push('/admin/questions')}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
