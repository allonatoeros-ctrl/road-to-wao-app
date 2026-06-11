# 09_SUPABASE_IMPLEMENTATION_PLAN — Road to WAO

Versione: 1.0  
Area: Road to WAO / Supabase implementation plan  
Uso: micro-step per Antigravity, senza codice applicativo in questo file

---

## 1. Obiettivo

Collegare Road to WAO a Supabase senza rompere il flow locale già validato.

Flow da preservare:

```text
Luca crea ride
ride appare in Bacheca
Sara chiede join
Admin approva
posti scalano
Sara vede Crew sbloccata
Profilo mostra Crew attiva
Marco crea generalRequest
no Telegram su generalRequest
Admin archivia Marco
```

---

## 2. File da creare

```text
src/services/supabaseClient.js
src/services/roadToWaoDb.js
```

`supabaseClient.js` deve contenere solo client browser con env Vite pubbliche.

`roadToWaoDb.js` deve isolare operazioni database:

```text
profiles
rides
joinRequests
generalRequests
admin actions
subscriptions
```

---

## 3. File da modificare gradualmente

```text
src/App.jsx
src/components/RoadBoard.jsx solo se necessario
src/components/OfferRideModal.jsx solo se necessario
src/components/JoinRequestModal.jsx solo se necessario
src/components/MessagesPanel.jsx solo se necessario
src/components/ProfilePanel.jsx solo se necessario
src/components/AdminPanel.jsx solo se necessario
```

---

## 4. File da NON toccare salvo task esplicito

```text
package-lock.json salvo install
routing non collegato
stili globali se non necessario
test Playwright salvo step 10
env reali
schema SQL senza approval
```

---

# 5. Micro-commit plan

## Step 1 — install supabase client

Task level: micro  
Modello: Gemini Flash Low/Medium  
Leggere: `package.json`  
Modificare: `package.json`, lockfile  
Non toccare: React components  
Test manuale: `npm run build`  
Stop condition: errori install/build

---

## Step 2 — add env config

Task level: micro  
Modello: Gemini Flash Low  
Leggere: `.env.example` se esiste, Vite config  
Modificare: `.env.example` / docs env  
Non toccare: `.env.local` reale se non richiesto  
Test manuale: app parte senza env reali o mostra errore chiaro  
Stop condition: richiesta di secret/service key nel frontend

Env previste:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Legacy fallback:

```text
VITE_SUPABASE_ANON_KEY=
```

---

## Step 3 — add service layer

Task level: medio  
Modello: Gemini Flash Medium  
Leggere: `App.jsx`, componenti che usano state  
Modificare: `src/services/supabaseClient.js`, `src/services/roadToWaoDb.js`  
Non toccare: componenti UI  
Test manuale: build passa  
Stop condition: il service layer modifica UI o inventa schema non approvato

---

## Step 4 — connect profiles/auth

Task level: medio/alto  
Modello: Gemini Flash High o Pro se auth è poco chiara  
Leggere: `ProfilePanel.jsx`, modali action gate, `App.jsx`  
Modificare: minimo necessario  
Non toccare: RoadBoard visual  
Test manuale: utente può creare/completare Profile Lite e restare collegato  
Stop condition: password custom, dati eccessivi, auth non chiara

---

## Step 5 — connect rides

Task level: medio  
Modello: Gemini Flash Medium/High  
Leggere: `App.jsx`, `RoadBoard.jsx`, `OfferRideModal.jsx`  
Modificare: `App.jsx`, service layer, eventualmente `OfferRideModal.jsx`  
Non toccare: join/general request flow  
Test manuale: Luca crea ride, ride appare dopo refresh  
Stop condition: crea offers[] o cambia decisione prodotto

---

## Step 6 — connect joinRequests

Task level: medio  
Modello: Gemini Flash High  
Leggere: `JoinRequestModal.jsx`, `MessagesPanel.jsx`, `ProfilePanel.jsx`, `AdminPanel.jsx`  
Modificare: service layer + minimo UI necessario  
Non toccare: generalRequests  
Test manuale: Sara chiede join, admin la vede pending  
Stop condition: Telegram visibile prima di approval

---

## Step 7 — connect generalRequests

Task level: medio  
Modello: Gemini Flash Medium  
Leggere: modal/request UI esistente, `AdminPanel.jsx`  
Modificare: service layer + minimo UI necessario  
Non toccare: joinRequest Telegram unlock  
Test manuale: Marco crea generalRequest, admin la vede, nessun Telegram unlock  
Stop condition: generalRequest riceve rideId o Telegram link

---

## Step 8 — connect admin approve/reject/archive

Task level: alto  
Modello: Gemini Flash High / Pro  
Leggere: `AdminPanel.jsx`, service layer, schema/RLS plan  
Modificare: admin actions  
Non toccare: public RoadBoard layout  
Test manuale: approve Sara scala posti e sblocca crew; archive Marco non sblocca Telegram  
Stop condition: admin action possibile da utente non admin

---

## Step 9 — add realtime subscriptions

Task level: medio/alto  
Modello: Gemini Flash High  
Leggere: `App.jsx`, service layer, panels  
Modificare: service layer + subscription wiring  
Non toccare: schema/RLS senza approval  
Test manuale: telefono → DB → dashboard/profile aggiornati senza refresh  
Stop condition: subscriptions duplicate, memory leak, polling caotico

---

## Step 10 — update Playwright tests

Task level: medio  
Modello: Gemini Flash Medium  
Leggere: `tests/road-to-wao-private-dry-run.spec.js`  
Modificare: solo test  
Non toccare: app code  
Test manuale: Playwright passa  
Stop condition: test bypassa il comportamento reale o richiede dati prod

---

## 6. Regola commit

Un commit per step funzionante.

Esempi:

```text
Add Supabase client setup
Add Road to WAO database service layer
Connect rides to Supabase
Connect join requests approval flow
Add realtime subscriptions for rides and requests
Update Road to WAO Supabase Playwright flow
```

---

## 7. Regola Token Saver

Per ogni prompt ad Antigravity includere solo:

```text
questo file
07 release brief
08 schema/RLS plan
file target
flow test già validato
```

Non caricare tutto il repo o tutta la storia BlaBlaParty.

---

## 8. Approval gates obbligatori

Richiedere approval umano prima di:

```text
creare schema SQL
creare RLS policies
aggiungere auth flow
cambiare status lifecycle
esporre Telegram link
aggiungere Edge Function
usare secret/service role
modificare AdminPanel + App.jsx insieme
```

---

## 9. Primo prompt operativo consigliato

```text
Modalità read-only.
Agisci come Supabase Specialist Agent per Road to WAO.

Leggi:
- agent_context/road-to-wao/07_SUPABASE_RELEASE_BRIEF.md
- agent_context/road-to-wao/08_SUPABASE_SCHEMA_RLS_PLAN.md
- agent_context/road-to-wao/09_SUPABASE_IMPLEMENTATION_PLAN.md
- src/App.jsx
- src/components/RoadBoard.jsx
- src/components/OfferRideModal.jsx
- src/components/JoinRequestModal.jsx
- src/components/MessagesPanel.jsx
- src/components/ProfilePanel.jsx
- src/components/AdminPanel.jsx

Non modificare file.

Output:
1. stato attuale data flow locale;
2. mappa state → futura tabella Supabase;
3. rischi;
4. primo micro-step consigliato;
5. file da toccare nel primo step;
6. file da non toccare;
7. test manuale.
```
