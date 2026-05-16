"use client";

export default function RemoveConfirmation({
  onCancel,
  onConfirm,
  name,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  name: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 w-72 shadow-lg z-20">
      <h3 className="text-sm font-bold text-gray-800 mb-2">Remove {name}?</h3>
      <p className="text-xs text-gray-500 mb-4">This can’t be undone</p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-1 rounded-full border border-gray-300 text-sm hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-1 rounded-full bg-black text-white text-sm hover:bg-gray-800"
        >
          Remove
        </button>
      </div>
    </div>
  );
}