import React from 'react'

const LOGO_PATH = "/assets/logo/logo-footer@3x.png"

const categories = ['Musician', 'DJ', 'Solo Singer', 'Rapper', 'Live Band', 'Videographers']
const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Trincomalee']

const quickLinks = [
  { label: 'About Us',       sectionId: 'join-section' },
  { label: 'Join as Artist', sectionId: 'join-section' },
  { label: 'How It Works',   sectionId: 'how-it-works' },
  { label: 'Contact',        sectionId: 'contact-section' },
  { label: 'Privacy Policy', sectionId: 'contact-section' },
]

type SocialLink = {
  label: string
  href: string
  icon: React.ReactElement
}

const socialLinks: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
    ),
  },
  {
    label: 'X',
    href: '#',
    icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
        </svg>
    ),
  },
]

const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
  e.preventDefault()
  const target = document.getElementById(sectionId)
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function Footer() {
  return (
      <>
        {/* ══════════════════════════════════════════════════
          CONTACT US SECTION
      ══════════════════════════════════════════════════ */}
        <section id="contact-section" className="w-full bg-[#111] px-16 py-16">
          <div className="w-full max-w-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Left */}
              <div>
                <p className="text-[#E8194B] text-xs font-bold uppercase tracking-widest mb-3">Get In Touch</p>
                <h2 className="text-white text-3xl font-black leading-tight mb-4">
                  We'd Love To<br />Hear From You
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-sm">
                  Have a question, want to partner with us, or need help finding the right artist? Reach out and we'll get back to you shortly.
                </p>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <span>hello@performa.lk</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </div>
                    <span>+94 77 123 4567</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <span>Colombo, Sri Lanka</span>
                  </div>
                </div>
              </div>

              {/* Right: Form */}
              <div className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">First Name</label>
                      <input
                          type="text"
                          placeholder="John"
                          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Last Name</label>
                      <input
                          type="text"
                          placeholder="Doe"
                          className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Email</label>
                    <input
                        type="email"
                        placeholder="john@example.com"
                        className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Message</label>
                    <textarea
                        rows={4}
                        placeholder="How can we help you?"
                        className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors resize-none"
                    />
                  </div>
                  <button className="w-full bg-[#E8194B] hover:bg-[#c8133b] text-white font-bold text-sm py-3.5 rounded-xl transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════ */}
        <footer className="bg-[#0a0a0a] text-white pt-16 pb-8">
          <div className="w-full px-16">
            <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 pb-14">

              {/* Brand */}
              <div>
                <div className="mb-5">
                  <img src={LOGO_PATH} alt="Performa" className="h-9 w-auto object-contain" />
                </div>
                <p className="text-[#6b6b6b] text-[13px] leading-relaxed mb-7 max-w-[240px]">
                  Sri Lanka's premier platform for discovering, comparing and booking verified artists for any event.
                </p>
                <div className="flex gap-2.5">
                  {socialLinks.map((s) => (
<a
                      key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full border border-[#2a2a2a] flex items-center justify-center text-[#888] hover:border-[#555] hover:text-white transition-colors"
                    >
                  {s.icon}
                    </a>
                    ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="text-[10.5px] font-semibold tracking-widest uppercase text-white mb-5">Categories</p>
                <ul className="space-y-3.5">
                  {categories.map(item => (
                      <li key={item}>
<a
                        href="#categories-section"
                        onClick={(e) => handleScrollTo(e as React.MouseEvent<HTMLAnchorElement>, 'categories-section')}
                        className="text-[#6b6b6b] text-sm hover:text-white transition-colors"
                        >
                        {item}
                      </a>
                    </li>
                    ))}
                </ul>
              </div>

              {/* Cities */}
              <div>
                <p className="text-[10.5px] font-semibold tracking-widest uppercase text-white mb-5">Cities</p>
                <ul className="space-y-3.5">
                  {cities.map(item => (
                      <li key={item}>
<a
                        href="#artists-section"
                        onClick={(e) => handleScrollTo(e as React.MouseEvent<HTMLAnchorElement>, 'artists-section')}
                        className="text-[#6b6b6b] text-sm hover:text-white transition-colors"
                        >
                        {item}
                      </a>
                    </li>
                    ))}
                </ul>
              </div>

              {/* Quick Links */}
              <div>
                <p className="text-[10.5px] font-semibold tracking-widest uppercase text-white mb-5">Quick Links</p>
                <ul className="space-y-3.5">
                  {quickLinks.map(({ label, sectionId }) => (
                      <li key={label}>
<a
                        href={`#${sectionId}`}
                        onClick={(e) => handleScrollTo(e, sectionId)}
                        className="text-[#6b6b6b] text-sm hover:text-white transition-colors"
                        >
                        {label}
                      </a>
                    </li>
                    ))}
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="border-t border-[#1e1e1e] pt-6 flex items-center justify-between">
              <p className="text-[#4a4a4a] text-xs">© 2025 Performa. All rights reserved.</p>
              <div className="flex gap-7">
                {['Terms', 'Privacy Policy', 'Contact'].map(l => (
                    <a key={l} href="#" className="text-[#5a5a5a] text-sm hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </>
  )
}