"use client";

import { useState, type KeyboardEvent } from "react";
import { Chip } from "./chip";

interface ChipInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

/** Token list with an inline "type + Enter to add" affordance. */
export function ChipInput({ values, onChange, placeholder = "Add…" }: ChipInputProps) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) {
      setDraft("");
      return;
    }
    onChange([...values, value]);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-2 py-1.5 focus-within:border-accent">
      {values.map((value) => (
        <Chip
          key={value}
          label={value}
          onRemove={() => onChange(values.filter((item) => item !== value))}
        />
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : ""}
        className="min-w-20 flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-faint"
      />
    </div>
  );
}
