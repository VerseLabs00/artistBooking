const popularArtists = [
  { name: 'Bruno Mars', role: 'Musician' },
  { name: 'Bruno Mars', role: 'Musician' },
  { name: 'Bruno Mars', role: 'Musician' },
  { name: 'Bruno Mars', role: 'Musician' },
]

export default function HeroSection() {
  return (
    <div className="flex gap-4 mt-4 items-stretch">
      {/* Left: Concert image with overlay */}
      <div
        className="flex-1 relative bg-cover bg-center flex flex-col justify-end p-8 rounded-2xl overflow-hidden min-h-[220px]"
        style={{ backgroundImage: "url('/home-hero-left.png')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-bold uppercase tracking-wide">
            GET READY TO YOUR
          </h2>
          <p className="text-white/80 text-sm mt-2 max-w-xs leading-relaxed">
            "Lorem ipsum dolor sit amet, consectetur<br />Lorem ipsum dolor sit amet, consectetur
          </p>
          <button className="mt-4 bg-white text-black text-sm px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
            Booking
          </button>
        </div>
      </div>

      {/* Right: Popular Artist */}
      <div className="w-[240px] bg-white rounded-2xl px-5 py-5 flex-shrink-0">
        <h3 className="font-semibold text-gray-900 mb-4 text-sm">Popular  Artist</h3>
        <div className="space-y-3.5">
          {popularArtists.map((artist, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100">
                <img src="/person.png" alt={artist.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{artist.name}</p>
                <p className="text-xs text-gray-400">{artist.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
