# MEDIS Nova

MEDIS Nova is an advanced medical support platform with a modern dashboard that keeps the original idea (prediction + recommendations + profile + nearby + chat) and adds new intelligence features for better reliability.

## Upgraded Features

- **AI Disease Prediction Engine** for 40+ diseases with confidence, severity, missing-symptom guidance, and triage labels.
- **Symptom Suggestion API** for smarter and faster symptom entry.
- **Critical Alert + Triage Layer** (`WATCH`, `ROUTINE`, `PRIORITY`, `EMERGENCY`).
- **Personalized Recommendations** with medicines, diet, exercise, lifestyle, precautions, follow-up checklist, and expected recovery.
- **Vitals Risk Assessment** (new) using heart rate, oxygen, blood pressure, and temperature.
- **Wellness Plan Generator** (new) from age + prediction history trends.
- **Authentication + Profile + Session Insights** with login history and recent prediction sessions.
- **Nearby Healthcare Finder** with radius filtering over Nainital healthcare data.
- **AI Medical Chat Assistant** with safety fallback and Hindi support.

## Quick Start

```bash
npm start
```

Open `http://localhost:3000`.

## API Overview

- `GET /api/health`
- `GET /api/symptoms?q=fev`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/predict`
- `POST /api/risk-assessment`
- `GET /api/wellness-plan`
- `GET /api/nearby`
- `POST /api/chat`

## Project Structure

- `server.js` — backend routes + static hosting
- `src/engine/diagnosis.js` — disease model + triage + symptom suggestions
- `src/services/recommendations.js` — care plan output
- `src/services/riskAssessment.js` — vitals risk intelligence
- `src/services/healthcareFinder.js` — location search
- `src/services/chatAssistant.js` — safe assistant responses
- `src/store/dataStore.js` — JSON persistence
- `public/` — web dashboard

## Disclaimer

This app provides informational support only and is not a replacement for licensed medical diagnosis or emergency care.
