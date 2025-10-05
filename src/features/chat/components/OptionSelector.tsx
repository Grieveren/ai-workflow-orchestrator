interface OptionSelectorProps {
  options: string[];
  onOptionClick: (option: string) => void;
  onOtherClick: () => void;
  disabled?: boolean;
}

export function OptionSelector({ options, onOptionClick, onOtherClick, disabled = false }: OptionSelectorProps) {
  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select an option:</p>
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onOptionClick(option)}
          disabled={disabled}
          className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 rounded-lg transition text-gray-700 dark:text-gray-200 hover:text-purple-700 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option}
        </button>
      ))}
      <button
        onClick={onOtherClick}
        disabled={disabled}
        className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 rounded-lg transition text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Other (type your own answer)
      </button>
    </div>
  );
}
