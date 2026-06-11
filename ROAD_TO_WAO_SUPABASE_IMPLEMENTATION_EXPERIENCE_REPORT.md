# ROAD_TO_WAO_SUPABASE_IMPLEMENTATION_EXPERIENCE_REPORT

**Data report:** 2026-06-11  
**Progetto:** Road to WAO / BlaBlaParty  
**Tipo documento:** Supabase implementation experience report operativo  
**Scopo:** trasformare l’esperienza reale di integrazione Supabase in conoscenza riutilizzabile per Road to WAO, BlaBlaParty, Walbox e AI Business Factory.

---

## 1. Contesto iniziale del progetto

### 1.1 Stato dell’app prima di Supabase

Prima dell’integrazione Supabase, Road to WAO era una app **React + Vite** funzionante in locale, con stato gestito in memoria dentro `App.jsx`.

L’app aveva già un flusso demo validato in modalità locale:

1. Luca crea/offre un passaggio.
2. Il viaggio appare in Bacheca.
3. Il driver vede “Il tuo viaggio aperto”.
4. Sara chiede di unirsi.
5. Admin approva.
6. I posti scalano.
7. Sara vede “Crew sbloccata”.
8. Il profilo mostra “Crew attiva”.
9. Marco lascia una richiesta generale.
10. Nessun link Telegram viene mostrato per richieste generali o casi non approvati.

Questo flusso era stato validato con test Playwright locale:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5173 npx playwright test tests/road-to-wao-private-dry-run.spec.js --headed
```

### 1.2 Stack usato

| Area | Tecnologia / strumento |
|---|---|
| Frontend | React + Vite |
| Styling/UI | CSS custom, tema WAO cosmic/solar |
| Backend/database | Supabase |
| Auth | Supabase Auth email/password |
| Client DB | `@supabase/supabase-js` |
| Test | Playwright |
| Deploy target | Vercel, da verificare per questa specifica app nel checkpoint finale |
| Sviluppo agentico | Antigravity |
| Regia/QA/decisioni | ChatGPT |
| Versionamento | Git |
| Test manuale | Browser desktop + telefono su LAN |

### 1.3 Componenti/file principali coinvolti

| File | Ruolo |
|---|---|
| `src/App.jsx` | Stato principale, routing tab, bridge tra UI locale e Supabase |
| `src/components/RoadBoard.jsx` | Bacheca viaggi pubblica |
| `src/components/OfferRideModal.jsx` | Form “Offri un passaggio” |
| `src/components/JoinRequestModal.jsx` | Form “Chiedi di unirti” |
| `src/components/MessagesPanel.jsx` | Messaggi, richieste, crew sbloccata |
| `src/components/ProfilePanel.jsx` | Profile Lite/Auth UI |
| `src/components/AdminPanel.jsx` | Control Room / approvazione richieste |
| `src/services/supabaseClient.js` | Client Supabase e configurazione env |
| `src/services/roadToWaoDb.js` | Service layer Supabase |
| `supabase/road_to_wao_schema_v1.sql` | Schema e RLS Supabase |
| `tests/road-to-wao-private-dry-run.spec.js` | Test Playwright del flusso demo/private dry-run |
| `agent_context/road-to-wao/10_PROFILE_LITE_AUTH_FLOW.md` | Contesto agentico per auth/profile |

### 1.4 Flusso già validato prima dell’integrazione

Il flusso demo locale era:

```text
Home
→ Bacheca
→ Offri un passaggio
→ Richiesta/passaggio locale creato
→ Chiedi di unirti
→ Control Room approva
→ Posti scalano localmente
→ Messaggi/Profilo mostrano crew attiva
```

Era un buon prototipo prodotto, ma non persistente: al refresh o cambio dispositivo non conservava i dati reali.

---

## 2. Obiettivo dell’integrazione Supabase

### 2.1 Cosa doveva diventare persistente

L’obiettivo era spostare progressivamente da stato locale a Supabase:

| Entità | Obiettivo |
|---|---|
| Utenti | Auth email/password con sessione browser |
| Profile Lite | Nickname, città partenza, ruolo, maggiorenne |
| Dati social privati | Telegram/Instagram in tabella separata |
| Rides/passaggi | Passaggi pubblici leggibili in Bacheca |
| Join requests | Richieste di unirsi persistenti e pending/approved/rejected |
| Approval | Stato richieste aggiornato da driver/admin |
| Seats | Scalare posti tramite trigger Supabase, non manualmente dal client |
| Crew privata | Link Telegram privato sbloccato solo dopo approvazione |
| General requests | Da collegare, a questo checkpoint non è il focus finale |

### 2.2 Quali dati dovevano passare da local state a database

| Prima | Dopo |
|---|---|
| `rides` in `App.jsx` | `public.rides` + mapping UI |
| `joinRequests` / `requests` locali | `public.join_requests` + mapping UI |
| profilo demo/localStorage | `auth.users` + `profiles` + `profile_secrets` |
| link Telegram demo | `ride_secrets.telegram_group_link` protetto |
| approval locale | `join_requests.status = approved` |
| seat decrement locale | trigger Supabase su approval |

### 2.3 Parti da mantenere invariate

Durante l’integrazione dovevano restare stabili:

- UI pubblica e stile WAO.
- Bacheca pubblica consultabile senza login.
- Flusso demo/local iniziale, finché non veniva introdotto auth gate.
- Test Playwright come smoke test finché coerente con la fase prodotto.
- Nessuna esposizione pubblica di link Telegram.
- Nessun uso di `service_role` lato client.
- Nessun refactor generale non richiesto.

---

## 3. Timeline operativa del lavoro

### 3.1 Preparazione Supabase e schema

| Step | Risultato |
|---|---|
| Creazione schema SQL | Creato `supabase/road_to_wao_schema_v1.sql` |
| Hardening schema | Aggiunte RLS, trigger, tabelle separate per secrets |
| Primo progetto Supabase | Progetto iniziale con DNS/API non funzionante, poi eliminato |
| Nuovo progetto | Creato `road-to-wao-v2` con URL funzionante |
| Env | Configurato `.env.local` con URL/key Supabase |
| `.env.local` | Aggiunto a `.gitignore` |

Il progetto Supabase funzionante aveva URL:

```text
https://fsrawdipiaaxzqrpsszd.supabase.co
```

La key publishable era stata salvata in `.env.local`, non nel repo.

### 3.2 Supabase client

Creato:

```text
src/services/supabaseClient.js
```

Responsabilità:

- importare `createClient`
- leggere `VITE_SUPABASE_URL`
- leggere `VITE_SUPABASE_ANON_KEY`
- esportare `supabase`
- esportare `isSupabaseConfigured`
- non usare mai `service_role`

### 3.3 Service stubs e primo read

Creato/esteso:

```text
src/services/roadToWaoDb.js
```

Funzioni iniziali/stub:

- `getCurrentSession()`
- `getCurrentUser()`
- `getCurrentProfile()`
- `fetchRides()`
- `createRide(payload)`
- `fetchJoinRequests()`
- `createJoinRequest(payload)`
- `approveJoinRequest(requestId)`
- `rejectJoinRequest(requestId)`
- `fetchGeneralRequests()`
- `createGeneralRequest(payload)`
- `archiveGeneralRequest(requestId)`
- `subscribeToRoadToWaoChanges(onChange)`

Poi `fetchRides()` è stato collegato realmente a Supabase.

### 3.4 RoadBoard read-only

`App.jsx` è stato modificato per caricare rides da Supabase:

- se Supabase restituisce rides reali, vengono mappati nella shape UI;
- se Supabase restituisce `[]` o errore, resta la demo locale;
- successivamente è stato corretto il comportamento per **non sostituire** i rides locali, ma fare merge.

Bug risolto:

```text
setRides(mappedRides)
```

sostituiva i rides locali/test. È stato corretto con merge funzionale.

### 3.5 Seed demo reale

Creati utenti demo:

| Utente | Email | UID |
|---|---|---|
| Luca demo | `luca.driver.demo@roadtowao.local` | `ef57b929-f04c-4e9f-b1de-35d058271a58` |
| Sara demo | `sara.raver.demo@roadtowao.local` | `0e16afb5-770d-4ce2-8d1c-0c463336261d` |

Password demo usata:

```text
RoadToWaoDemo123!
```

Creato ride seed reale:

| Campo | Valore |
|---|---|
| ride id | `0692b606-0bd3-475c-9eed-caf1e4175732` |
| driver | Luca Supabase |
| departure_city | Milano |
| departure_area | San Giuliano / Milano Sud |
| to_event | WAO Festival |
| seats_total | 3 |
| seats_available iniziale | 3 |
| status | open |
| visibility | public |

È stato poi creato un ride reale da UI:

```text
Bologna → WAO Festival / 2 posti / public / open
```

### 3.6 Profile Lite / Auth

Aggiunte funzioni auth/profile in `roadToWaoDb.js`:

- `signUpWithEmail(email, password)`
- `signInWithEmail(email, password)`
- `signOut()`
- `resetPasswordForEmail(email)`
- `getCurrentSession()`
- `getCurrentUser()`
- `getCurrentProfile()`
- `upsertProfileLite(profilePayload)`

Aggiunta UI in `ProfilePanel.jsx`:

- login
- signup
- reset password
- Profile Lite editor
- nickname
- departure_city
- role
- is_of_age
- telegram_username
- instagram_username

Poi migliorata UX signup per gestire:

- email non valida
- credenziali errate
- email non confermata
- rate limit
- account creato ma email da confermare
- password reset

### 3.7 createRide service e UI

`createRide(payload)` è stato collegato a Supabase:

- richiede utente autenticato
- `driver_id = current user.id`
- inserisce in `public.rides`
- `status = open`
- `visibility = public`
- `seats_available = seats_total`
- non scrive Telegram
- non scrive `ride_secrets`

Poi `App.jsx` ha collegato “Offri un passaggio”:

- se autenticato → insert Supabase
- se errore → inizialmente fallback locale
- poi con auth gate → non autenticato non può più offrire

### 3.8 createJoinRequest service e UI

`createJoinRequest(payload)` è stato collegato a Supabase:

- richiede utente autenticato
- `requester_id = current user.id`
- `ride_id`
- `seats_requested`
- `message`
- `status = pending`
- non approva automaticamente
- non scala posti
- non espone Telegram

Poi `App.jsx` ha collegato “Chiedi di unirti”:

- solo su ride reale UUID
- solo utente autenticato
- fallback demo iniziale preservato per vecchi casi
- successivamente auth gate blocca non loggati

Richiesta Sara verificata in SQL Editor:

```text
requester_id = 0e16afb5-770d-4ce2-8d1c-0c463336261d
status = pending
seats_requested = 1
```

### 3.9 Admin approval

Service collegati:

- `fetchJoinRequests()`
- `approveJoinRequest(requestId)`
- `rejectJoinRequest(requestId)`

Poi `App.jsx` ha collegato AdminPanel/Control Room:

- fetch join requests reali se utente autenticato
- approve su UUID → Supabase
- reject su UUID → Supabase
- local/demo resta per vecchio flusso
- nessun decremento manuale per rides Supabase

Validazione manuale:

```text
join_requests.status = approved
approved_at valorizzato
rides.seats_available: 3 → 2
```

Questo ha confermato che il trigger Supabase scala i posti.

### 3.10 Auth gate

È stata rilevata una regola prodotto:

```text
Non loggato può vedere la Bacheca, ma non deve poter partecipare.
```

Implementato auth gate in `App.jsx`:

- non loggato può fare browse pubblico;
- non loggato non può:
  - offrire passaggio
  - chiedere di unirsi
  - lasciare richiesta generale;
- se prova, viene mandato a Profilo;
- messaggio: “Accedi o crea il tuo profilo per partecipare alla crew.”

### 3.11 Crew privata / Telegram unlock

Creato record in `ride_secrets` per il ride di Luca.

Errore corretto:

- inizialmente tentato insert con `id` e `telegram_group_link`;
- Supabase ha segnalato `ride_id` not null;
- fix: inserire `ride_id`.

Funzione aggiunta:

```text
getUnlockedCrewForRide(rideId)
```

Regole:

- richiede utente autenticato;
- link visibile solo se:
  - utente è driver del ride;
  - oppure utente ha join request approved;
  - oppure admin, se supportato dallo schema;
- non legge `ride_secrets` prima del controllo permessi;
- non espone pending/rejected/cancelled.

`App.jsx` poi ha collegato il link alla UI state:

- `MessagesPanel` mostra “Crew sbloccata” e “Apri Telegram Crew”;
- `ProfilePanel` mostra “Crew attiva” e bottone Telegram;
- `RoadBoard` riceve rides sanitizzati con `telegramUrl: null`.

Validazione manuale:

- Sara approvata vede “Crew sbloccata”;
- Sara vede “Apri Telegram Crew”;
- Profilo Sara mostra “Crew attiva”;
- logout ok;
- RoadBoard pubblica non deve esporre Telegram.

---

## 4. Architettura finale raggiunta

### 4.1 Tabelle Supabase create/usate

| Tabella | Uso |
|---|---|
| `profiles` | Profilo pubblico leggero: nickname, città, ruolo, maggiorenne, admin se previsto |
| `profile_secrets` | Dati privati utente: Telegram/Instagram |
| `rides` | Passaggi pubblici |
| `ride_secrets` | Link Telegram privato della crew |
| `join_requests` | Richieste specifiche di unirsi a un ride |
| `general_requests` | Richieste generali, creata ma non core flow finale a questo checkpoint |
| `moderation_events` | Audit/moderazione, creata ma non core flow finale a questo checkpoint |
| `auth.users` | Utenti Supabase Auth |

### 4.2 File aggiunti/modificati

| File | Stato finale |
|---|---|
| `src/services/supabaseClient.js` | Client Supabase configurato |
| `src/services/roadToWaoDb.js` | Service layer completo per core flow |
| `src/App.jsx` | Collegamento React state ↔ Supabase |
| `src/components/ProfilePanel.jsx` | Auth/Profile Lite UI migliorata |
| `tests/road-to-wao-private-dry-run.spec.js` | Aggiornato durante transizione demo/Supabase |
| `supabase/road_to_wao_schema_v1.sql` | Schema Supabase/RLS/trigger |
| `.env.example` | Variabili env template |
| `.gitignore` | `.env.local` ignorato |

### 4.3 Funzioni service create/collegate

| Funzione | Stato |
|---|---|
| `fetchRides()` | Collegata |
| `createRide(payload)` | Collegata |
| `createJoinRequest(payload)` | Collegata |
| `fetchJoinRequests()` | Collegata |
| `approveJoinRequest(requestId)` | Collegata |
| `rejectJoinRequest(requestId)` | Collegata |
| `getUnlockedCrewForRide(rideId)` | Collegata |
| `signUpWithEmail(email, password)` | Collegata |
| `signInWithEmail(email, password)` | Collegata |
| `signOut()` | Collegata |
| `resetPasswordForEmail(email)` | Collegata |
| `getCurrentSession()` | Collegata |
| `getCurrentUser()` | Collegata |
| `getCurrentProfile()` | Collegata |
| `upsertProfileLite(profilePayload)` | Collegata |
| `fetchGeneralRequests()` | Da verificare / non core finale |
| `createGeneralRequest(payload)` | Da verificare / non core finale |
| `archiveGeneralRequest(requestId)` | Da verificare / non core finale |
| `subscribeToRoadToWaoChanges(onChange)` | Da verificare / realtime non usato nel checkpoint finale |

### 4.4 Collegamento React → Supabase

Il pattern finale è:

```text
UI action
→ App.jsx handler
→ roadToWaoDb service
→ Supabase table
→ map result back to UI state
→ update local state immediately
```

Esempio:

```text
OfferRideModal submit
→ App.jsx onSubmitOffer
→ createRide(payload)
→ public.rides insert
→ map returned ride
→ setRides(...)
```

### 4.5 Gestione stati

A checkpoint finale:

- React continua a mantenere uno stato locale UI-friendly.
- Supabase è fonte dati persistente per rides, auth, profile, join requests, crew link.
- Mapping tra schema DB e UI shape avviene in `App.jsx` e `roadToWaoDb.js`.
- RoadBoard viene sanitizzata con `telegramUrl: null`.
- Messages/Profile possono ricevere link privato solo dopo unlock.

### 4.6 Realtime

Realtime non risulta collegato nel core flow Road to WAO a questo checkpoint.

**Stato:** Da verificare / non implementato nel checkpoint finale.

### 4.7 RLS/policy e sicurezza emerse

Elementi emersi durante il lavoro:

- `rides` è pubblico-safe per browse.
- `profiles` è pubblico-safe per dati leggeri.
- `profile_secrets` non deve esporre dati privati.
- `ride_secrets` non deve essere letto pubblicamente.
- `join_requests` non è leggibile pubblicamente con anon key: `curl` anon ha restituito `[]`, mentre SQL Editor mostrava la riga.
- `approveJoinRequest()` aggiorna lo status, il trigger scala i posti.
- Telegram link non viene salvato in `rides`.
- Telegram link non viene passato a `RoadBoard`.
- Accesso crew consentito solo a driver, passenger approved o admin se previsto.

---

## 5. Errori e lezioni imparate

### 5.1 Cosa ha fatto perdere tempo

| Problema | Effetto | Fix |
|---|---|---|
| Primo progetto Supabase con DNS/API non funzionante | Impossibile usare API anche se dashboard sembrava ok | Creato nuovo progetto `road-to-wao-v2` |
| Comandi lanciati fuori cartella repo | `npm`/`git` fallivano | Sempre `cd /Users/erosallonato/Desktop/road-to-wao-app` |
| `.env.local` / key errate | API non raggiungibile o non configurata | Smoke test con `curl` |
| `profile_secrets.profile_id` inesistente | SQL insert fallito | Usare `id` per `profile_secrets` |
| `ride_secrets` richiede `ride_id` | SQL insert fallito | Insert con `ride_id` |
| Test checkbox Playwright | React non registrava `checked` via evaluate | Click/check user-like |
| Selector Playwright troppo generici | `Luca` matchava anche `Luca Supabase` | Selector più specifici |
| `setRides(mappedRides)` sostituiva dati locali | Test/demo ride sparivano | Merge funzionale |
| `curl` PostgREST filter sbagliato | Errore PGRST100 | Usare `id=eq.UUID` |
| `curl` su `join_requests` restituisce `[]` | Sembrava non scritto | RLS proteggeva; verificare in SQL Editor |
| Supabase email rate limit | Signup reale bloccato | Serve SMTP custom o attendere limite |
| Site URL default `localhost:3000` | Redirect auth potenzialmente sbagliato | Impostare `localhost:5173` e redirect locali |
| Chunk warning Vite >500kB | Possibile distrazione | Non bloccante per MVP |

### 5.2 Cosa era ambiguo

- Differenza tra demo/local fallback e prodotto reale.
- Quando mantenere fallback e quando rimuoverlo.
- Chi deve poter partecipare: inizialmente demo senza login, poi auth gate.
- Come testare signup reale con Confirm email ON e rate limit.
- Differenza tra Auth user e Profile Lite.
- Differenza tra `rides` pubblico e `ride_secrets` privato.
- Quando `curl` anon è sufficiente e quando serve SQL Editor perché RLS nasconde righe.

### 5.3 Cosa Antigravity ha fatto bene

- Modifiche mirate su file singoli.
- Service layer incrementale.
- Lettura file richiesti prima di modificare.
- Mantenimento fallback durante transizione.
- Mapping DB → UI shape.
- Implementazioni rapide con prompt token-saver.
- Fix mirati su Playwright e App.jsx quando guidato bene.

### 5.4 Cosa Antigravity non deve fare

- Non deve usare terminale se il prompt lo vieta.
- Non deve fare commit/git.
- Non deve toccare più file se il task dice “Modify only”.
- Non deve creare file interni fuori repo o includerli nel commit.
- Non deve fare refactor generale.
- Non deve inventare architettura o cambiare flusso prodotto.
- Non deve esporre segreti/Telegram in UI pubblica.
- Non deve modificare `.env.local`.

### 5.5 Cosa andava gestito da terminale

| Attività | Motivo |
|---|---|
| `npm run build` | Verifica sintassi/bundle |
| Playwright | Validazione flow |
| `git status` | Controllo file modificati |
| `git diff` | Review prima del commit |
| `git add` mirato | Evitare `git add .` |
| `git commit` | Checkpoint umano |
| `curl` Supabase | Smoke test API |
| `rm -rf test-results/` | Pulizia artefatti test |

### 5.6 Dove si sono risparmiati token

- Prompt piccoli e vincolati.
- Un file alla volta.
- Prima service layer, poi UI.
- Terminale usato come test runner.
- Output terminale copiato solo quando utile.
- ChatGPT interpreta errore, poi Antigravity corregge solo punto rotto.
- Git checkpoint dopo ogni step verde.

### 5.7 Dove si sono sprecati token

- Quando Antigravity legge molti file per task piccoli.
- Quando i prompt non bloccano chiaramente terminale/git.
- Quando una modifica si allarga da service a UI.
- Quando si ripetono test manuali senza prima capire se il problema è rate limit/provider.
- Quando non si separano bene demo fallback e logica prodotto reale.
- Quando non si controlla subito `git diff --stat`.

---

## 6. Workflow migliore emerso

Pattern operativo emerso:

```text
ChatGPT regia
→ Antigravity modifica piccola
→ Terminale testa
→ Git checkpoint
→ ChatGPT interpreta errore
→ Antigravity corregge solo il punto rotto
```

### 6.1 Schema pratico

| Fase | Owner | Output |
|---|---|---|
| Decisione prodotto | ChatGPT + utente | Regola chiara |
| Prompt operativo | ChatGPT | Token-saver prompt |
| Implementazione | Antigravity | Modifica su 1 file |
| Build/test | Terminale Mac | Log reale |
| Interpretazione errore | ChatGPT | Diagnosi |
| Fix mirato | Antigravity | Patch piccola |
| Commit | Utente/Terminale | Checkpoint Git |
| Report | ChatGPT | Markdown knowledge |

### 6.2 Regola d’oro emersa

```text
Mai fare architettura, UI, test, schema e Git nello stesso step.
```

---

## 7. Comandi terminale standard

### 7.1 Entrare nella repo

```bash
cd /Users/erosallonato/Desktop/road-to-wao-app
```

### 7.2 Build

```bash
npm run build
```

### 7.3 Dev server su rete locale

```bash
npm run dev -- --host 0.0.0.0 --port 5173
```

### 7.4 Playwright private dry-run

```bash
PLAYWRIGHT_BASE_URL=http://localhost:5173 npx playwright test tests/road-to-wao-private-dry-run.spec.js --headed
```

### 7.5 Git status completo

```bash
git status --untracked-files=all
```

### 7.6 Diff rapido

```bash
git diff --stat
git diff -- src/App.jsx | head -220
```

### 7.7 Pulizia risultati Playwright

```bash
rm -rf test-results/
```

### 7.8 Commit mirato

```bash
git add src/App.jsx
git commit -m "Connect offer ride submit to Supabase"
git status
```

### 7.9 Smoke test Supabase rides

```bash
source .env.local

curl "$VITE_SUPABASE_URL/rest/v1/rides?select=id,departure_city,to_event,seats_available,status,visibility,created_at&order=created_at.desc&limit=5" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

### 7.10 Smoke test Supabase profiles

```bash
source .env.local

curl "$VITE_SUPABASE_URL/rest/v1/profiles?select=id,nickname,departure_city,role&limit=5" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

### 7.11 PostgREST filtro corretto per UUID

```bash
curl "$VITE_SUPABASE_URL/rest/v1/profiles?select=id,nickname,departure_city,role&id=eq.0e16afb5-770d-4ce2-8d1c-0c463336261d" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

---

## 8. Token saving strategy

### 8.1 Principi usati

| Principio | Applicazione |
|---|---|
| Task piccoli | Ogni step tocca 1 file o 1 funzione |
| Service prima della UI | Prima `roadToWaoDb.js`, poi `App.jsx` |
| UI solo dopo service verde | Riduce debug incrociato |
| No refactor generale | Evita esplosione token e bug |
| Terminale come test runner | ChatGPT non deve “immaginare” build/test |
| Output copiato solo se serve | Si incolla solo errore o status utile |
| Git checkpoint frequente | Ogni step buono diventa ripristinabile |
| Prompt con stop condition | Antigravity si ferma dopo task |
| Modify only | Evita modifiche collaterali |

### 8.2 Template prompt efficace emerso

```text
TOKEN-SAVER FORMAT

Task level: 3/5
Model: Gemini Flash High
Mode: <descrizione micro-task>
Terminal permission: forbidden

Do not use terminal.
Do not run git.
Do not run npm.
Do not run build.
Do not run tests.

Read:
- file A
- file B

Modify only:
- file target

Do not touch:
- src/components/*
- tests/*
- .env
- supabase/*

Goal:
<obiettivo singolo>

Requirements:
1. ...
2. ...
3. ...

Stop condition:
Edit only <file>.
Report changed files.
Do not continue.
```

### 8.3 Modello operativo consigliato

| Task | Modello |
|---|---|
| Micro-fix selector/testo | Flash Low |
| Implementazione già pianificata su 1 file | Flash Medium |
| Logica delicata Supabase/Auth/RLS | Flash High |
| Architettura multi-file / bug complessi | Pro |

---

## 9. Automazioni future possibili con n8n

### 9.1 Automazioni utili subito

| Automazione | Utilità |
|---|---|
| Supabase `join_requests` pending → notifica Telegram admin | Avvisa quando qualcuno chiede di unirsi |
| Report giornaliero richieste/ride | Sintesi operativa per organizzatori |
| Export CSV giornaliero | Backup/light analytics |
| Telegram admin command manuale | Approva/rifiuta da canale admin, da verificare |
| Implementation pack generation | Da commit/log a report Markdown |
| Alert rate limit/email auth | Avvisa quando signup/reset falliscono spesso |

### 9.2 Automazioni premature

| Automazione | Perché prematura |
|---|---|
| Auto-approval richieste | Serve moderazione/controllo umano |
| AI moderation completamente automatica | Rischio sicurezza/community |
| Creazione automatica gruppi Telegram | Prima validare flow manuale |
| Dynamic matching complesso | Prima stabilizzare dati reali |
| CRM completo utenti | Troppo presto |
| Pagamenti/ticket | Non è nel core validato |

### 9.3 Automazioni future su Supabase events

Possibili workflow n8n futuri:

```text
Supabase insert join_requests.pending
→ n8n
→ Telegram admin notification
→ link Control Room
```

```text
Supabase update join_requests.approved
→ n8n
→ messaggio automatico “crew sbloccata”
→ log moderation_events
```

```text
Supabase daily cron
→ aggrega rides, join requests, pending, approved
→ invia report Telegram/Email
```

```text
Git commit / report chat
→ n8n
→ genera implementation pack
→ salva in repo/docs
```

---

## 10. Prossimi file consigliati

### 10.1 `SUPABASE_SPECIALIST_AGENT_CONTRACT.md`

Scopo: definire un agente specializzato Supabase per Road to WAO / AI Business Factory.

Contenuti consigliati:

- ruolo agente
- regole RLS
- cosa può/non può modificare
- schema-first approach
- service-layer-first
- no `service_role` client
- test standard richiesti
- error handling
- Git checkpoint policy

### 10.2 `SUPABASE_IMPLEMENTATION_PACK_TEMPLATE.md`

Scopo: template riutilizzabile per ogni nuova integrazione Supabase.

Contenuti consigliati:

- app context
- current local state
- target persistence
- tables
- policies
- service functions
- UI connection plan
- testing checklist
- rollback plan

### 10.3 `ROAD_TO_WAO_TERMINAL_QA_WORKFLOW.md`

Scopo: standardizzare il ruolo del terminale nel workflow.

Contenuti consigliati:

- build command
- Playwright command
- curl command
- git status
- diff review
- cleanup test artifacts
- commit naming
- quando fermarsi

### 10.4 `N8N_SUPABASE_AUTOMATION_IDEAS.md`

Scopo: raccogliere automazioni utili, distinguendo MVP, later, premature.

Contenuti consigliati:

- pending request notification
- admin digest
- daily report
- Telegram integration
- moderation queue
- implementation report generator
- cosa non automatizzare ancora

---

## 11. Conclusione

Questa esperienza è importante per la AI Business Factory perché non è stata solo una “integrazione Supabase”.

È stata una pipeline controllata:

```text
specifica
→ implementazione
→ test
→ errore reale
→ diagnosi
→ fix mirato
→ checkpoint Git
→ report
→ futura automazione
```

Road to WAO è passato da demo locale a core flow persistente:

```text
Browse pubblico
→ Auth/Profile Lite
→ Ride reale
→ Join request reale
→ Approval reale
→ Seat decrement via trigger
→ Crew Telegram privata sbloccata solo dopo approval
```

Questo dimostra che il metodo AI Business Factory può trasformare un MVP React locale in un prodotto con backend reale, sicurezza progressiva, test, Git checkpoint e documentazione operativa.

Il valore principale non è solo il risultato tecnico, ma il workflow replicabile:

```text
ChatGPT regia
→ Antigravity esecuzione piccola
→ Terminale verifica
→ Git checkpoint
→ Report operativo
```

Questo pattern può essere riutilizzato per:

- Road to WAO
- BlaBlaParty
- Walbox
- futuri MVP verticali della AI Business Factory

### Open issue esplicito

```text
OPEN ISSUE:
Supabase built-in email provider ha limite 2 emails/h.
Per signup reale stabile serve SMTP custom oppure attendere rate limit.
Confirm email resta ON per prodotto serio.
```

### Stato finale sintetico

| Area | Stato |
|---|---|
| Supabase schema | Funzionante |
| Auth demo Luca/Sara | Funzionante |
| Profile Lite | Funzionante |
| Browse pubblico | Funzionante |
| Create ride reale | Funzionante |
| Join request reale | Funzionante |
| Approval reale | Funzionante |
| Seat decrement trigger | Funzionante |
| Crew unlock Telegram | Funzionante |
| Signup email reale | Bloccato da rate limit provider default |
| SMTP custom | Da configurare |
| General requests reali | Da verificare / non focus finale |
| Realtime | Da verificare / non implementato nel checkpoint |
