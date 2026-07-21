import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { IconCheckCircle } from '../components/Icons.jsx'
import './Home.css'

const BACKEND_URL = 'https://ravigny-backend-ter.vercel.app/api/send-telegram'
const EVENT_ID = 'r27'

const TRANSLATIONS = {
  fr: {
    title: 'Ravigny 2027',
    dates: '27 - 28 Juin 2026',
    about: 'Un week-end entre amis au c\u0153ur de la campagne normande. Musique, festin, grands feux et belles rencontres \u2014 le Charivari de Ravigny revient pour une nouvelle \u00e9dition.',
    prose1: 'Je soussign\u00e9(e)',
    prose2: 'souhaite confirmer',
    prose3: 'au Charivari de Ravigny 2026. Vous pouvez me joindre au',
    presenceOption: 'ma pr\u00e9sence',
    absenceOption: 'mon absence',
    presenceValue: 'pr\u00e9sent(e)',
    absenceValue: 'absent(e)',
    firstNamePlaceholder: 'Simbad',
    lastNamePlaceholder: 'Le Marin',
    phonePlaceholder: '06 12 34 56 78',
    submitting: 'Envoi en cours...',
    submit: 'Envoyer ma r\u00e9ponse',
    successTitle: 'R\u00e9ponse envoy\u00e9e',
    successText: 'Merci ! Ta r\u00e9ponse a bien \u00e9t\u00e9 enregistr\u00e9e.',
    carnetLink: 'Carnet de Voyage',
    newResponse: 'Nouvelle r\u00e9ponse',
    defaultError: 'Veuillez r\u00e9essayer.',
  },
  en: {
    title: 'Ravigny 2027',
    dates: 'June 27 - 28, 2026',
    about: 'A weekend with friends in the heart of the Norman countryside. Music, feasting, bonfires and wonderful encounters \u2014 the Charivari de Ravigny is back for a new edition.',
    prose1: 'I, the undersigned,',
    prose2: 'wish to confirm',
    prose3: 'at the Charivari de Ravigny 2026. You can reach me at',
    presenceOption: 'my attendance',
    absenceOption: 'my absence',
    presenceValue: 'pr\u00e9sent(e)',
    absenceValue: 'absent(e)',
    firstNamePlaceholder: 'Sinbad',
    lastNamePlaceholder: 'The Sailor',
    phonePlaceholder: '06 12 34 56 78',
    submitting: 'Sending...',
    submit: 'Send my response',
    successTitle: 'Response sent',
    successText: 'Thank you! Your response has been recorded.',
    carnetLink: 'Travel Book',
    newResponse: 'New response',
    defaultError: 'Please try again.',
  },
}

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
  const [lang, setLang] = useState('fr')
  const t = TRANSLATIONS[lang]
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
  }, [formData, lang, resizeAll])

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
      setError(err.message || t.defaultError)
    } finally {
      setSubmitting(false)
    }
  }

  const countryCodes = ['+33', '+32', '+352', '+49', '+41', '+39', '+34', '+376', '+377', '+31', '+44', '+353', '+351']

  return (
    <div className="home page-enter">
      <button
        type="button"
        className="home__lang-btn"
        onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
        title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
      >
        {lang === 'fr' ? 'EN' : 'FR'}
      </button>

      {/* Hero — full viewport */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1 className="home__title">{t.title}</h1>
          <p className="home__dates">{t.dates}</p>
        </div>
        <div className="home__scroll-hint" aria-hidden="true">
          <span />
        </div>
      </section>

      {/* About section */}
      <section className="home__about">
        <p className="home__about-text">
          {t.about}
        </p>
      </section>

      {/* Form section */}
      <section className="home__form-section">
        <div className="home__container">
          {submitted ? (
            <div className="home__success">
              <div className="home__success-icon"><IconCheckCircle size={32} /></div>
              <h2 className="home__success-title">{t.successTitle}</h2>
              <p className="home__success-text">
                {t.successText}
              </p>
              <div className="home__success-actions">
                <button className="home__nav-link" onClick={() => navigate('/carnet-de-voyage')}>
                  {t.carnetLink}
                </button>
                <button onClick={() => { setSubmitted(false); setFormData({ first_name: '', last_name: '', interest: 'présent(e)', countryCode: '+33', phone: '' }) }}>
                  {t.newResponse}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="home__prose-card card">
                <form onSubmit={handleSubmit}>
                  <p className="home__prose">
                    {t.prose1}{' '}
                    <input
                      ref={firstNameRef}
                      type="text"
                      name="first_name"
                      className="inline-field home__inline-input"
                      placeholder={t.firstNamePlaceholder}
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />{' '}
                    <input
                      ref={lastNameRef}
                      type="text"
                      name="last_name"
                      className="inline-field home__inline-input"
                      placeholder={t.lastNamePlaceholder}
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                    />{' '}
                    {t.prose2}{' '}
                    <span className="home__select-wrap">
                      <select
                        ref={interestRef}
                        name="interest"
                        className="inline-field home__inline-select"
                        value={formData.interest}
                        onChange={handleChange}
                      >
                        <option value="présent(e)">{t.presenceOption}</option>
                        <option value="absent(e)">{t.absenceOption}</option>
                      </select>
                    </span>{' '}
                    {t.prose3}{' '}
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
                        placeholder={t.phonePlaceholder}
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </span>.
                  </p>

                  <button type="submit" className="home__submit" disabled={submitting}>
                    {submitting ? t.submitting : t.submit}
                  </button>

                  {error && (
                    <div className="home__message home__message--error">
                      {error}
                    </div>
                  )}
                </form>
              </div>

              <button className="home__nav-link" onClick={() => navigate('/carnet-de-voyage')}>
                {t.carnetLink}
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home
