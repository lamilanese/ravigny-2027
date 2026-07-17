import { useMemo } from 'react'

const ARRIVAL_DAYS = [
  { date: '2026-06-25', label: 'Jeu', num: '25' },
  { date: '2026-06-26', label: 'Ven', num: '26' },
  { date: '2026-06-27', label: 'Sam', num: '27' },
]

const DEPARTURE_DAYS = [
  { date: '2026-06-27', label: 'Sam', num: '27' },
  { date: '2026-06-28', label: 'Dim', num: '28' },
  { date: '2026-06-29', label: 'Lun', num: '29' },
]

const TIMES = []
for (let h = 6; h <= 23; h++) {
  TIMES.push(`${h.toString().padStart(2, '0')}:00`)
  TIMES.push(`${h.toString().padStart(2, '0')}:30`)
}

function parseValue(value) {
  if (!value) return { date: '', time: '' }
  const [date, time] = value.split('T')
  return { date: date || '', time: time?.slice(0, 5) || '' }
}

export default function DateTimePicker({ value, onChange, name, variant = 'arrival', precise = false }) {
  const { date, time } = useMemo(() => parseValue(value), [value])
  const days = variant === 'departure' ? DEPARTURE_DAYS : ARRIVAL_DAYS

  function emit(newDate, newTime) {
    const d = newDate || date || days[0].date
    const t = newTime || time || '12:00'
    onChange({ target: { name, value: `${d}T${t}`, type: 'text' } })
  }

  return (
    <div className="dtp">
      <div className="dtp__days">
        {days.map(d => (
          <button
            key={d.date}
            type="button"
            className={`dtp__day ${date === d.date ? 'dtp__day--selected' : ''}`}
            onClick={() => emit(d.date, time)}
          >
            <span className="dtp__day-label">{d.label}</span>
            <span className="dtp__day-num">{d.num}</span>
          </button>
        ))}
      </div>
      {precise ? (
        <input
          type="time"
          className="dtp__time-input"
          value={time}
          onChange={e => emit(date, e.target.value)}
        />
      ) : (
        <select
          className="dtp__time"
          value={time}
          onChange={e => emit(date, e.target.value)}
        >
          <option value="" disabled>Heure</option>
          {TIMES.map(t => (
            <option key={t} value={t}>
              {t.replace(':', 'h')}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
