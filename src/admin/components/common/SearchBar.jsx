import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 gap-2 w-72">
      <Search size={15} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400 w-full"
      />
    </div>
  )
}
