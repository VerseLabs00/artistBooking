import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { initiateBooking } from '../../services/bookingService'
import { getArtistCalendar, type CalendarEntry } from '../../services/discoveryService'

interface BookingModalProps {
  onClose: () => void
  artistProfileId: string
  artistName: string
  fullPrice: number
  advance: number
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getCalendarCells(viewDate: Date): (number | null)[] {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)
  return cells
}

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

function Step1({
  artistProfileId,
  selectedDateKey,
  setSelectedDateKey,
  hour,
  setHour,
  period,
  setPeriod,
  onContinue,
}: {
  artistProfileId: string
  selectedDateKey: string
  setSelectedDateKey: (key: string) => void
  hour: string
  setHour: (h: string) => void
  period: string
  setPeriod: (p: string) => void
  onContinue: () => void
}) {
  const [viewDate, setViewDate] = useState(() => new Date())
  const [entries, setEntries] = useState<CalendarEntry[]>([])
  const [loadingCalendar, setLoadingCalendar] = useState(true)

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const cells = useMemo(() => getCalendarCells(viewDate), [viewDate])

  const todayKey = toDateKey(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>()
    for (const entry of entries) {
      const list = map.get(entry.date) ?? []
      list.push(entry)
      map.set(entry.date, list)
    }
    return map
  }, [entries])

  useEffect(() => {
    let cancelled = false
    setLoadingCalendar(true)
    getArtistCalendar(artistProfileId, toMonthKey(viewDate))
      .then(data => { if (!cancelled) setEntries(data) })
      .catch(() => { if (!cancelled) setEntries([]) })
      .finally(() => { if (!cancelled) setLoadingCalendar(false) })
    return () => { cancelled = true }
  }, [artistProfileId, viewDate])

  const goMonth = (delta: number) => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
    setSelectedDateKey('')
  }

  const selectedParts = selectedDateKey ? selectedDateKey.split('-').map(Number) : null
  const selectedDay = selectedParts ? selectedParts[2] : 0

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-2">Set Date & Time</h2>
      <p className="text-xs text-gray-500 mb-4">Dates marked in red are already booked and cannot be selected.</p>

      <div className="flex gap-6 flex-1">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={() => goMonth(-1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <p className="font-semibold text-gray-800">{MONTH_NAMES[month]} {year}</p>
            <button type="button" onClick={() => goMonth(1)} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>

          {loadingCalendar ? (
            <p className="text-xs text-gray-400 text-center py-6">Loading availability...</p>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {WEEKDAYS.map((d, i) => <span key={i} className="text-xs text-gray-400 font-medium py-1">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {cells.map((day, i) => {
                  if (!day) return <div key={`empty-${i}`} className="h-9" />

                  const dateKey = toDateKey(year, month, day)
                  const isPast = dateKey < todayKey
                  const dayEntries = entriesByDate.get(dateKey) ?? []
                  const isBooked = dayEntries.length > 0
                  const isSelected = selectedDateKey === dateKey
                  const isDisabled = isPast || isBooked

                  return (
                    <button
                      key={dateKey}
                      type="button"
                      disabled={isDisabled}
                      title={isBooked ? dayEntries.map(e => e.title).join(', ') : undefined}
                      onClick={() => {
                        if (!isDisabled) setSelectedDateKey(dateKey)
                      }}
                      className={`h-9 w-9 mx-auto rounded-full text-sm font-medium transition-colors relative
                        ${isSelected ? 'bg-red-600 text-white' : isBooked ? 'bg-red-100 text-red-600 cursor-not-allowed line-through' : isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                    >
                      {day}
                      {isBooked && !isSelected && (
                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

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
          {selectedDateKey
            ? `${DAY_NAMES[new Date(year, month, selectedDay).getDay()]}, ${MONTH_NAMES[month]} ${selectedDay} at ${hour} ${period}`
            : 'Select an available date'}
        </p>
        <button
          onClick={onContinue}
          disabled={!selectedDateKey}
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
          disabled={!venue || !eventType || !customerPhone.trim()}
          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )
}

function Step3({
   artistName, fullPrice, advance, selectedDateKey, hour, period, venue, eventType, customerPhone,
   onPrev, onConfirm, loading, error,
 }: {
   artistName: string; fullPrice: number; advance: number
   selectedDateKey: string; hour: string; period: string
   venue: string; eventType: string; customerPhone: string
   onPrev: () => void; onConfirm: () => void
   loading: boolean; error: string
 }) {
  const [commissionRate, setCommissionRate] = useState(15)
  const safeFullPrice = Number(fullPrice) || 0
  const safeAdvance = Number(advance) || 0
  const platformFee = +(safeAdvance * commissionRate / 100).toFixed(2)
  const totalPayment = +(safeAdvance + platformFee).toFixed(2)
  const balance = safeFullPrice - safeAdvance
   const [y, m, d] = selectedDateKey.split('-').map(Number)

   useEffect(() => {
     // Fetch commission rate from public settings endpoint
     fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/settings`)
       .then(res => res.json())
       .then(data => setCommissionRate(data.commission_rate || 15))
       .catch(() => setCommissionRate(15))
   }, [])

   return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Confirm Booking</h2>

      <div className="flex-1 space-y-3">
        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Artist</span><span className="font-medium text-gray-900">{artistName}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium text-gray-900">{MONTH_NAMES[m - 1]} {d}, {y}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="font-medium text-gray-900">{hour} {period}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium text-gray-900 text-right max-w-[200px]">{venue}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Event Type</span><span className="font-medium text-gray-900">{eventType}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium text-gray-900">{customerPhone}</span></div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-gray-500">Total Price</span><span className="font-medium text-gray-900">LKR {safeFullPrice.toLocaleString()}</span></div>
          <div className="flex justify-between text-red-600"><span>Advance</span><span className="font-bold">LKR {safeAdvance.toLocaleString()}</span></div>
          <div className="flex justify-between text-blue-600"><span>Platform Booking Fee ({commissionRate}%)</span><span className="font-bold">LKR {platformFee.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total to Pay Now</span><span>LKR {totalPayment.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Balance Due</span><span className="font-medium text-gray-500">LKR {balance.toLocaleString()}</span></div>
        </div>

        <p className="text-xs text-gray-400 text-center px-2">
          You will be redirected to PayHere to complete the payment securely.
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
   { title: 'Confirm & Pay', desc: 'Review your booking and pay the advance plus platform fee via PayHere.' },
 ]

export default function BookingModal({ onClose, artistProfileId, artistName, fullPrice, advance }: BookingModalProps) {
  const [step, setStep] = useState(1)

  const [selectedDateKey, setSelectedDateKey] = useState('')
  const [hour, setHour] = useState('10:00')
  const [period, setPeriod] = useState('AM')

  const [venue, setVenue] = useState('')
  const [eventType, setEventType] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const info = stepInfo[step - 1]

  const handleConfirm = async () => {
    setError('')
    setLoading(true)
    try {
      let [h] = hour.split(':')
      let hNum = parseInt(h)
      if (period === 'PM' && hNum !== 12) hNum += 12
      if (period === 'AM' && hNum === 12) hNum = 0
      const timeStr = `${String(hNum).padStart(2, '0')}:00`

      const data = await initiateBooking({
        artist_profile_id: artistProfileId,
        event_date: selectedDateKey,
        event_start_time: timeStr,
        event_type: eventType,
        venue,
        customer_phone: customerPhone.trim(),
        special_notes: specialNotes || undefined,
      })

      submitToPayHere(data.payhere as unknown as Record<string, string>)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errors = axiosErr.response?.data?.errors
      const msg = errors
        ? Object.values(errors).flat()[0]
        : axiosErr.response?.data?.message ?? 'Something went wrong. Please try again.'
      setError(String(msg))
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#f2f2f2] rounded-2xl flex flex-col md:flex-row w-full max-w-[95vw] md:max-w-[880px] mx-2 sm:mx-0 overflow-hidden shadow-2xl min-h-0 md:min-h-[500px] max-h-[95vh]">

        <div className="w-full md:w-64 flex-shrink-0 bg-[#ebebeb] px-4 sm:px-6 py-3 sm:py-6 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0">
          <div className="hidden md:block">
            <StepIndicator current={step} />
          </div>

          <div className="flex flex-row md:flex-col items-center text-center flex-1 justify-center gap-3 md:gap-0 min-w-0">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-100 flex items-center justify-center md:mb-4 shrink-0">
              <span className="text-lg md:text-2xl font-bold text-red-600">{step}</span>
            </div>
            <div className="text-left md:text-center min-w-0">
              <h3 className="text-sm md:text-base font-bold text-gray-900 md:mt-3 truncate">{info.title}</h3>
              <p className="text-[11px] md:text-xs text-gray-500 mt-1 md:mt-2 leading-relaxed line-clamp-2 md:line-clamp-none">{info.desc}</p>
            </div>
          </div>

          <button onClick={onClose} className="hidden md:block text-sm text-gray-500 hover:text-gray-700 mt-6 text-center w-full transition-colors">
            Cancel
          </button>
        </div>

        <div className="flex-1 bg-white px-4 sm:px-8 py-4 sm:py-6 overflow-y-auto relative">
          <button
            onClick={onClose}
            className="md:hidden absolute top-3 right-3 text-xs text-gray-500 hover:text-gray-700 font-semibold z-10"
          >
            Cancel
          </button>
          {step === 1 && (
            <Step1
              artistProfileId={artistProfileId}
              selectedDateKey={selectedDateKey}
              setSelectedDateKey={setSelectedDateKey}
              hour={hour}
              setHour={setHour}
              period={period}
              setPeriod={setPeriod}
              onContinue={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              venue={venue}
              setVenue={setVenue}
              eventType={eventType}
              setEventType={setEventType}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              specialNotes={specialNotes}
              setSpecialNotes={setSpecialNotes}
              onPrev={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <Step3
              artistName={artistName}
              fullPrice={fullPrice}
              advance={advance}
              selectedDateKey={selectedDateKey}
              hour={hour}
              period={period}
              venue={venue}
              eventType={eventType}
              customerPhone={customerPhone}
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
