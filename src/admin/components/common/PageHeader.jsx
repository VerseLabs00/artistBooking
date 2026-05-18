export default function PageHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-extrabold text-gray-900">{title}</h1>
      {subtitle && <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>}
    </div>
  )
}
