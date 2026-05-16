"use client";

interface WeekSelectorProps {
  selectedweek: number;
  onSelect: (week: number) => void;
  weekTaskCounts?: Record<number, number>; // ✅ Optional prop with ?
}

export default function WeekSelector({ 
  selectedweek, 
  onSelect,
  weekTaskCounts = {} // ✅ Default empty object
}: WeekSelectorProps) {
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {weeks.map((week) => {
        const taskCount = weekTaskCounts[week] || 0;
        
        return (
          <button
            key={week}
            onClick={() => onSelect(week)}
            className={`px-4 py-[6px] text-sm rounded-full border font-medium transition-all ${
              selectedweek === week
                ? "bg-black text-white border-black"
                : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-1">
              Week-{week}
              {taskCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ml-1 ${
                  selectedweek === week
                    ? "bg-white text-black"
                    : "bg-gray-200 text-gray-700"
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
