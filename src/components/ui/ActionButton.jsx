export function ActionButton({ label, onClick, variant = 'primary' }) {
  const variants = {
    primary:
      'border border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700 hover:border-indigo-700',
    secondary:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    danger:
      'border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 hover:border-rose-700',
  }

  return (
    <button
      className={`rounded-lg px-3 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 ${variants[variant] || variants.primary}`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
