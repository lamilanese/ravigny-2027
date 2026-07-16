# Ravigny React

Event management app for "Charivari de Ravigny 2026". Vite + React 19 + React Router 7.

## Project structure

- `src/pages/Home.jsx` — Landing page with RSVP form (name, presence/absence, phone). Sends Telegram notification (best-effort) and upserts RSVP to Supabase.
- `src/pages/CarnetDeVoyage.jsx` — Travel book for confirmed guests. Transport, packing, dietary info, payments. Bilingual (FR/EN toggle).
- `src/components/` — DateTimePicker, Icons, Toast (unused, can be removed).
- `src/lib/supabase.js` — Supabase client singleton.
- `.env` — `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (gitignored).

## Database (Supabase / PostgreSQL)

Event ID is hardcoded as `r27` in both pages.

### contact_info
- `contact_id` (uuid, PK, auto-generated)
- `f_name`, `l_name` (text)
- `num` (text, unique) — phone in international format without `+`, e.g. `33612345678`
- `m_f` (enum: 'm'/'f')
- `allergies` (text) — contact-level, edited from CarnetDeVoyage
- `comments` (text)
- `has_wa` (boolean), `has_licence` (boolean), `birthday` (date), `host` (enum)

### events
- `event_id` (text, PK)

### event_participants
- `id` (serial, PK)
- `event_id` (text, FK → events)
- `contact_id` (uuid, FK → contact_info)
- Unique constraint on `(event_id, contact_id)` — used for upsert onConflict
- `invited` (boolean) — set to true when user submits Home form
- `rsvp` (varchar) — `'yes'`/`'no'`/null. Set from Home page. CarnetDeVoyage requires `'yes'` to access.
- `arrival_travel`, `departure_travel` (varchar) — values: `'car-driver'`, `'dunno'`, `'train'`
- `arrival_datetime`, `departure_datetime` (timestamp)
- `departure_place`, `arrival_place` (varchar)
- `spots_number` (int), `driver_name` (varchar), `mat` (boolean)
- `payed` (double) — null = not paid, any value (including 0) = paid
- `comments` (text) — maps to `otherInfo` in frontend
- `updated_at` (timestamp)

### RLS policies (anon role)
- SELECT on contact_info and event_participants (USING true)
- UPDATE on contact_info (for allergies)
- ALL on event_participants (for upsert)

## Phone number handling

Numbers stored as `33XXXXXXXXX` (country code + local without leading 0). Normalization:
- `07 82 37 24 23` → `33782372423`
- `+33782372423` → `33782372423`
- `+447123456789` → `447123456789`
- Home page combines country code selector + local input.
- CarnetDeVoyage has a single input with auto-normalization.

## Key conventions

- CSS uses BEM-like `.cdv__` prefix for CarnetDeVoyage, `.home__` for Home
- Mobile breakpoint: `max-width: 900px`
- Translations object `TRANSLATIONS` with `fr`/`en` keys in CarnetDeVoyage
- Feedback via inline button state changes (green confirmed, red error), not toasts
