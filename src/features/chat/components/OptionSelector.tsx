interface OptionSelectorProps {
  options: string[];
  onOptionClick: (option: string) => void;
  onOtherClick: () => void;
  disabled?: boolean;
}

export function OptionSelector({ options, onOptionClick, onOtherClick, disabled = false }: OptionSelectorProps) {
  return (
    <div className="space-y-2 mb-4">
      <p className="text-sm text-[var(--text-secondary)] mb-2">Select an option:</p>
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onOptionClick(option)}
          disabled={disabled}
          className="w-full text-left px-4 py-3 bg-[var(--surface-elevated)] hover:bg-[var(--accent-soft)] border border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-lg transition text-[var(--text-primary)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {option}
        </button>
      ))}
      <button
        onClick={onOtherClick}
        disabled={disabled}
        className="w-full text-left px-4 py-3 bg-[var(--surface-elevated)] hover:bg-[var(--accent-soft)] border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--accent)] rounded-lg transition text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Other (type your own answer)
      </button>
    </div>
  );
}
