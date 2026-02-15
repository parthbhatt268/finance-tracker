export default function Button({
  children,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const base =
    'rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary:
      'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[#1a1a1a]',
    green:
      'border border-[#22c55e]/50 bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30',
    red: 'border border-[#ef4444]/50 bg-[#ef4444]/20 text-[#ef4444] hover:bg-[#ef4444]/30',
    ghost: 'text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-white/5',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
    >
      {children}
    </button>
  );
}
