export function Card({ title, children, className = '' }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${className}`.trim()}
    >
      {title && <h3 className="text-sm font-semibold tracking-tight text-slate-900">{title}</h3>}
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  )
}
