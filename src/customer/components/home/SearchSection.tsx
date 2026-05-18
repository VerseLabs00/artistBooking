export default function SearchSection() {
  return (
    <div className="bg-white py-10 flex flex-col items-center">
      {/* Stats */}
      <div className="flex items-center gap-2 mb-5">
        <div className="flex -space-x-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
              <img src="/person.png" alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500 ml-1">600+ artist already joined</span>
      </div>

      <h1 className="text-4xl font-bold text-center text-gray-900 mb-8 leading-tight">
        Book premium artists in<br />just a few clicks!
      </h1>

      {/* Search bar */}
      <div className="flex items-center bg-white border border-gray-200 rounded-full shadow-sm px-5 py-3 gap-3 w-full max-w-md">
        <input
          type="text"
          placeholder="What?"
          className="flex-1 outline-none text-sm text-gray-500 bg-transparent placeholder-gray-400"
        />
        <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
          <span className="text-sm text-gray-500">Where?</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">+50km</span>
        <button className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-red-700 transition-colors">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
