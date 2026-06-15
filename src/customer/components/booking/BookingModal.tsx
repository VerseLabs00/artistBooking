import { useState } from 'react'
import { initiateBooking } from '../../services/bookingService'

interface BookingModalProps {
  onClose: () => void
  artistProfileId: string
  artistName: string
  startingPrice: number
}

// ──────── Calendar helpers ────────
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
function getCalendarDays() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)
  return { days, year, month }
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

// ──────── Step indicator ────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-end gap-10 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex flex-col items-center gap-1">
          <span className={`text-base font-medium ${current === s ? 'text-red-600' : 'text-gray-400'}`}>{s}</span>
          <div className={`h-0.5 w-8 rounded-full ${current === s ? 'bg-red-600' : 'bg-transparent'}`} />
        </div>
      ))}
    </div>
  )
}

// ──────── Step 1: Date & Time ────────
function Step1({
  selectedDay, setSelectedDay, hour, setHour, period, setPeriod, onContinue,
}: {
  selectedDay: number; setSelectedDay: (d: number) => void
  hour: string; setHour: (h: string) => void
  period: string; setPeriod: (p: string) => void
  onContinue: () => void
}) {
  const { days, year, month } = getCalendarDays()
  const today = new Date().getDate()

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Set Date & Time</h2>
      <div className="flex gap-6 flex-1">
        {/* Calendar */}
        <div className="flex-1">
          <p className="text-center font-semibold text-gray-800 mb-4">{year} {MONTH_NAMES[month]}</p>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS.map((d, i) => <span key={i} className="text-xs text-gray-400 font-medium py-1">{d}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((day, i) => {
              const isPast = day !== null && day <= today
              const isSelected = day === selectedDay
              return (
                <button
                  key={i}
                  disabled={!day || isPast}
                  onClick={() => day && setSelectedDay(day)}
                  className={`h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors
                    ${!day ? '' : isPast ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-red-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  {day ?? ''}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time picker */}
        <div className="w-36 flex-shrink-0">
          <p className="font-semibold text-gray-800 mb-4">Pick a time</p>
          <div className="flex flex-col gap-3">
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
              <select value={hour} onChange={e => setHour(e.target.value)} className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer">
                {['06','07','08','09','10','11','12','01','02','03','04','05'].map(h => <option key={h}>{h}:00</option>)}
              </select>
            </div>
            <div className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white">
              <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full text-sm text-gray-700 outline-none bg-transparent cursor-pointer">
                <option>AM</option><option>PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          {selectedDay
            ? `${DAY_NAMES[new Date(new Date().getFullYear(), new Date().getMonth(), selectedDay).getDay()]}, ${MONTH_NAMES[new Date().getMonth()]} ${selectedDay} at ${hour} ${period}`
            : 'Select a date'}
        </p>
        <button
          onClick={onContinue}
          disabled={!selectedDay}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors"
        >
          Continue
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ──────── Step 2: Location & Event ────────
function Step2({
  venue, setVenue, eventType, setEventType, customerPhone, setCustomerPhone, specialNotes, setSpecialNotes,
  onPrev, onContinue,
}: {
  venue: string; setVenue: (v: string) => void
  eventType: string; setEventType: (t: string) => void
  customerPhone: string; setCustomerPhone: (p: string) => void
  specialNotes: string; setSpecialNotes: (n: string) => void
  onPrev: () => void; onContinue: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>

      <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Venue / Address</label>
          <input
            value={venue}
            onChange={e => setVenue(e.target.value)}
            placeholder="e.g. Colombo 2, Senanayaka Road"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Event Type</label>
          <input
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            placeholder="e.g. Wedding, Birthday, Corporate"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Your Phone Number</label>
          <input
            type="tel"
            value={customerPhone}
            onChange={e => setCustomerPhone(e.target.value)}
            placeholder="e.g. 077 123 4567"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 transition-colors"
          />
          <p className="text-[10px] text-gray-400 mt-1">So the artist can contact you about the event.</p>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Special Notes (optional)</label>
          <textarea
            value={specialNotes}
            onChange={e => setSpecialNotes(e.target.value)}
            placeholder="Any special requirements..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-gray-400 resize-none transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button onClick={onPrev} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={onContinue}
          disabled={!venue || !eventType || !customerPhone}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

// ──────── Step 3: Confirm & Pay ────────
function Step3({
  artistName, startingPrice, selectedDay, hour, period, venue, eventType,
  onPrev, onConfirm, loading, error,
}: {
  artistName: string; startingPrice: number
  selectedDay: number; hour: string; period: string
  venue: string; eventType: string
  onPrev: () => void; onConfirm: () => void
  loading: boolean; error: string
}) {
  const advance = Math.round(startingPrice * 0.30 * 100) / 100
  const balance = startingPrice - advance

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Booking</h2>

      <div className="flex-1 space-y-3">
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Artist</span><span className="font-medium text-gray-900">{artistName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{MONTH_NAMES[new Date().getMonth()]} {selectedDay}, {new Date().getFullYear()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium text-gray-900">{hour} {period}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium text-gray-900 text-right max-w-[200px]">{venue}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Event Type</span><span className="font-medium text-gray-900">{eventType}</span></div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Total Price</span><span className="font-medium text-gray-900">LKR {startingPrice.toLocaleString()}</span></div>
          <div className="flex justify-between text-red-600"><span>Advance (30%)</span><span className="font-bold">LKR {advance.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Balance Due</span><span className="font-medium text-gray-500">LKR {balance.toLocaleString()}</span></div>
        </div>

        <p className="text-xs text-gray-400 text-center px-2">
          You will be redirected to PayHere to complete the 30% advance payment securely.
        </p>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <button onClick={onPrev} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2"
        >
          {loading ? 'Processing...' : 'Pay with PayHere'}
        </button>
      </div>
    </div>
  )
}

// ──────── PayHere form redirect ────────
function submitToPayHere(payhere: Record<string, string>) {
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = payhere.checkout_url
  Object.entries(payhere).forEach(([key, value]) => {
    if (key === 'checkout_url') return
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()
}

const stepInfo = [
  { title: 'Set Date & Time', desc: 'Choose your preferred event date and start time.' },
  { title: 'Event Details', desc: 'Tell us where the event is and what type it is.' },
  { title: 'Confirm & Pay', desc: 'Review your booking and pay the 30% advance via PayHere.' },
]

// ──────── Main Modal ────────
export default function BookingModal({ onClose, artistProfileId, artistName, startingPrice }: BookingModalProps) {
  const [step, setStep] = useState(1)

  // Step 1 state
  const [selectedDay, setSelectedDay] = useState(0)
  const [hour, setHour] = useState('10:00')
  const [period, setPeriod] = useState('AM')

  // Step 2 state
  const [venue, setVenue] = useState('')
  const [eventType, setEventType] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')

  // Step 3 state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const info = stepInfo[step - 1]

  const handleConfirm = async () => {
    setError('')
    setLoading(true)
    try {
      const now = new Date()
      const eventDate = new Date(now.getFullYear(), now.getMonth(), selectedDay)
      const dateStr = eventDate.toISOString().split('T')[0]

      // Convert to 24h format for the API (H:i)
      let [h] = hour.split(':')
      let hNum = parseInt(h)
      if (period === 'PM' && hNum !== 12) hNum += 12
      if (period === 'AM' && hNum === 12) hNum = 0
      const timeStr = `${String(hNum).padStart(2, '0')}:00`

      const data = await initiateBooking({
        artist_profile_id: artistProfileId,
        event_date: dateStr,
        event_start_time: timeStr,
        event_type: eventType,
        venue,
        special_notes: specialNotes || undefined,
      })

      submitToPayHere(data.payhere as unknown as Record<string, string>)
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? Object.values(err?.response?.data?.errors ?? {})[0]
        ?? 'Something went wrong. Please try again.'
      setError(Array.isArray(msg) ? msg[0] : String(msg))
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#f2f2f2] rounded-2xl flex w-[880px] max-w-[95vw] overflow-hidden shadow-2xl min-h-[500px]">

        {/* Left panel */}
        <div className="w-64 flex-shrink-0 bg-[#ebebeb] px-6 py-6 flex flex-col">
          <StepIndicator current={step} />

          <div className="flex flex-col items-center text-center flex-1 justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-red-600">{step}</span>
            </div>
            <h3 className="text-base font-bold text-gray-900 mt-3">{info.title}</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">{info.desc}</p>
          </div>

          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 mt-6 text-center w-full transition-colors">
            Cancel
          </button>
        </div>

        {/* Right panel */}
        <div className="flex-1 bg-white px-8 py-6">
          {step === 1 && (
            <Step1
              selectedDay={selectedDay} setSelectedDay={setSelectedDay}
              hour={hour} setHour={setHour}
              period={period} setPeriod={setPeriod}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              venue={venue} setVenue={setVenue}
              eventType={eventType} setEventType={setEventType}
              customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
              specialNotes={specialNotes} setSpecialNotes={setSpecialNotes}
              onPrev={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              artistName={artistName}
              startingPrice={startingPrice}
              selectedDay={selectedDay}
              hour={hour}
              period={period}
              venue={venue}
              eventType={eventType}
              onPrev={() => setStep(2)}
              onConfirm={handleConfirm}
              loading={loading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  )
}
