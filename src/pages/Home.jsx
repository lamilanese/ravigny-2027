import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { IconCheckCircle } from '../components/Icons.jsx'
import './Home.css'

const BACKEND_URL = 'https://ravigny-backend-ter.vercel.app/api/send-telegram'
const EVENT_ID = 'r27'

function autoResize(el) {
  if (!el) return
  const span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.position = 'absolute'
  span.style.whiteSpace = 'pre'
  const computed = window.getComputedStyle(el)
  span.style.fontSize = computed.fontSize
  span.style.fontFamily = computed.fontFamily
  span.style.fontWeight = computed.fontWeight
  span.style.letterSpacing = computed.letterSpacing
  span.style.padding = computed.padding

  if (el.tagName === 'SELECT') {
    span.textContent = el.options[el.selectedIndex]?.text || ''
  } else {
    span.textContent = el.value || el.placeholder || ''
  }

  document.body.appendChild(span)
  el.style.width = (span.offsetWidth + 8) + 'px'
  document.body.removeChild(span)
}

function Home() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    interest: 'présent(e)',
    countryCode: '+33',
    phone: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const firstNameRef = useRef(null)
  const lastNameRef = useRef(null)
  const phoneRef = useRef(null)
  const interestRef = useRef(null)
  const countryCodeRef = useRef(null)

  const resizeAll = useCallback(() => {
    autoResize(firstNameRef.current)
    autoResize(lastNameRef.current)
    autoResize(phoneRef.current)
    autoResize(interestRef.current)
    autoResize(countryCodeRef.current)
  }, [])

  useEffect(() => {
    document.fonts.ready.then(resizeAll)
  }, [resizeAll])

  useEffect(() => {
    resizeAll()
  }, [formData, resizeAll])

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    let formatted = ''
    for (let i = 0; i < digits.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += ' '
      formatted += digits[i]
    }
    return formatted
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phone' ? formatPhone(value) : value,
    }))
  }

  function normalizePhone(countryCode, phone) {
    const code = countryCode.replace('+', '')
    const digits = phone.replace(/\D/g, '')
    // Drop leading 0 if present (local format)
    const local = digits.startsWith('0') ? digits.slice(1) : digits
    return code + local
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // 1. Update RSVP in Supabase (primary action)
      const num = normalizePhone(formData.countryCode, formData.phone)
      const rsvp = formData.interest === 'présent(e)' ? 'yes' : 'no'

      const { data: contactRow } = await supabase
        .from('contact_info')
        .select('contact_id')
        .eq('num', num)
        .single()

      if (contactRow) {
        const { error: upsertErr } = await supabase
          .from('event_participants')
          .upsert({
            event_id: EVENT_ID,
            contact_id: contactRow.contact_id,
            invited: true,
            rsvp,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'event_id,contact_id' })

        if (upsertErr) throw upsertErr
      }

      // 2. Send Telegram notification (best-effort, don't block on failure)
      fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).catch(() => {})

      // If phone matched and RSVP is positive, go straight to CarnetDeVoyage
      if (contactRow && rsvp === 'yes') {
        navigate('/carnet-de-voyage', { state: { num } })
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const countryCodes = ['+33', '+32', '+352', '+49', '+41', '+39', '+34', '+376', '+377', '+31', '+44', '+353', '+351']

  return (
    <div className="home page-enter">
      {/* Hero — full viewport */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__title">Ravigny 2027</h1>
          <p className="home__dates">27 - 28 Juin 2026</p>
        </div>
        <div className="home__scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* About section */}
      <section className="home__about">
        <p className="home__about-text">
          Un week-end entre amis au cœur de la campagne normande.
          Musique, festin, grands feux et belles rencontres — le Charivari
          de Ravigny revient pour une nouvelle édition.
        </p>
      </section>

      {/* Form section */}
      <section className="home__form-section">
        <div className="home__container">
          {submitted ? (
            <div className="home__success">
              <div className="home__success-icon"><IconCheckCircle size={32} /></div>
              <h2 className="home__success-title">Réponse envoyée</h2>
              <p className="home__success-text">
                Merci ! Ta réponse a bien été enregistrée.
              </p>
              <div className="home__success-actions">
                <button className="home__nav-link" onClick={() => navigate('/carnet-de-voyage')}>
                  Carnet de Voyage
                </button>
                <button onClick={() => { setSubmitted(false); setFormData({ first_name: '', last_name: '', interest: 'présent(e)', countryCode: '+33', phone: '' }) }}>
                  Nouvelle réponse
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="home__prose-card card">
                <form onSubmit={handleSubmit}>
                  <p className="home__prose">
                    Je soussigné(e){' '}
                    <input
                      ref={firstNameRef}
                      type="text"
                      name="first_name"
                      className="inline-field home__inline-input"
                      placeholder="Simbad"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />{' '}
                    <input
                      ref={lastNameRef}
                      type="text"
                      name="last_name"
                      className="inline-field home__inline-input"
                      placeholder="Le Marin"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />{' '}
                    souhaite confirmer{' '}
                    <span className="home__select-wrap">
                      <select
                        ref={interestRef}
                        name="interest"
                        className="inline-field home__inline-select"
                        value={formData.interest}
                        onChange={handleChange}
                      >
                        <option value="présent(e)">ma présence</option>
                        <option value="absent(e)">mon absence</option>
                      </select>
                    </span>{' '}
                    au Charivari de Ravigny 2026.
                    Vous pouvez me joindre au{' '}
                    <span className="home__phone-group">
                      <select
                        ref={countryCodeRef}
                        name="countryCode"
                        className="inline-field home__inline-select"
                        value={formData.countryCode}
                        onChange={handleChange}
                      >
                        {countryCodes.map(code => (
                          <option key={code} value={code}>{code}</option>
                        ))}
                      </select>{' '}
                      <input
                        ref={phoneRef}
                        type="tel"
                        name="phone"
                        className="inline-field home__inline-input"
                        placeholder="06 12 34 56 78"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </span>.
                  </p>

                  <button type="submit" className="home__submit" disabled={submitting}>
                    {submitting ? 'Envoi en cours...' : 'Envoyer ma réponse'}
                  </button>

                  {error && (
                    <div className="home__message home__message--error">
                      {error}
                    </div>
                  )}
                </form>
              </div>

              <button className="home__nav-link" onClick={() => navigate('/carnet-de-voyage')}>
                Carnet de Voyage
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
