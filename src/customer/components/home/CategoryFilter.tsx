import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import FilterModal from './FilterModal'
import { getCategories } from '../../services/discoveryService'

export default function CategoryFilter() {
  const [categories, setCategories] = useState<string[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category') ?? ''

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  const selectCategory = (cat: string) => {
    const next = new URLSearchParams(searchParams)
    if (activeCategory === cat) {
      next.delete('category')
    } else {
      next.set('category', cat)
    }
    setSearchParams(next)
  }

  if (categories.length === 0) return null

  return (
    <>
      <div className="flex items-center py-4 border-b border-gray-100">
        <div className="flex items-center flex-1 gap-3 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => selectCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeCategory === cat
                  ? 'bg-red-600 text-white border-red-600'
                  : 'border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilter(true)}
          className="ml-6 flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-600 flex-shrink-0 transition-colors hover:bg-gray-50 hover:border-gray-400 hover:text-gray-800"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filter
        </button>
      </div>

      {showFilter && <FilterModal onClose={() => setShowFilter(false)} />}
    </>
  )
}
