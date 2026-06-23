export default function StatCard({ label, value, badge, badgeColor = 'green' }) {
  const badgeClasses = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="stat-card flex-1 min-w-0">
      <p className="text-[10px] sm:text-xs text-gray-400 mb-1 sm:mb-2 truncate">{label}</p>
      <div className="flex flex-wrap items-end gap-1.5 sm:gap-2">
        <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900 leading-none break-all">{value}</span>
        {badge && (
          <span className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-full mb-0.5 shrink-0 ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
