import { type ReactNode, useEffect, useState } from 'react'

interface AuthCardProps {
  children: ReactNode
}

const slides = [
  {
    image: '/person.png',
    quote: '"Lorem ipsum dolor sit amet, consectetur scing elit. Proin fringilla diam vitae ex posuere ultricies. In vel hendreri"',
  },
  {
    image: '/artist-2.png',
    quote: '"Music gives a soul to the universe, wings to the mind, flight to the imagination, and life to everything."',
  },
  {
    image: '/artist-3.png',
    quote: '"Where words fail, music speaks. Every stage is a new story waiting to be told and felt."',
  },
]

export default function AuthCard({ children }: AuthCardProps) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center relative px-4 py-6 sm:py-8"
      style={{ backgroundImage: "url('/bg-login.png')" }}
    >
      {/* Center Card */}
      <div className="bg-[#f2f2f2] rounded-2xl flex flex-col lg:flex-row w-full max-w-[860px] min-h-0 lg:min-h-[560px] overflow-hidden shadow-2xl">

        {/* Left: Form slot */}
        <div className="flex flex-col flex-1 px-5 sm:px-8 lg:px-12 py-6 sm:py-8">
          {children}
        </div>

        {/* Right: Image card — hidden on mobile/tablet portrait */}
        <div className="hidden lg:block w-[340px] p-4 flex-shrink-0">
          <div className="relative w-full h-full min-h-[480px] rounded-2xl overflow-hidden">

            {/* Slides */}
            {slides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: current === i ? 1 : 0 }}
              >
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for readability */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Quote overlay */}
                <div className="absolute bottom-8 left-0 right-0 px-4">
                  <p className="text-white text-xs leading-relaxed transition-opacity duration-500">
                    {slide.quote}
                  </p>
                </div>
              </div>
            ))}

            {/* Logo */}
            <div className="absolute top-4 left-4 z-10">
              <img src="/logo-light.png" alt="Logo" className="h-9 w-auto" />
            </div>

            {/* Dots indicator */}
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    current === i ? 'w-4 h-2 bg-white' : 'w-2 h-2 bg-white opacity-50'
                  }`}
                />
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-white/80">
        <a href="#" className="hover:text-white transition-colors">Contact</a>
        <span className="opacity-50 hidden sm:inline">|</span>
        <a href="#" className="hover:text-white transition-colors">Privacy</a>
        <span className="opacity-50 hidden sm:inline">|</span>
        <a href="#" className="hover:text-white transition-colors"><span className="sm:hidden">Terms</span><span className="hidden sm:inline">Terms & Conditions</span></a>
      </div>
    </div>
  )
}
