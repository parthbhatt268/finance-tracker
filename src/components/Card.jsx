export default function Card({ title, children, className = '' }) {
  return (
    <div
      className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm shadow-black/20 ${className}`}
    >
      {title && (
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}
