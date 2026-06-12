# SUPABASE CONTROL ROOM AGENT MASTER PROTOCOL
## Road to WAO / BlaBlaParty / AI Business Factory

**Versione:** 1.0  
**Data:** 2026-06-12  
**Area:** Supabase Backend Agent, Control Room, Crew Engine, Playwright, Demo Users, Testing Protocol  
**Progetti collegati:** Road to WAO, BlaBlaParty, Walbox, Ravers Radar, AI Business Factory  
**Uso previsto:** fonte `.md` da dare a ChatGPT, Antigravity, Supabase Agent, QA Agent o nuova chat di progetto.

---

## 0. Executive Summary

Questo file unifica tre livelli di lavoro emersi durante Road to WAO:

1. **Supabase Backend Agent Protocol**  
   Regole per usare Supabase come backend agentico controllato: schema, RLS, demo users, lifecycle, cleanup, security advisor, test reali e mockati.

2. **Road to WAO Control Room & Crew Engine**  
   Evoluzione della Bacheca + Control Room da semplice pannello di lettura a vero cervello operativo: stati, richieste, matching, Telegram unlock, cleanup test.

3. **AI Business Factory Testing Pattern**  
   Pattern riutilizzabile per ogni MVP futuro:
   - utenti demo;
   - test Playwright mockati;
   - smoke test reale Vercel + Supabase;
   - dati test riconoscibili;
   - cleanup soft;
   - prompt save-token per Antigravity.

La regola madre è:

```text
Prima validiamo il core flow.
Poi rendiamo la Control Room capace di gestire persone reali.
Poi automatizziamo il pattern nella AI Business Factory.
```

---

## 1. Stato attuale validato

### 1.1 Core flow Road to WAO

Al 2026-06-12 il core flow reale è validato:

```text
Vercel production
→ Supabase reale
→ login utenti demo Luca/Sara
→ Luca crea passaggio
→ Sara vede la board
→ Sara invia richiesta di join
→ Sara crea richiesta generale
→ reload / persistenza
→ dati ancora visibili
```

Risultato smoke test reale:

```text
1 passed
```

Il test reale versionato è:

```text
tests/smoke/road-to-wao-vercel-real-smoke.spec.js
```

Commit collegato:

```text
Add real Vercel smoke test for WAO flows
```

### 1.2 Mocked Playwright locale

È stata anche validata una suite mocked locale:

```text
tests/e2e/road-to-wao-current-flows.spec.js
```

Questa suite usa `page.route()` per mockare Supabase Auth e DB, evitando di sporcare il database reale.

Risultato raggiunto:

```text
8 passed
```

Controlla:
- login/sessione mock;
- Offro passaggio success/error;
- no fake success su errore Supabase;
- Chiedo di unirmi success/error;
- Richiesta generale success/error;
- Cleanup demo senza hard delete;
- reload persistence mockata.

### 1.3 Bug importante risolto

Bug precedente:

```text
La UI mostrava successo
ma Supabase poteva fallire
e la card spariva al reload.
```

Fix applicato:

```text
La modale mostra successo solo dopo salvataggio Supabase riuscito.
Se Supabase fallisce, App.jsx rilancia errore e la modale non mostra falso successo.
```

File coinvolti:
- `src/App.jsx`
- `src/components/OfferRideModal.jsx`
- `src/components/JoinRequestModal.jsx`

---

## 2. Supabase Backend Agent — ruolo e confini

Il **Supabase Backend Agent** non è un agente creativo. È un agente tecnico controllato.

### 2.1 Cosa può fare

Può lavorare su:

```text
schema
tabelle
policy RLS
trigger/funzioni
persistenza
demo users
cleanup dati test
Playwright mocked
real smoke test
security advisor
lifecycle states
Supabase service layer
```

### 2.2 Cosa non deve fare liberamente

Non deve:

```text
decidere prodotto
fare redesign UI
toccare .env
hardcodare password
fare hard delete non autorizzati
modificare RLS senza diagnosi
lanciare terminale/test senza permesso
toccare dati reali senza filtro chiaro
```

### 2.3 Modalità operative

Prima di ogni modifica backend:

```text
READ ONLY
NO EDIT
NO TERMINAL
NO TEST RUN
```

Solo dopo diagnosi:

```text
PATCH MINIMA
NO REFACTOR
SHOW DIFF AND STOP
```

---

## 3. Regola Mocked vs Real

La AI Business Factory deve tenere separati due livelli.

| Livello | Scopo | DB | Quando usarlo |
|---|---|---|---|
| **Playwright Mocked** | Testare logica UI/app senza sporcare Supabase | Mock via `page.route()` | Durante sviluppo, bug fix, regression |
| **Real Smoke Vercel** | Testare app pubblicata + Supabase reale + utenti demo | Supabase reale | Dopo deploy, checkpoint, pre-demo |

### 3.1 Regola

```text
Non mischiare mocked test e real smoke test.
```

### 3.2 Dove mettere i file

```text
tests/e2e/     → test mockati locali
tests/smoke/   → smoke test reali Vercel/Supabase
.agents/references/ → knowledge operativa agenti
docs/          → documentazione umana / handoff
```

### 3.3 Attenzione real smoke

Il real smoke crea dati veri. Quindi:

```text
Non deve partire nel test:e2e default.
Va lanciato solo manualmente.
Deve usare utenti demo.
Deve usare dati TEST VERCEL.
Deve avere cleanup soft.
```

---

## 4. Demo Users Protocol

### 4.1 Utenti demo ufficiali Road to WAO

```text
Luca = luca.driver.demo@roadtowao.local
Ruolo: driver/provider/offre passaggio

Sara = sara.raver.demo@roadtowao.local
Ruolo: rider/consumer/chiede di unirsi + crea richiesta generale
```

### 4.2 Regole password

```text
Mai hardcodare password nel codice.
Mai salvare password in file .md.
Mai committare password.
Usare variabili ambiente locali.
```

Esempio:

```bash
export WAO_BASE_URL='https://road-to-wao-app.vercel.app/'
export WAO_LUCA_EMAIL='luca.driver.demo@roadtowao.local'
export WAO_SARA_EMAIL='sara.raver.demo@roadtowao.local'
export WAO_LUCA_PASSWORD='...'
export WAO_SARA_PASSWORD='...'
```

### 4.3 Pattern riutilizzabile Factory

Ogni nuovo MVP dovrebbe avere:

```text
provider.demo@[project].local
consumer.demo@[project].local
admin.demo@[project].local
```

E ruoli chiari.

---

## 5. Test Data Naming Protocol

Ogni test reale deve creare dati riconoscibili.

### 5.1 Prefissi obbligatori

```text
TEST VERCEL
TEST MOCK
DEMO
```

### 5.2 Esempio Road to WAO

```text
TEST VERCEL LUCA OFFRE
TEST VERCEL LUCA BAGAGLIO
TEST VERCEL LUCA STOPS
TEST VERCEL SARA JOIN
TEST VERCEL SARA GENERAL
```

### 5.3 Perché serve

Serve per:

```text
filtrare dati in Supabase
riconoscere dati test in Control Room
pulire senza toccare dati reali
debuggare Playwright
creare report smoke test
```

---

## 6. Supabase Tables & Lifecycle

### 6.1 Tabelle operative Road to WAO

```text
public.profiles
public.rides
public.join_requests
public.general_requests
public.moderation_events
public.ride_secrets
public.profile_secrets
```

### 6.2 Mappatura prodotto

```text
Offro passaggio         → public.rides
Chiedo di unirmi        → public.join_requests
Lascia richiesta generale → public.general_requests
Profilo leggero         → public.profiles
Telegram / contatti     → public.ride_secrets / profile_secrets
```

### 6.3 Lifecycle rides

```text
open       → visibile in Bacheca, posti disponibili
full       → visibile ma pieno o non richiedibile
cancelled  → annullato dal driver/admin
archived   → archiviato/test/storico
completed  → evento/viaggio concluso
```

### 6.4 Lifecycle join_requests

```text
pending    → richiesta inviata, in attesa
approved   → accettata, Telegram/contatto sbloccabile
rejected   → rifiutata
cancelled  → annullata dal passeggero o admin
```

### 6.5 Lifecycle general_requests

```text
pending    → richiesta attiva / da matchare
matched    → associata a ride compatibile
contacted  → utente contattato/admin follow-up
archived   → archiviata/storico/test
```

---

## 7. Public Board vs Control Room

### 7.1 Regola Board pubblica

La Bacheca pubblica deve essere semplice e sicura.

Mostra solo:

```text
rides public/open o public/full
general_requests pubbliche se previsto
CTA principali
nessun Telegram link
nessun dato personale sensibile
nessuno storico interno
```

### 7.2 Regola Control Room

La Control Room deve vedere il lifecycle completo:

```text
open
full
pending
approved
rejected
cancelled
archived
matched
contacted
completed
test/demo
```

### 7.3 Frase guida

```text
La Bacheca serve agli utenti.
La Control Room serve all'admin.
```

---

## 8. Problema attuale Control Room

La Control Room funziona già come pannello di lettura, ma non è ancora un vero cervello operativo.

Attualmente mostra:
- statistiche;
- passaggi aperti;
- richieste generali;
- crew candidate;
- bottone “Pulisci bacheca demo”;
- dati duplicati generati da smoke test;
- stato pending su richieste generali.

Problema:

```text
La Control Room legge i dati, ma non guida ancora il lifecycle.
```

---

## 9. Prossimo obiettivo prodotto

## Control Room V1 — Lifecycle & Test Cleanup UX

Primo task consigliato, prima del matching avanzato.

### 9.1 Obiettivo

Rendere la dashboard abbastanza operativa per:
- capire cosa è reale e cosa è test;
- gestire stati;
- archiviare dati test;
- vedere richieste collegate;
- preparare matching e Telegram unlock.

### 9.2 Non fare subito

Non fare ancora:
- redesign totale;
- backend schema complesso;
- Telegram automation reale;
- matching completamente automatico;
- modifiche RLS;
- pagamenti;
- notifiche.

---

## 10. Form flow da migliorare: stessa lingua tra utente, DB e Control Room

Il prossimo salto prodotto non è solo aggiungere campi. È far parlare la stessa lingua a:

```text
Offro passaggio
Chiedo di unirmi
Richiesta generale
Supabase
Control Room
Matching
Telegram unlock
```

Oggi i tre flussi funzionano, ma devono essere più coerenti.

---

## 11. Offro passaggio — miglioramento

### 11.1 Scopo

Il driver crea una ride gestibile.

### 11.2 Campi minimi consigliati

```text
nickname driver
città partenza
area/zona partenza opzionale
data partenza
data ritorno o “non previsto”
tipo viaggio: solo andata / ritorno / andata e ritorno
fascia oraria partenza
fascia oraria ritorno se presente
posti totali
posti disponibili
bagaglio disponibile: poco / medio / tanto
dettagli bagagli
tappe/fermate
vibe: chill / preciso / festa / silenzioso / flessibile
messaggio driver
conferma 18+
```

### 11.3 Stato iniziale

```text
status = open
visibility = public
```

### 11.4 Control Room deve vedere

```text
driver
profilo
posti
data
return date
fascia oraria
bagagli
tappe
vibe
notes
richieste join collegate
general requests compatibili
status
visibility
Telegram group/link status
```

---

## 12. Chiedo di unirmi — miglioramento

### 12.1 Scopo

Il rider chiede di entrare in una ride specifica.

### 12.2 Campi minimi consigliati

```text
nickname rider
ride_id collegato
città partenza
area/zona partenza
persone
tipo viaggio richiesto
fascia oraria
bagaglio richiesto
dettagli bagaglio
flessibile città vicine
messaggio al driver
conferma 18+
```

### 12.3 Stato iniziale

```text
status = pending
```

### 12.4 Control Room deve vedere

```text
richiesta collegata alla ride
driver
rider
compatibilità città/data/fascia/bagagli/posti
messaggio rider
status
azioni: approve / reject / cancel / archive
Telegram unlock se approved
```

---

## 13. Richiesta generale — miglioramento prioritario

### 13.1 Problema attuale

La richiesta generale ha funzionato nello smoke test, ma manca di campi fondamentali per fare matching serio.

### 13.2 Campi da aggiungere

```text
nickname
città partenza
area/zona partenza
data partenza
data ritorno oppure “non so ancora”
tipo viaggio: solo andata / solo ritorno / andata e ritorno / non so ancora
fascia oraria partenza
fascia oraria ritorno se presente
flessibile città vicine
persone
bagaglio
dettagli bagaglio
messaggio
conferma 18+
```

### 13.3 Stato iniziale

```text
status = pending
```

### 13.4 Control Room deve vedere

```text
richiesta da matchare
città/data/fascia/persona/bagagli
compatibilità con ride aperte
status matching
azioni admin
storia contatto
Telegram status se matchata/approved
```

### 13.5 Regola

```text
Richiesta generale non è “messaggio libero”.
È una scheda strutturata per il matching.
```

---

## 14. Matching Engine V1 — semi-automatico

### 14.1 Non automatico al 100%

Per ora il matching deve essere semi-automatico:

```text
Sistema propone.
Admin conferma.
Telegram si sblocca solo dopo approvazione.
```

### 14.2 Criteri compatibilità V1

```text
città uguale o vicina
data partenza compatibile
data ritorno compatibile se presente
posti disponibili >= persone
bagaglio compatibile
fascia oraria compatibile
stato ride = open
visibility = public
richiesta = pending
```

### 14.3 Output suggerimento

```text
compatibilità alta / media / bassa
motivi compatibilità
rischi o mismatch
azione consigliata
```

---

## 15. Telegram Unlock Protocol

### 15.1 Regola

```text
Il link Telegram non è pubblico in Bacheca.
È visibile/gestibile in Control Room.
È sbloccato solo a utenti approved.
```

### 15.2 Stati Telegram

```text
not_created
created
linked_to_ride
ready_to_unlock
unlocked_for_approved_users
archived
```

### 15.3 Control Room deve gestire

```text
link gruppo Telegram
ride associata
utenti approved
utenti pending
utenti rejected/cancelled
log sblocco
messaggio da inviare
```

---

## 16. Cleanup Strategy V1

### 16.1 Regola

```text
No hard delete in MVP.
Usare soft archive/cancel.
```

### 16.2 Cleanup per tabella

```text
rides            → status = archived
join_requests    → status = cancelled oppure archived
general_requests → status = archived
profiles         → non toccare
auth users       → non toccare
```

### 16.3 Cleanup test Vercel

Filtrare per:
- `TEST VERCEL` nei campi notes/message/luggage/stops;
- nickname demo;
- driver/rider demo;
- data creazione recente;
- città test.

### 16.4 UI cleanup

Bottone Control Room:

```text
Pulisci dati test
```

Non deve dire solo “Pulisci bacheca” perché è ambiguo.

Dovrebbe mostrare:

```text
Anteprima:
- 6 ride TEST VERCEL da archiviare
- 2 join_requests TEST VERCEL da annullare
- 2 general_requests TEST VERCEL da archiviare
- 0 profili toccati
Conferma
```

Dopo:

```text
Report:
- 6 ride archiviate
- 2 join_requests annullate
- 2 general_requests archiviate
- 0 profili modificati
```

---

## 17. Supabase Security Advisor

Warning osservati:

```text
Function Search Path Mutable
Public / Signed-In Users Can Execute SECURITY DEFINER Function
```

### 17.1 Priorità

Non blocca il core flow.  
Non va risolto insieme a feature Control Room.

Task separato:

```text
Supabase Security Hardening V1
```

### 17.2 Regola operativa

Prima:

```text
READ ONLY SECURITY REVIEW
```

Poi:

```text
PATCH SQL MINIMA
ROLLBACK PLAN
TEST
```

Non fare patch SQL casuali.

---

## 18. Playwright Strategy

### 18.1 Mocked Suite

Da mantenere nel default test locale:

```text
npm run test:e2e
```

Controlla regressioni logiche senza DB reale.

### 18.2 Real Smoke Suite

Da lanciare solo manualmente:

```bash
npx playwright test tests/smoke/road-to-wao-vercel-real-smoke.spec.js --headed
```

Controlla app viva, Vercel, Supabase, utenti demo.

### 18.3 Real Smoke Warning

Ogni run crea dati reali.

Dopo i test:
- controllare Control Room;
- pulire dati test con soft archive;
- non committare test-results.

### 18.4 Cosa abbiamo imparato

I test reali devono cercare testi **visibili in UI**, non necessariamente campi interni Supabase.

Esempio:
- la card ride mostra `Milano`, `WAO Festival`, `Driver: Luca Supabase`;
- non mostra necessariamente `TEST VERCEL LUCA OFFRE`;
- quindi lo smoke test deve essere coerente con UI reale.

---

## 19. Antigravity Save-Token Protocol

### 19.1 Regola

Antigravity è executor, non direttore creativo.

### 19.2 Prompt corretti

Per analisi:

```text
READ ONLY.
NO EDIT.
NO TERMINAL.
NO TEST RUN.
```

Per patch:

```text
PATCH MINIMA.
NO REFACTOR.
NO TERMINAL.
NO TEST RUN.
SHOW DIFF AND STOP.
```

### 19.3 Modelli

```text
Flash Low    → micro fix, testi, assert Playwright
Flash Medium → file singoli, doc, componenti semplici
Flash High   → bug logici, Supabase, async, Control Room audit
Pro          → architettura, schema/RLS, multi-file complessi
```

### 19.4 Mai usare prompt generici

Non dire:

```text
sistema tutto
guarda il progetto
fai tu
```

Dire:

```text
modifica solo X
non toccare Y
show diff and stop
```

---

## 20. Roadmap prossimi passaggi

### Fase 0 — Stato attuale

```text
Core flow OK
Mocked tests OK
Real smoke Vercel OK
Supabase salva/rilegge OK
```

### Fase 1 — Cleanup dati test

Obiettivo:
- non sporcare Control Room;
- archiviare dati `TEST VERCEL`;
- non toccare profili/utenti.

Task:
```text
Control Room: preview cleanup + soft archive test data
```

Modello:
```text
Gemini Flash High read-only audit
Gemini Flash Medium patch minima
```

### Fase 2 — Control Room V1 Lifecycle

Obiettivo:
- filtri stati;
- real/test toggle;
- dettaglio ride;
- azioni per ride/request;
- richieste collegate.

Task:
```text
Control Room V1 — Lifecycle & Test Cleanup UX
```

### Fase 3 — Form language alignment

Obiettivo:
- Offro passaggio, Chiedo di unirmi e Richiesta generale parlano la stessa lingua;
- aggiungere date partenza/ritorno a richiesta generale;
- uniformare campi utili al matching.

Task:
```text
Align ride/join/general request forms for matching
```

### Fase 4 — Matching Suggestions V1

Obiettivo:
- suggerire compatibilità ride ↔ richieste;
- admin conferma;
- stato `matched`.

Task:
```text
Build semi-automatic crew matching suggestions
```

### Fase 5 — Telegram Unlock V1

Obiettivo:
- link Telegram gestito in Control Room;
- sblocco solo per approved;
- nessun link pubblico.

Task:
```text
Add Telegram unlock lifecycle to Control Room
```

### Fase 6 — Supabase Security Hardening

Obiettivo:
- gestire Security Advisor;
- search_path;
- SECURITY DEFINER;
- RLS review.

Task:
```text
Supabase Security Hardening V1
```

---

## 21. Prompt READ ONLY consigliato per prossimo task

```text
ROAD TO WAO — CONTROL ROOM V1 READ ONLY AUDIT

Modalità:
READ ONLY.
NO EDIT.
NO TERMINAL.
NO TEST RUN.
NO COMMIT.

Leggi:
- .agents/references/SUPABASE_CONTROL_ROOM_AGENT_MASTER_PROTOCOL.md
- .agents/references/ANTIGRAVITY_SAVE_TOKEN_AGENT_WORKFLOW.md
- src/App.jsx
- componenti Control Room / AdminPanel / Dashboard collegati
- servizi Supabase collegati solo se necessario

Obiettivo:
analizza come è costruita oggi la Control Room e proponi una Control Room V1 senza rompere il core flow già validato.

Devi produrre:
1. file coinvolti;
2. come vengono lette rides, join_requests, general_requests;
3. quali stati sono già disponibili;
4. cosa manca per filtrare lifecycle;
5. come distinguere dati reali vs TEST VERCEL;
6. patch minima consigliata;
7. rischi;
8. test manuale;
9. se serve aggiornare Playwright mocked o real smoke.

Vincoli:
- non modificare file;
- non toccare RLS;
- non toccare schema;
- non toccare auth;
- non eseguire comandi;
- fermati dopo il report.
```

---

## 22. Prompt PATCH MINIMA consigliato per Cleanup UX

```text
ROAD TO WAO — CONTROL ROOM TEST CLEANUP UX PATCH

Modalità:
PATCH MINIMA.
NO REFACTOR.
NO TERMINAL.
NO TEST RUN.
SHOW DIFF AND STOP.

File consentiti:
- [file Control Room/AdminPanel identificati nel read-only audit]

File vietati:
- .env
- Supabase schema/RLS
- Auth
- tests/smoke se non richiesto
- tests/e2e se non richiesto
- package.json

Obiettivo:
migliorare la gestione dei dati TEST VERCEL in Control Room:
- filtro Mostra/Nascondi test data
- badge TEST
- preview cleanup
- soft archive/cancel
- report post-cleanup

Vincoli:
- no hard delete;
- non toccare profili;
- non toccare utenti Auth;
- non rompere Bacheca;
- non cambiare core flow;
- non fare redesign totale.

Output:
- file modificati;
- diff;
- cosa testare manualmente;
- eventuale aggiornamento Playwright consigliato.
```

---

## 23. Criteri di successo Control Room V1

La Control Room V1 sarà valida quando l’admin può:

```text
vedere ride aperte
distinguere real/test
filtrare status
aprire dettaglio ride
vedere richieste join collegate
vedere richieste generali compatibili
archiviare dati TEST VERCEL senza hard delete
non vedere link Telegram in pubblico
capire chi è pending/approved/rejected
preparare match manuale
```

---

## 24. AI Business Factory Reuse

Questo file non vale solo per Road to WAO.

Pattern riutilizzabile:

```text
Ogni MVP deve avere:
- backend protocol
- demo users
- mocked test
- real smoke test
- cleanup strategy
- lifecycle states
- security hardening backlog
- agent save-token rules
```

La Factory futura dovrà poter generare questi elementi quasi automaticamente.

Esempio futuro Walbox:
```text
manager.demo@walbox.local
customer.demo@walbox.local
tests/e2e mocked queue
tests/smoke Vercel + Supabase realtime
cleanup TEST WALBOX
Control Room locale
```

Esempio futuro BlaBlaParty:
```text
organizer.demo@blablaparty.local
raver.demo@blablaparty.local
crew board mocked tests
real smoke test
cleanup TEST PARTY
moderation Control Room
```

---

## 25. Conclusione

Road to WAO ha superato il checkpoint più importante:

```text
Prodotto vivo + Supabase reale + Vercel + utenti demo + smoke test versionato.
```

Il prossimo problema non è più “funziona?”.

Il prossimo problema è:

```text
Possiamo gestire persone reali, richieste, stati, test data, matching e Telegram senza confusione?
```

Risposta operativa:

```text
Prima Control Room V1.
Poi form alignment.
Poi matching.
Poi Telegram unlock.
Poi security hardening.
```

