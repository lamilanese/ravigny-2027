import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import DateTimePicker from '../components/DateTimePicker.jsx'
import { IconArrowLeft, IconCheck, IconTrain, IconCar, IconCarpool, IconTransport, IconSuitcase, IconEuro, IconCheckCircle } from '../components/Icons.jsx'
import './CarnetDeVoyage.css'

const EVENT_ID = 'r27'

const TRANSLATIONS = {
  fr: {
    retour: 'Retour',
    title: 'Carnet de Voyage',
    saving: 'Sauvegarde...',
    save: 'Sauvegarder',
    phoneLabel: 'Entre ton numéro de téléphone pour accéder à ton carnet',
    phonePlaceholder: '06 12 34 56 78',
    loading: 'Chargement...',
    validate: 'Valider',
    phoneError: 'Veuillez entrer un numéro de téléphone valide.',
    notFound: 'Aucune information trouvée pour ce numéro. Veuillez vérifier et réessayer.',
    notConfirmed: 'Veuillez confirmer votre présence.',
    connectionError: 'Erreur de connexion au serveur. Veuillez réessayer.',
    saveSuccess: 'Modifications sauvegardées !',
    saveError: 'Erreur !',
    saveConnectionError: 'Erreur de connexion au serveur.',
    unsavedConfirm: 'Tu as des modifications non sauvegardées. Quitter quand même ?',
    greetingF: 'Chère',
    greetingM: 'Cher',
    introText: 'Entre pierres et forêts, nous vous avons préparé un refuge de lumière, une parenthèse suspendue, pour célébrer vos histoires, vos noms, et tout ce qui vous relie à travers les siècles.',
    date: 'Date',
    dateValue: 'du vendredi 26 juin à partir de 19 heures au dimanche 28 juin à 19 heures',
    location: 'Lieu',
    whatsapp: 'Rejoindre le groupe WhatsApp',
    transports: 'Transports',
    address: 'Adresse',
    nearestStation: 'Gare la plus proche',
    stationDetail: '(17 min en voiture)',
    outbound: 'Trajet aller',
    driver: 'Conducteur',
    carpool: 'Covoiturage',
    train: 'Train',
    spotsLabel: 'Nombre de places (conducteur inclus)',
    arrivalTimeTrain: "Heure prévue d'arrivée en gare d'Alençon",
    arrivalTimeOther: 'Je suis disponible à partir de',
    departurePlaceDriver: 'Lieu de départ de la voiture',
    departurePlaceOther: 'Lieu de départ',
    returnTrip: 'Trajet retour',
    departureTimeTrain: 'Heure prévue de départ',
    departureTimeOther: 'Je souhaite être rentré(e) avant le',
    arrivalPlace: "Lieu d'arrivée",
    preparations: 'Préparatifs',
    itemsToPack: 'Affaires à prévoir',
    essentials: 'Indispensables',
    optional: 'Optionnels (mais encouragés !)',
    matCheckbox: "J'apporterai un tapis de sol ou matelas gonflable",
    otherInfo: 'Autres informations',
    dietaryCheckbox: "J'ai des restrictions alimentaires",
    dietaryPlaceholder: 'Végétarien, sans gluten, allergie aux noix...',
    comments: 'Commentaires',
    commentsPlaceholder: 'Toute information utile pour les organisateurs.',
    financialTitle: 'Participation financière',
    financialPaid: 'Participation financière bien reçue. Merci !',
    financialIntro: "Nous vous proposons deux montants selon vos possibilités. Ce montant couvrira l'intégralité des repas et des boissons.",
    sendByWero: 'Envoyer par Wero',
    reducedRate: 'Tarif réduit',
    fullRate: 'Tarif plein',
    otherAmount: 'Autre montant : ',
    preferTransfer: 'Vous préférez faire un virement ?',
    saved: 'Sauvegardé !',
    copy: 'Copier',
    copied: 'Copié !',
    essentialItems: ['Sac de couchage', 'Costume', 'Affaires chaudes', 'Maillot et serviette de bain', 'Affaires salissables'],
    optionalItems: ['Lampe torche', 'Appareil photo', 'Instrument de musique'],
  },
  en: {
    retour: 'Back',
    title: 'Travel Book',
    saving: 'Saving...',
    save: 'Save',
    phoneLabel: 'Enter your phone number to access your travel book',
    phonePlaceholder: '06 12 34 56 78',
    loading: 'Loading...',
    validate: 'Submit',
    phoneError: 'Please enter a valid phone number.',
    notFound: 'No information found for this number. Please check and try again.',
    notConfirmed: 'You haven\'t confirmed your attendance yet. Please fill in the form on the home page first!',
    connectionError: 'Server connection error. Please try again.',
    saveSuccess: 'Changes saved!',
    saveError: 'Error!',
    saveConnectionError: 'Server connection error.',
    unsavedConfirm: 'You have unsaved changes. Leave anyway?',
    greetingF: 'Dear',
    greetingM: 'Dear',
    introText: 'Between stones and forests, we have prepared a refuge of light for you, a suspended parenthesis, to celebrate your stories, your names, and everything that connects you across the centuries.',
    date: 'Date',
    dateValue: 'from Friday June 26 at 7 PM to Sunday June 28 at 7 PM',
    location: 'Location',
    whatsapp: 'Join the WhatsApp group',
    transports: 'Transport',
    address: 'Address',
    nearestStation: 'Nearest train station',
    stationDetail: '(17 min by car)',
    outbound: 'Outbound trip',
    driver: 'Driver',
    carpool: 'Carpool',
    train: 'Train',
    spotsLabel: 'Number of seats (driver included)',
    arrivalTimeTrain: 'Expected arrival time at Alençon station',
    arrivalTimeOther: 'I am available from',
    departurePlaceDriver: 'Car departure location',
    departurePlaceOther: 'Departure location',
    returnTrip: 'Return trip',
    departureTimeTrain: 'Expected departure time',
    departureTimeOther: 'I would like to be back before',
    arrivalPlace: 'Arrival location',
    preparations: 'Packing',
    itemsToPack: 'Things to bring',
    essentials: 'Essentials',
    optional: 'Optional (but encouraged!)',
    matCheckbox: 'I will bring a sleeping mat or air mattress',
    otherInfo: 'Other information',
    dietaryCheckbox: 'I have dietary restrictions',
    dietaryPlaceholder: 'Vegetarian, gluten-free, nut allergy...',
    comments: 'Comments',
    commentsPlaceholder: 'Any useful information for the organizers.',
    financialTitle: 'Financial contribution',
    financialPaid: 'Financial contribution received. Thank you!',
    financialIntro: 'We offer two amounts depending on your means. This amount will cover all meals and drinks.',
    sendByWero: 'Send via Wero',
    reducedRate: 'Reduced rate',
    fullRate: 'Full rate',
    otherAmount: 'Other amount: ',
    preferTransfer: 'Prefer a bank transfer?',
    saved: 'Saved!',
    copy: 'Copy',
    copied: 'Copied!',
    essentialItems: ['Sleeping bag', 'Costume/Suit', 'Warm clothes', 'Swimsuit and towel', 'Clothes that can get dirty'],
    optionalItems: ['Flashlight', 'Camera', 'Musical instrument'],
  },
}

function CarnetDeVoyage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState('fr')
  const t = TRANSLATIONS[lang]
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [contact, setContact] = useState(null) // { contact_id, f_name, m_f }
  const [participation, setParticipation] = useState(null) // event_participants row or null (new)
  const [unsaved, setUnsaved] = useState(false)
  const [hasAllergies, setHasAllergies] = useState(false)
  const [returnTravelExplicit, setReturnTravelExplicit] = useState(false)
  const [arrivalPlaceExplicit, setArrivalPlaceExplicit] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [feedback, setFeedback] = useState(null) // 'saved' | 'save-error' | 'copied'
  const [formData, setFormData] = useState({
    travel: '',
    returnTravel: '',
    arrivalDateTime: '',
    departureDateTime: '',
    departurePlace: '',
    arrivalPlace: '',
    spotsNumber: '5',
    driverName: '',
    mat: false,
    allergies: '',
    otherInfo: '',
  })

  // Derived — keeps JSX references like `participant.xxx` working via a compat shim
  const participant = contact ? {
    name: contact.f_name,
    mf: contact.m_f,
    payed: participation?.payed != null,
  } : null

  function normalizePhone(raw) {
    let n = raw.replace(/[\s\-().]/g, '')
    if (n.startsWith('+')) n = n.slice(1)
    // Local number starting with 0 → assume French, replace with 33
    if (n.startsWith('0')) n = '33' + n.slice(1)
    return n
  }

  async function checkPhone() {
    const cleaned = normalizePhone(phone)
    if (cleaned.length < 8) {
      setError(t.phoneError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 1. Look up contact by phone number
      const { data: contactRow, error: contactErr } = await supabase
        .from('contact_info')
        .select('contact_id, f_name, m_f, allergies')
        .eq('num', cleaned)
        .single()

      if (contactErr || !contactRow) {
        setError(t.notFound)
        return
      }

      // 2. Look up event participation
      const { data: partRow } = await supabase
        .from('event_participants')
        .select('*')
        .eq('contact_id', contactRow.contact_id)
        .eq('event_id', EVENT_ID)
        .single()

      if (!partRow || partRow.rsvp !== 'yes') {
        setError(t.notConfirmed)
        return
      }

      setContact(contactRow)
      setParticipation(partRow)

      const dp = partRow?.departure_place || ''
      const ap = partRow?.arrival_place || ''
      const travel = partRow?.arrival_travel || ''
      const returnTravel = partRow?.departure_travel || travel
      setArrivalPlaceExplicit(ap !== '' && ap !== dp)
      setReturnTravelExplicit(returnTravel !== '' && returnTravel !== travel)
      setHasAllergies(!!(contactRow.allergies))
      setFormData({
        travel,
        returnTravel,
        arrivalDateTime: partRow?.arrival_datetime || '',
        departureDateTime: partRow?.departure_datetime || '',
        departurePlace: dp,
        arrivalPlace: ap,
        spotsNumber: String(partRow?.spots_number || 5),
        driverName: partRow?.driver_name || '',
        mat: partRow?.mat || false,
        allergies: contactRow.allergies || '',
        otherInfo: partRow?.comments || '',
      })
      setUnsaved(false)
    } catch {
      setError(t.connectionError)
    } finally {
      setLoading(false)
    }
  }

  function handleFormChange(e) {
    const { name, value, type, checked } = e.target
    if (name === 'arrivalPlace') {
      setArrivalPlaceExplicit(true)
    }
    setFormData(prev => {
      const update = { ...prev, [name]: type === 'checkbox' ? checked : value }
      if (name === 'departurePlace' && !arrivalPlaceExplicit) {
        update.arrivalPlace = value
      }
      return update
    })
    setUnsaved(true)
  }

  function selectTravel(value) {
    setFormData(prev => {
      let returnTravel
      if (value === 'car-driver') {
        // Driver must drive back
        returnTravel = 'car-driver'
      } else if (!returnTravelExplicit || prev.returnTravel === 'car-driver') {
        // Follow outbound if user hasn't explicitly chosen, or reset from car-driver
        returnTravel = value
      } else {
        returnTravel = prev.returnTravel
      }
      return { ...prev, travel: value, returnTravel }
    })
    setUnsaved(true)
  }

  function showFeedback(key) {
    setFeedback(key)
    setTimeout(() => setFeedback(prev => prev === key ? null : prev), 2000)
  }

  async function saveData() {
    setSaving(true)
    try {
      // 1. Upsert event_participants
      const { error: partErr } = await supabase
        .from('event_participants')
        .upsert({
          event_id: EVENT_ID,
          contact_id: contact.contact_id,
          arrival_travel: formData.travel || null,
          departure_travel: formData.returnTravel || formData.travel || null,
          arrival_datetime: formData.arrivalDateTime || null,
          departure_datetime: formData.departureDateTime || null,
          departure_place: formData.departurePlace || null,
          arrival_place: formData.arrivalPlace || null,
          spots_number: formData.spotsNumber ? Number(formData.spotsNumber) : null,
          driver_name: formData.driverName || null,
          mat: formData.mat,
          comments: formData.otherInfo || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'event_id,contact_id' })

      if (partErr) throw partErr

      // 2. Update allergies on contact_info
      const { error: contactErr } = await supabase
        .from('contact_info')
        .update({ allergies: formData.allergies || null })
        .eq('contact_id', contact.contact_id)

      if (contactErr) throw contactErr

      setUnsaved(false)
      showFeedback('saved')
    } catch {
      showFeedback('save-error')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    if (unsaved && !window.confirm(t.unsavedConfirm)) {
      return
    }
    navigate('/')
  }

  const isDriver = formData.travel === 'car-driver'
  const isTrain = formData.travel === 'train'
  const isDunno = formData.travel === 'dunno'
  const showLocations = isDriver || isDunno

  const effectiveReturn = formData.returnTravel || formData.travel
  const isReturnDriver = effectiveReturn === 'car-driver'
  const isReturnTrain = effectiveReturn === 'train'
  const isReturnDunno = effectiveReturn === 'dunno'
  const showReturnLocations = isReturnDriver || isReturnDunno

  // Progress tracking
  const transportDone = formData.travel && formData.arrivalDateTime
  const affairesDone = formData.allergies !== '' || formData.mat

  return (
    <div className="cdv page-enter">
      {/* ===== STICKY HEADER ===== */}
      <header className={`cdv__header ${participant ? 'cdv__header--solid' : ''}`}>
        {participant ? (
          <div className="cdv__header-top">
            <button onClick={handleBack} className="cdv__header-btn cdv__back">
              <IconArrowLeft size={14} /> <span className="cdv__back-label">{t.retour}</span>
            </button>
            <h1 className="cdv__title">{t.title}</h1>
            <div className="cdv__header-actions">
              <button
                onClick={saveData}
                disabled={(!unsaved && feedback !== 'saved') || saving}
                className={`cdv__header-btn cdv__save-btn ${feedback === 'saved' ? 'cdv__save-btn--confirmed' : feedback === 'save-error' ? 'cdv__save-btn--error' : unsaved ? 'cdv__save-btn--active' : 'cdv__save-btn--idle'}`}
              >
                <span className="cdv__save-label">{saving ? t.saving : feedback === 'saved' ? t.saved : feedback === 'save-error' ? t.saveError : t.save}</span>
                <IconCheck size={14} className="cdv__save-icon" />
              </button>
              <button
                type="button"
                className="cdv__header-btn cdv__lang-btn"
                onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
                title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
              >
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>
            </div>
          </div>
        ) : (
          <div className="cdv__header-top">
            <button onClick={handleBack} className="cdv__header-btn cdv__back">
              <IconArrowLeft size={14} /> <span className="cdv__back-label">{t.retour}</span>
            </button>
            <h1 className="cdv__title">{t.title}</h1>
            <div className="cdv__header-actions">
              <button
                type="button"
                className="cdv__header-btn cdv__lang-btn"
                onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')}
                title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
              >
                {lang === 'fr' ? 'EN' : 'FR'}
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ===== PRE-LOGIN ===== */}
      {!participant && (
        <div className="cdv__login-area">
          <div className="cdv__phone-section">
            <p className="cdv__phone-label">{t.phoneLabel}</p>
            <div className="cdv__phone-row">
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && checkPhone()}
                className="cdv__phone-input"
              />
              <button onClick={checkPhone} disabled={loading} className="cdv__phone-btn">
                {loading ? t.loading : t.validate}
              </button>
            </div>
          </div>
          {error && <div className="cdv__error">{error}</div>}
        </div>
      )}

      {/* ===== MATRIX CONTENT ===== */}
      {participant && (
        <main className="cdv__main">
          {/* LEFT COLUMN */}
          <div className="cdv__column">
            {/* Intro */}
            <section className="cdv__widget cdv__widget--no-fade">
              <p className="cdv__intro-text">
                <span className="cdv__greeting">
                  {participant.mf?.trim().toLowerCase() === 'f' ? t.greetingF : t.greetingM} {participant.name},
                </span><br />
                {t.introText}
              </p>
              <hr className="cdv__divider" />
              <p className="cdv__intro-text">
                <strong>{t.date} :</strong> {t.dateValue}<br />
                <strong>{t.location} :</strong>{' '}
                <a href="https://maps.app.goo.gl/bTb3fVHTLFH2Dcjp8">La Closerie du Champ-Hervé</a>
              </p>
              <a
                href="https://chat.whatsapp.com/TODO"
                target="_blank"
                rel="noopener noreferrer"
                className="cdv__whatsapp-btn"
              >
                {t.whatsapp}
              </a>
            </section>

            {/* Transports */}
            <section className="cdv__widget">
              <div className="cdv__widget-header">
                <div className="cdv__widget-icon"><IconTransport size={18} /></div>
                <h2 className="cdv__widget-title">{t.transports}</h2>
              </div>

              <p className="cdv__intro-text">
                {t.address} : <a href="https://maps.app.goo.gl/bTb3fVHTLFH2Dcjp8">81 Impasse de la Fontaine, 53 370 Ravigny</a><br />
                {t.nearestStation} : <a href="https://maps.app.goo.gl/U8uyFPLMapRhoEdx6">Gare d&apos;Alençon</a> {t.stationDetail}
              </p>

              {/* Trajet aller */}
              <div className="cdv__trip-card">
                <div className="cdv__section-label">{t.outbound}</div>

                <div className="cdv__transport-cards">
                  {[
                    { value: 'car-driver', icon: <IconCar size={24} />, label: t.driver },
                    { value: 'dunno', icon: <IconCarpool size={24} />, label: t.carpool },
                    { value: 'train', icon: <IconTrain size={24} />, label: t.train },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`cdv__transport-card ${formData.travel === opt.value ? 'cdv__transport-card--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="travel"
                        value={opt.value}
                        checked={formData.travel === opt.value}
                        onChange={() => selectTravel(opt.value)}
                      />
                      <span className="cdv__transport-icon">{opt.icon}</span>
                      <span className="cdv__transport-label">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {isDriver && (
                  <div className="cdv__conditional">
                    <div className="cdv__field">
                      <label className="cdv__label">{t.spotsLabel}</label>
                      <input type="number" name="spotsNumber" min="2" max="7" value={formData.spotsNumber} onChange={handleFormChange} />
                    </div>
                  </div>
                )}

                <div className="cdv__field">
                  <label className="cdv__label">
                    {isTrain ? t.arrivalTimeTrain : t.arrivalTimeOther}
                  </label>
                  <DateTimePicker name="arrivalDateTime" value={formData.arrivalDateTime} onChange={handleFormChange} precise={isTrain} />
                </div>

                {showLocations && (
                  <div className="cdv__conditional">
                    <div className="cdv__field">
                      <label className="cdv__label">
                        {isDriver ? t.departurePlaceDriver : t.departurePlaceOther}
                      </label>
                      <input type="text" name="departurePlace" value={formData.departurePlace} onChange={handleFormChange} />
                    </div>
                  </div>
                )}
              </div>

              {/* Trajet retour */}
              <div className="cdv__trip-card">
                <div className="cdv__section-label">
                  {t.returnTrip}
                  {!isDriver && (
                    <div className="cdv__transport-compact">
                    {[
                      { value: 'car-driver', icon: <IconCar size={18} />, disabled: true, title: t.driver },
                      { value: 'dunno', icon: <IconCarpool size={18} />, disabled: false, title: t.carpool },
                      { value: 'train', icon: <IconTrain size={18} />, disabled: false, title: t.train },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`cdv__transport-compact-btn ${effectiveReturn === opt.value ? 'cdv__transport-compact-btn--selected' : ''}`}
                        disabled={opt.disabled}
                        title={opt.title}
                        onClick={() => {
                          setReturnTravelExplicit(true)
                          setFormData(prev => ({ ...prev, returnTravel: opt.value }))
                          setUnsaved(true)
                        }}
                      >
                        {opt.icon}
                      </button>
                    ))}
                  </div>
                  )}
                </div>

                <div className="cdv__field">
                  <label className="cdv__label">
                    {isReturnTrain ? t.departureTimeTrain : t.departureTimeOther}
                  </label>
                  <DateTimePicker name="departureDateTime" value={formData.departureDateTime} onChange={handleFormChange} variant="departure" precise={isReturnTrain} />
                </div>

                {showReturnLocations && (
                  <div className="cdv__conditional">
                    <div className="cdv__field">
                      <label className="cdv__label">
                        {t.arrivalPlace}
                      </label>
                      <input type="text" name="arrivalPlace" value={formData.arrivalPlace} onChange={handleFormChange} />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <div className="cdv__column">
            {/* Préparatifs */}
            <section className="cdv__widget">
              <div className="cdv__widget-header">
                <div className="cdv__widget-icon"><IconSuitcase size={18} /></div>
                <h2 className="cdv__widget-title">{t.preparations}</h2>
              </div>

              <div className="cdv__trip-card">
                <div className="cdv__trip-label">{t.itemsToPack}</div>

                <div className="cdv__section-label">{t.essentials}</div>
                <div className="cdv__tags">
                  {t.essentialItems.map(item => (
                    <span key={item} className="cdv__tag cdv__tag--essential">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="cdv__section-label">{t.optional}</div>
                <div className="cdv__tags">
                  {t.optionalItems.map(item => (
                    <span key={item} className="cdv__tag cdv__tag--optional">
                      {item}
                    </span>
                  ))}
                </div>

                <label className={`cdv__checkbox-label ${formData.mat ? 'cdv__checkbox-label--checked' : ''}`}>
                  <input type="checkbox" name="mat" checked={formData.mat} onChange={handleFormChange} />
                  <span className="cdv__custom-checkbox">{formData.mat && <IconCheck size={12} />}</span>
                  {t.matCheckbox}
                </label>
              </div>

              <div className="cdv__trip-card">
                <div className="cdv__trip-label">{t.otherInfo}</div>

                <label className={`cdv__checkbox-label ${hasAllergies ? 'cdv__checkbox-label--checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={hasAllergies}
                    onChange={e => {
                      setHasAllergies(e.target.checked)
                      if (!e.target.checked) {
                        setFormData(prev => ({ ...prev, allergies: '' }))
                        setUnsaved(true)
                      }
                    }}
                  />
                  <span className="cdv__custom-checkbox">{hasAllergies && <IconCheck size={12} />}</span>
                  {t.dietaryCheckbox}
                </label>

                {hasAllergies && (
                  <div className="cdv__field">
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleFormChange}
                      placeholder={t.dietaryPlaceholder}
                    />
                  </div>
                )}

                <div className="cdv__section-label">{t.comments}</div>
                <div className="cdv__field">
                  <textarea
                    name="otherInfo"
                    value={formData.otherInfo}
                    onChange={handleFormChange}
                    placeholder={t.commentsPlaceholder}
                    rows={3}
                  />
                </div>
              </div>
            </section>

            {/* Participation financière */}
            {participant.payed ? (
              <section className="cdv__widget cdv__widget--no-fade cdv__widget--paid">
                <IconCheckCircle size={20} />
                {t.financialPaid}
              </section>
            ) : (
              <section className="cdv__widget cdv__widget--no-fade">
              <div className="cdv__widget-header">
                <div className="cdv__widget-icon cdv__widget-icon--accent"><IconEuro size={18} /></div>
                <h2 className="cdv__widget-title">{t.financialTitle}</h2>
              </div>

                <>
                  <p className="cdv__intro-text">
                    {t.financialIntro}
                  </p>

                  <div className="cdv__trip-card">
                    <div className="cdv__trip-label">{t.sendByWero}</div>

                    <div className="cdv__wero-cards">
                      <button
                        type="button"
                        className="cdv__wero-card"
                        onClick={() => { saveData(); window.open('https://start.wero-wallet.eu/?wero-uc=share&wero-url=https%3A%2F%2Fshare.weropay.eu%2Fp%2F1%2Fs%2FwxTpGaZPWf%3Fa%3D3000%26c%3DEUR', '_blank'); }}
                      >
                        <span className="cdv__wero-amount">30&euro;</span>
                        <span className="cdv__wero-label">{t.reducedRate}</span>
                      </button>
                      <button
                        type="button"
                        className="cdv__wero-card"
                        onClick={() => { saveData(); window.open('https://start.wero-wallet.eu/?wero-uc=share&wero-url=https%3A%2F%2Fshare.weropay.eu%2Fp%2F1%2Fs%2FwxTpGaZPWf%3Fa%3D4500%26c%3DEUR', '_blank'); }}
                      >
                        <span className="cdv__wero-amount">45&euro;</span>
                        <span className="cdv__wero-label">{t.fullRate}</span>
                      </button>
                    </div>

                    <div className="cdv__custom-amount">
                      <span className="cdv__custom-amount-label">{t.otherAmount}</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        className="cdv__custom-amount-input"
                        value={customAmount}
                        onChange={e => setCustomAmount(e.target.value)}
                      />
                      <span className="cdv__custom-amount-currency">&euro;</span>
                      <button
                        type="button"
                        className="cdv__custom-amount-btn"
                        disabled={!customAmount || Number(customAmount) <= 0}
                        onClick={() => {
                          const cents = Math.round(Number(customAmount) * 100)
                          saveData()
                          window.open(`https://start.wero-wallet.eu/?wero-uc=share&wero-url=https%3A%2F%2Fshare.weropay.eu%2Fp%2F1%2Fs%2FwxTpGaZPWf%3Fa%3D${cents}%26c%3DEUR`, '_blank')
                        }}
                      >
                        &#8594;
                      </button>
                    </div>
                  </div>

                  <div className="cdv__virement">
                    <span className="cdv__virement-label">{t.preferTransfer}</span>
                    <div className="cdv__iban-row">
                      <code className="cdv__iban">FR76 1234 5678 9012 3456 7890 123</code>
                      <button
                        type="button"
                        className={`cdv__iban-copy ${feedback === 'copied' ? 'cdv__iban-copy--confirmed' : ''}`}
                        onClick={() => {
                          navigator.clipboard.writeText('FR7612345678901234567890123')
                          showFeedback('copied')
                        }}
                      >
                        {feedback === 'copied' ? t.copied : t.copy}
                      </button>
                    </div>
                  </div>
                </>
              </section>
            )}
          </div>
        </main>
      )}

    </div>
  )
}

export default CarnetDeVoyage
