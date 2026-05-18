export default function StatCard({ label, value, badge, badgeColor = 'green' }) {
  const badgeClasses = {
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-700',
  }

  return (
    <div className="stat-card flex-1 min-w-0">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-extrabold text-gray-900 leading-none">{value}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-0.5 ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
