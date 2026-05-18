const allCategory = ['Musician', 'Bands & Duo', 'Bands & Duo', 'Musician', 'Bands & Duo', 'Bands & Duo', 'Bands & Duo']
const cities = ['Colombo', 'Kandy Town', 'Anurdhpura', 'Galle city', 'Trincomalee', 'Hambanthota', 'Gampha', 'Panadura']

const socialLinks = [
  {
    label: 'Instagram',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
      </svg>
    ),
  },
  {
    label: 'Twitter',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4l16 16M4 20L20 4" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
      </svg>
    ),
  },
  {
    label: 'Youtube',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
      </svg>
    ),
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#111] text-white pt-12 pb-6 mt-8">
      <div className="max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-3">mtttt</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Lorem ipsum dolor sit amet, consectetur Lorem ipsum dolor sit amet, consectetur
            </p>
            <p className="text-sm font-medium mb-3">Follow us</p>
            <div className="flex flex-col gap-2.5">
              {socialLinks.map((s) => (
                <a key={s.label} href="#" className="text-gray-400 text-sm hover:text-white transition-colors flex items-center gap-2">
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* All Category */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">All Category</h4>
            <ul className="space-y-2.5">
              {allCategory.map((c, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{c}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* City & Town */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">City & Town</h4>
            <ul className="space-y-2.5">
              {cities.map((c, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{c}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Category & City */}
          <div>
            <h4 className="font-semibold mb-4 text-sm">Category & City</h4>
            <ul className="space-y-2.5">
              {['Musician', 'Bands & Duo'].map((c, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{c}</a>
                </li>
              ))}
              <li className="pt-3">
                <p className="text-sm font-semibold text-white mb-2.5">Quick Links</p>
              </li>
              {['Musician', 'Bands & Duo'].map((c, i) => (
                <li key={i}>
                  <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{c}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-5 flex items-center justify-between">
          <p className="text-gray-500 text-xs">@Forge25 All rights reerved.</p>
          <div className="flex items-center gap-6">
            {['Contact', 'Setting', 'Terms', 'Policy'].map((l) => (
              <a key={l} href="#" className="text-gray-400 text-sm hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
