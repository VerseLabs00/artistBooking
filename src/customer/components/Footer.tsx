import React, { useState } from 'react'
import api from '../lib/api'

const LOGO_PATH = "/assets/logo/logo-footer@3x.png"

const categories = ['Musician', 'DJ', 'Solo Singer', 'Rapper', 'Live Band', 'Videographers']
const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Trincomalee']

const quickLinks = [
  { label: 'About Us',       sectionId: 'hero-section' },
  { label: 'Join as Artist', sectionId: 'join-section' },
  { label: 'How It Works',   sectionId: 'how-it-works' },
  { label: 'Contact',        sectionId: 'contact-section' },
  { label: 'Privacy Policy', sectionId: 'contact-section' },
]

const faqs = [
  {
    q: 'How do I book an artist on Performa?',
    a: 'Browse our verified artist listings, filter by category and city, then send a booking request. The artist will confirm availability and you wil receive a booking confirmation via email.',
  },
  {
    q: 'Are all artists on Performa verified?',
    a: 'Yes. Every artist goes through an identity and portfolio verification process before being listed on the platform. You can book with confidence.',
  },
  {
    q: 'What if the artist cancels last minute?',
    a: 'In the rare event of a cancellation, our team will assist you in finding a replacement artist. We also have a fair refund policy in place to protect customers.',
  },
  {
    q: 'What types of events can I book artists for?',
    a: 'You can book artists for weddings, corporate events, private parties, concerts, festivals, product launches and more across Sri Lanka.',
  },
  {
    q: 'Is there a booking fee for customers?',
    a: 'Performa charges a small service fee which is included transparently in the quoted price. There are no hidden charges.',
  },
  {
    q: 'Can I book artists outside of Colombo?',
    a: 'Absolutely. We have artists available across Sri Lanka including Kandy, Galle, Negombo, Trincomalee and many other cities.',
  },
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

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconMail = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
)

const IconPhone = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.15a16 16 0 006.29 6.29l1.51-1.51a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
)

const IconLocation = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
)

const IconArrowRight = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
)

const IconArrowLeft = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
)

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)

  return (
      <div className="border-b border-gray-200">
        <button
            onClick={() => setOpen(!open)}
            className="w-full flex justify-between items-center py-5 text-left text-gray-900 font-semibold text-[15px] hover:text-black transition-colors"
        >
          <span>{q}</span>
          <span
              className="text-[#E8194B] text-xl font-light flex-shrink-0 ml-4 transition-transform duration-300"
              style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)', display: 'inline-block' }}
          >
          +
        </span>
        </button>
        <div
            className="overflow-hidden transition-all duration-300 ease-in-out text-gray-500 text-sm leading-relaxed"
            style={{ maxHeight: open ? '200px' : '0px', paddingBottom: open ? '16px' : '0px' }}
        >
          {a}
        </div>
      </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Footer() {
  const [showContact, setShowContact] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const handleContactClick = () => {
    setShowContact(true)
    // Small delay so the slide animation completes, then scroll into view
    setTimeout(() => {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    try {
      const response = await api.post('/contact', formData)
      setStatus({ type: 'success', message: response.data.message })
      setFormData({ first_name: '', last_name: '', email: '', message: '' })
    } catch (err: any) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send message. Please try again later.' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
      <>
        {/* ══════════════════════════════════════════════════
        FAQ + CONTACT SLIDING SECTION
      ══════════════════════════════════════════════════ */}
        <section id="contact-section" className="w-full overflow-hidden">
          <div
              className="flex"
              style={{
                width: '200%',
                transform: showContact ? 'translateX(-50%)' : 'translateX(0)',
                transition: 'transform 0.55s cubic-bezier(0.77, 0, 0.175, 1)',
              }}
          >

            {/* ── Panel 1: FAQ ─────────────────────────────── */}
            <div className="w-1/2 bg-white px-16 py-20" style={{ flexShrink: 0 }}>
              <div className="max-w-3xl mx-auto">
                <h2 className="text-[42px] font-black text-gray-900 text-center leading-tight mb-3" style={{ letterSpacing: '-0.5px' }}>
                  Frequently Asked Questions
                </h2>
                <p className="text-center text-gray-400 text-sm mb-14">Got questions? We have answers.</p>

                <div className="border-t border-gray-200">
                  {faqs.map((f, i) => (
                      <FAQItem key={i} q={f.q} a={f.a} />
                  ))}
                </div>

                {/* CTA to slide to Contact */}
                <div className="flex justify-center mt-12">
                  <button
                      onClick={handleContactClick}
                      className="inline-flex items-center gap-3 bg-[#E8194B] hover:bg-[#c8133b] text-white font-bold text-sm px-7 py-4 rounded-xl transition-colors duration-200"
                  >
                    Still have a question? Contact us
                    <IconArrowRight />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Panel 2: Contact ─────────────────────────── */}
            <div className="w-1/2 bg-[#111] px-16 py-16" style={{ flexShrink: 0 }}>
              <div className="max-w-none w-full">

                {/* Back button */}
                <button
                    onClick={() => setShowContact(false)}
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-[#555] rounded-xl px-5 py-2.5 text-sm font-semibold mb-10 transition-all duration-200"
                >
                  <IconArrowLeft />
                  Back to FAQ
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

                  {/* Left: Info */}
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
                          <IconMail />
                        </div>
                        <span>infoperforma.lk@gmail.com</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                          <IconPhone />
                        </div>
                        <span>+94 70 403 5236</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400 text-sm">
                        <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                          <IconLocation />
                        </div>
                        <span>Kandy, Sri Lanka</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <form onSubmit={handleSubmit} className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a]">
                    <div className="flex flex-col gap-4">
                      {status && (
                        <div className={`p-4 rounded-xl text-sm font-semibold ${status.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {status.message}
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">First Name</label>
                          <input
                              type="text"
                              required
                              placeholder="John"
                              value={formData.first_name}
                              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Last Name</label>
                          <input
                              type="text"
                              required
                              placeholder="Doe"
                              value={formData.last_name}
                              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Email</label>
                        <input
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2 block">Message</label>
                        <textarea
                            rows={4}
                            required
                            placeholder="How can we help you?"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#E8194B] transition-colors resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#E8194B] hover:bg-[#c8133b] text-white font-bold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>

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