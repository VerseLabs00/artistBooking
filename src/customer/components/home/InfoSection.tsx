export default function InfoSection() {
  return (
    <section className="py-12 flex gap-16 items-start">
      {/* Left */}
      <div className="flex-1">
        <h2 className="text-4xl font-bold text-gray-900 leading-tight mb-6">
          Lorem ipsum dolor sit<br />
          ipsum dolor sit dolor sit<br />
          ipsum dolor sit);
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur Lorem
          ipsum dolor sit amet, consectetur Lorem ipsum
        </p>
      </div>

      {/* Right: Any questions card */}
      <div className="w-[280px] flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-md p-7 text-center">
          <div className="flex justify-center -space-x-2 mb-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                <img src="/person.png" alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Any questions?</h3>
          <p className="text-xs text-gray-500 leading-relaxed mb-5">
            Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur Lorem
          </p>
          <button className="bg-red-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1 mx-auto">
            contact
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
