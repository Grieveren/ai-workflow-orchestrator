interface OptionSelectorProps {
  options: string[];
  onOptionClick: (option: string) => void;
  onOtherClick: () => void;
  disabled?: boolean;
}

export function OptionSelector({ options, onOptionClick, onOtherClick, disabled = false }: OptionSelectorProps) {
  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm text-gray-600 mb-2">Select an option:</p>
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onOptionClick(option)}
          disabled={disabled}
          className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg transition text-gray-700 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option}
        </button>
      ))}
      <button
        onClick={onOtherClick}
        disabled={disabled}
        className="w-full text-left px-4 py-3 bg-white hover:bg-purple-50 border-2 border-dashed border-gray-300 hover:border-purple-300 rounded-lg transition text-gray-500 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Other (type your own answer)
      </button>
    </div>
  );
}
