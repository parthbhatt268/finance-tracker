export default function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex rounded-md border border-[var(--color-border)] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded px-3 py-1.5 text-xs font-medium transition ${
            value === opt.value
              ? 'bg-[var(--color-border)] text-[var(--color-text)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
