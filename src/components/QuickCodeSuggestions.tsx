import React from 'react';

export interface CodeSnippetChip {
  label: string;
  code: string;
  cursorOffset?: number;
  tooltip?: string;
  category?: 'keyword' | 'symbol' | 'builtin' | 'structure';
}

export const PYTHON_SUGGESTIONS: CodeSnippetChip[] = [
  { label: 'def', code: 'def ', cursorOffset: 4, category: 'keyword' },
  { label: 'return', code: 'return ', cursorOffset: 7, category: 'keyword' },
  { label: 'print()', code: 'print("")', cursorOffset: 7, category: 'builtin' },
  { label: 'for', code: 'for ', cursorOffset: 4, category: 'keyword' },
  { label: 'in', code: 'in ', cursorOffset: 3, category: 'keyword' },
  { label: 'range()', code: 'range()', cursorOffset: 6, category: 'builtin' },
  { label: 'if', code: 'if ', cursorOffset: 3, category: 'keyword' },
  { label: 'elif', code: 'elif ', cursorOffset: 5, category: 'keyword' },
  { label: 'else:', code: 'else:\n    ', cursorOffset: 9, category: 'keyword' },
  { label: 'self', code: 'self', cursorOffset: 4, category: 'keyword' },
  { label: ':', code: ':', cursorOffset: 1, category: 'symbol' },
  { label: '==', code: ' == ', cursorOffset: 4, category: 'symbol' },
  { label: '!=', code: ' != ', cursorOffset: 4, category: 'symbol' },
  { label: '+=', code: ' += ', cursorOffset: 4, category: 'symbol' },
  { label: '()', code: '()', cursorOffset: 1, category: 'symbol' },
  { label: '[]', code: '[]', cursorOffset: 1, category: 'symbol' },
  { label: '{}', code: '{}', cursorOffset: 1, category: 'symbol' },
  { label: '""', code: '""', cursorOffset: 1, category: 'symbol' },
  { label: "''", code: "''", cursorOffset: 1, category: 'symbol' },
  { label: 'len()', code: 'len()', cursorOffset: 4, category: 'builtin' },
  { label: 'str()', code: 'str()', cursorOffset: 4, category: 'builtin' },
  { label: 'int()', code: 'int()', cursorOffset: 4, category: 'builtin' },
  { label: 'True', code: 'True', cursorOffset: 4, category: 'keyword' },
  { label: 'False', code: 'False', cursorOffset: 5, category: 'keyword' },
  { label: 'None', code: 'None', cursorOffset: 4, category: 'keyword' },
  { label: 'Tab ⇥', code: '    ', cursorOffset: 4, category: 'symbol' },
];

export const JAVASCRIPT_SUGGESTIONS: CodeSnippetChip[] = [
  { label: 'const', code: 'const ', cursorOffset: 6, category: 'keyword' },
  { label: 'let', code: 'let ', cursorOffset: 4, category: 'keyword' },
  { label: 'return', code: 'return ', cursorOffset: 7, category: 'keyword' },
  { label: 'console.log()', code: 'console.log("")', cursorOffset: 13, category: 'builtin' },
  { label: 'function', code: 'function () {\n  \n}', cursorOffset: 9, category: 'keyword' },
  { label: '() =>', code: '() => {\n  \n}', cursorOffset: 1, category: 'keyword' },
  { label: 'if', code: 'if () {\n  \n}', cursorOffset: 4, category: 'keyword' },
  { label: 'else', code: 'else {\n  \n}', cursorOffset: 7, category: 'keyword' },
  { label: '===', code: ' === ', cursorOffset: 5, category: 'symbol' },
  { label: '!==', code: ' !== ', cursorOffset: 5, category: 'symbol' },
  { label: '()', code: '()', cursorOffset: 1, category: 'symbol' },
  { label: '[]', code: '[]', cursorOffset: 1, category: 'symbol' },
  { label: '{}', code: '{}', cursorOffset: 1, category: 'symbol' },
  { label: '""', code: '""', cursorOffset: 1, category: 'symbol' },
  { label: '` `', code: '``', cursorOffset: 1, category: 'symbol' },
  { label: ';', code: ';', cursorOffset: 1, category: 'symbol' },
  { label: 'Tab ⇥', code: '  ', cursorOffset: 2, category: 'symbol' },
];

interface QuickCodeSuggestionsProps {
  language: 'python' | 'javascript';
  onInsert: (snippet: string, cursorOffset?: number) => void;
  className?: string;
}

export const QuickCodeSuggestions: React.FC<QuickCodeSuggestionsProps> = ({
  language,
  onInsert,
  className = '',
}) => {
  const suggestions = language === 'python' ? PYTHON_SUGGESTIONS : JAVASCRIPT_SUGGESTIONS;

  return (
    <div
      className={`flex items-center gap-1.5 overflow-x-auto py-2 px-3 bg-[#1e1e24] border-b border-[#2d2d38] select-none scrollbar-thin text-xs ${className}`}
      aria-label="Bilah Saran Kode Cepat (Virtual Helper Bar)"
    >
      <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-terracotta)]"></span>
        Saran Cepat:
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {suggestions.map((chip, idx) => (
          <button
            key={`snippet-${idx}-${chip.label}`}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onInsert(chip.code, chip.cursorOffset);
            }}
            className="px-2.5 py-1 rounded-md bg-[#2a2a34] hover:bg-[#383846] active:bg-[#444454] text-[#e4e4e7] border border-[#3f3f50]/60 font-mono text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap shadow-2xs hover:border-[#6366f1]/50 active:scale-95"
            title={`Sisipkan ${chip.label}`}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
