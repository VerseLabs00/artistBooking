export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-4 sm:mb-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-400 mt-1 text-xs sm:text-sm">{subtitle}</p>}
    </div>
  )
}
