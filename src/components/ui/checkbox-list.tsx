interface CheckboxListOption {
  value: string;
  label: string;
  description?: string;
}

interface CheckboxListProps {
  options: CheckboxListOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

/** Bordered list of toggleable rows - the "select servers/skills, not free text" picker. */
export function CheckboxList({ options, selected, onChange }: CheckboxListProps) {
  const toggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value],
    );
  };

  return (
    <div className="overflow-hidden rounded-lg border border-line-strong bg-surface">
      {options.map((option, index) => (
        <label
          key={option.value}
          className={
            index > 0
              ? "flex cursor-pointer items-start gap-2.5 border-t border-line px-3 py-2"
              : "flex cursor-pointer items-start gap-2.5 px-3 py-2"
          }
        >
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
            className="mt-0.5 size-3.5 accent-accent"
          />
          <span className="min-w-0">
            <span className="block truncate font-mono text-[13px] text-ink">{option.label}</span>
            {option.description ? (
              <span className="block truncate text-xs text-ink-faint">{option.description}</span>
            ) : null}
          </span>
        </label>
      ))}
    </div>
  );
}
