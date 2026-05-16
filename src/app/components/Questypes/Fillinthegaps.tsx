import { Check, Trash2 } from "lucide-react";
import { QuesAnsComponentsProps } from "../QuesAnsComponent";

type FillInTheGapsProps = Omit<QuesAnsComponentsProps, "activeQuesType">;

const Fillinthegaps = ({
  current,
  activeIndex,
  updateCurrent,
  addOption,
  updateOption,
  setAsCorrectAnswer,
  removeOption,
  handleMediaUpload,
  clearMedia,
  preview,
  showPreview,
}: FillInTheGapsProps) => {
  return (
    <div>
      <div className="flex gap-3">
        {/* Image Upload / Preview */}
        <div className="w-1/3 mt-4">
          {preview?.image || current.media?.image ? (
            <div className="relative">
              <img
                src={ preview?.image ||current.media?.image}
                alt="Image Preview"
                className="border h-[150px] w-full object-cover rounded-lg"
              />
              <Trash2
                onClick={() => clearMedia("image", activeIndex)}
                className="absolute bg-white p-1 right-2 top-2 rounded-md cursor-pointer shadow"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-[150px] border-2 border-black border-dashed rounded-lg relative cursor-pointer">
              <label
                htmlFor={`image-upload-${activeIndex}`}
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 cursor-pointer"
              >
                <span className="border border-dashed px-4 py-2 rounded-md font-semibold">
                  + Add Image
                </span>
              </label>
              <input
                id={`image-upload-${activeIndex}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    showPreview(e.target.files[0], "image");
                    handleMediaUpload(e.target.files[0], "image", activeIndex);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Audio Upload / Preview */}
        <div className="w-1/3 mt-4">
          {preview?.audio || current.media?.audio ? (
            <div className="relative">
              <p className="text-sm font-medium">Audio Preview:</p>
              <audio controls className="w-full mt-1">
                <source src={ preview?.audio ||current.media?.audio } />
                Your browser does not support audio.
              </audio>
              <Trash2
                onClick={() => clearMedia("audio", activeIndex)}
                className="absolute bg-white p-1 right-2 top-2 rounded-md cursor-pointer shadow"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center h-[150px] border-2 border-black border-dashed rounded-lg relative cursor-pointer">
              <label
                htmlFor={`audio-upload-${activeIndex}`}
                className="flex flex-col items-center justify-center w-full h-full text-gray-600 cursor-pointer"
              >
                <span className="border border-dashed px-4 py-2 rounded-md font-semibold">
                  + Add Audio
                </span>
              </label>
              <input
                id={`audio-upload-${activeIndex}`}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    showPreview(e.target.files[0], "audio");
                    handleMediaUpload(e.target.files[0], "audio", activeIndex);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Question Input */}
      <div>
        <label className="font-semibold">Question</label>
        <textarea
          placeholder="eg.-something something _____________ something word "
          className="w-full border p-2 rounded-lg"
          value={current.question}
          onChange={(e) => updateCurrent({ question: e.target.value })}
        />
      </div>

      {/* Options */}
      <div>
        <label className="font-semibold">Add Correct Answer</label>
        <div className="space-y-2 mt-2 rounded-lg gap-2 flex flex-wrap border p-2">
          {current.options.map((opt: string, idx: number) => {
            const correctIndex = current.correctAnswer.indexOf(opt);
            // -1 if not selected, otherwise its position in array

            return (
              <div
                key={idx}
                className="relative flex h-24 rounded-lg border p-2 items-center"
              >
                <input
                  value={opt}
                  placeholder="Add Answers Here"
                  onChange={(e) => updateOption(idx, e.target.value)}
                  className="px-2 w-58 py-1 text-xl outline-0"
                />
                <div className="absolute top-1 right-2 flex gap-2 items-center">
                  <button onClick={() => setAsCorrectAnswer(idx)}>
                    <Check
                      size={20}
                      className={
                        current.correctAnswer.includes(opt)
                          ? "text-white bg-green-600 rounded-md"
                          : "text-gray-400"
                      }
                    />
                  </button>

                  {/* Show order number if selected */}
                  {correctIndex !== -1 && (
                    <span className="text-xs font-bold text-green-600">
                      {correctIndex + 1}
                    </span>
                  )}

                  <button onClick={() => removeOption(idx)}>
                    <Trash2 size={18} className="text-black bg-amber-50" />
                  </button>
                </div>
              </div>
            );
          })}
          <button
            onClick={addOption}
            className="text-sm text-blue-600 mt-1"
          >
            + Add Option
          </button>
        </div>
        <p className="text-md">
          *Note- Answers will appear to students in the order shown above.*
        </p>
      </div>

    </div>
  );
};

export default Fillinthegaps;
