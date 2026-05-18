import { useState } from 'react'

interface FilterModalProps {
  onClose: () => void
}

const tabs = ['Category', 'City', 'Date']

const categories = ['Musician', 'Band & Duo', 'DJ', 'Dancer', 'Comedian', 'Photographer']
const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Matara', 'Trincomalee', 'Anuradhapura', 'Hambantota']
const years = ['2024', '2025', '2026']
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const days = Array.from({ length: 31 }, (_, i) => String(i + 1))

export default function FilterModal({ onClose }: FilterModalProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [category, setCategory] = useState('')
  const [city, setCity] = useState('')
  const [year, setYear] = useState('2025')
  const [month, setMonth] = useState('August')
  const [day, setDay] = useState('28')

  const categoryLabel = category || '(choose category)'
  const cityLabel = city || '(select the city)'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#f0f0f5] rounded-2xl w-[480px] max-w-[95vw] shadow-2xl overflow-hidden">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="pt-8 px-8 pb-0 text-center">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500 mt-1">Lorem ipsum dolor sit amet, consectetur Lorem</p>
        </div>

        {/* Tabs */}
        <div className="flex mt-6 px-8 border-b border-gray-200">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${
                activeTab === i ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab}
              {activeTab === i && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="px-8 pt-6 pb-4 min-h-[220px]">

          {/* Category tab */}
          {activeTab === 0 && (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                I'm looking for <span className="font-bold">{categoryLabel}</span>
              </p>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="">category (e.g. musician, band.)</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* City tab */}
          {activeTab === 1 && (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                I'm looking for <span className="font-bold">{category || 'musician'}</span> in <span className="font-bold">{cityLabel}</span>
              </p>
              <div className="relative">
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                >
                  <option value="">city (e.g. around the kandy)</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Date tab */}
          {activeTab === 2 && (
            <div>
              <p className="text-sm text-gray-700 mb-4">
                I'm looking for <span className="font-bold">{category || 'musician'}</span> in{' '}
                <span className="font-bold">{city || 'kandy'}</span> when
              </p>
              <div className="flex items-center gap-3">
                {/* Year */}
                <div className="relative">
                  <select
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-3 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  >
                    {years.map(y => <option key={y}>{y}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Month */}
                <div className="relative">
                  <select
                    value={month}
                    onChange={e => setMonth(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-3 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  >
                    {months.map(m => <option key={m}>{m}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {/* Day */}
                <div className="relative">
                  <select
                    value={day}
                    onChange={e => setDay(e.target.value)}
                    className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-3 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors cursor-pointer"
                  >
                    {days.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-center gap-4 px-8 py-6 border-t border-gray-200 mt-2">
          <button
            onClick={onClose}
            className="px-10 py-3 rounded-full border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-10 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}
