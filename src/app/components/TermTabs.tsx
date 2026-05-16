"use client";

type TermTabsProps = {
  selectedTerm: number;
  onSelect: (termIndex: number) => void;
  termTaskCounts?: Record<number, number>; // ✅ Optional prop with ?
};

export default function TermTabs({ 
  selectedTerm, 
  onSelect, 
  termTaskCounts = {} // ✅ Default empty object
}: TermTabsProps) {
  const terms = [1, 2, 3, 4];

  return (
    <div className="flex space-x-4 text-sm font-medium mb-4">
      {terms.map((term) => {
        const taskCount = termTaskCounts[term] || 0;
        
        return (
          <button
            key={term}
            onClick={() => onSelect(term)}
            className={`px-5 py-2 rounded-t-xl transition relative ${
              selectedTerm === term
                ? "bg-white text-[#2C2F5A] font-bold border-b-2 border-blue-600"
                : "bg-[#F6F8FF] text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              Term {term}
              {taskCount > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  selectedTerm === term
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-700"
                }`}>
                  {taskCount}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
