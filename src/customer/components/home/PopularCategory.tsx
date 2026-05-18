const items = [
  {
    artistName: 'TARIQUAL ISLAM',
    role: 'Musician',
    title: 'Lorem ipsum dolor sit',
    desc: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor amet, consectetur Lorem ipsum dolor sit amet, consectetur',
  },
  {
    artistName: 'TARIQUAL ISLAM',
    role: 'Musician',
    title: 'Lorem ipsum dolor sit',
    desc: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor amet, consectetur Lorem ipsum dolor sit amet, consectetur',
  },
  {
    artistName: 'TARIQUAL ISLAM',
    role: 'Musician',
    title: 'Lorem ipsum dolor sit',
    desc: 'Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor amet, consectetur Lorem ipsum dolor sit amet, consectetur',
  },
]

const StarBadge = () => (
  <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
    4.7
  </div>
)

const backCards = [
  { src: '/artist-3.png', rotate: -20 },
  { src: '/artist-2.png', rotate: -12 },
  { src: '/artist-3.png', rotate: -5  },
]

export default function PopularCategory() {
  return (
    <section className="py-6">
      <h2 className="text-base font-semibold text-gray-900 mb-10">Popular Category</h2>
      <div className="grid grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col cursor-pointer group">

            {/* Stacked cards */}
            <div className="relative h-44 mb-16">

              {backCards.map((card, j) => (
                <div
                  key={j}
                  className="absolute inset-0 overflow-hidden border-2 border-white shadow-md"
                  style={{
                    borderRadius: '4px',
                    transform: `rotate(${card.rotate}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <img src={card.src} alt="" className="w-full h-full object-cover" />
                  <StarBadge />
                </div>
              ))}

              {/* Front card */}
              <div
                className="absolute inset-0 overflow-hidden border-2 border-white shadow-lg group-hover:scale-[1.02] transition-transform duration-300"
                style={{ borderRadius: '4px', transformOrigin: 'bottom center' }}
              >
                <img src="/artist-2.png" alt={item.artistName} className="w-full h-full object-cover" />
                <StarBadge />
              </div>

              {/* Avatar + name */}
              <div className="absolute -bottom-14 left-0 right-0 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-md">
                  <img src="/artist-3.png" alt={item.artistName} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-bold text-gray-900 mt-1.5 uppercase tracking-wide">{item.artistName}</p>
                <p className="text-xs text-gray-400">{item.role}</p>
              </div>
            </div>

            {/* Text content */}
            <div>
              <h3 className="text-red-600 font-semibold text-sm mb-2">{item.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
            </div>

          </div>
        ))}
      </div>
    </section>
  )
}
