"use client";

interface TaskTagsProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  availableCategories?: string[];
}

export default function TaskTags({
  selectedCategory = '',
  onCategorySelect,
  availableCategories = []
}: TaskTagsProps) {

  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      // If clicking the same category, clear the filter; otherwise set it
      onCategorySelect(selectedCategory === category ? '' : category);
    }
  };

  // If no categories available, show loading or empty state
  if (availableCategories.length === 0) {
    return (
      <div className="flex gap-2 flex-wrap">
        <div className="text-sm text-gray-500 italic px-4 py-2">
          No categories available
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {/* "All" button to clear filters */}
      <button
        onClick={() => onCategorySelect && onCategorySelect('')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === ''
            ? 'bg-black text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
      >
        All
      </button>

      {/* Dynamic category buttons based on actual task categories */}
      {availableCategories.map((category) => (
        <button
          key={category}
          onClick={() => handleCategoryClick(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedCategory === category
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}