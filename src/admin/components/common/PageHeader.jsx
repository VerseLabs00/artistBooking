export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 sm:mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-400 mt-1 text-xs sm:text-sm">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 mt-1">{action}</div>}
    </div>
  )
}
