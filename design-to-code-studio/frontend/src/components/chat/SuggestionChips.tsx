import React from 'react';

/** Suggested prompt chips displayed below the input bar. */
export const SuggestionChips: React.FC<{ suggestions: string[]; onSelect: (s: string) => void }> = ({
  suggestions,
  onSelect,
}) => {
  return (
    <div className="suggestion-chips">
      {suggestions.map((s) => (
        <button key={s} className="suggestion-chip" onClick={() => onSelect(s)}>
          {s}
        </button>
      ))}
    </div>
  );
};
