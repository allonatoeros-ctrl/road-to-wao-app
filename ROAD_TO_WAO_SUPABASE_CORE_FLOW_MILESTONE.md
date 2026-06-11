# Road to WAO — Supabase Core Flow Milestone

**Data milestone:** 2026-06-11  
**File:** `ROAD_TO_WAO_SUPABASE_CORE_FLOW_MILESTONE.md`  
**Progetto:** Road to WAO / BlaBlaParty  
**Tipo milestone:** integrazione core flow Supabase reale

---

## 1. Stato attuale app

Road to WAO è ora una app React/Vite con backend Supabase collegato per il core flow principale di crew ride / festival car sharing.

L’app supporta attualmente:

- browse pubblico della Bacheca Viaggi;
- autenticazione email/password tramite Supabase Auth;
- Profile Lite utente;
- creazione reale di passaggi su Supabase;
- richiesta reale di unirsi a un passaggio su Supabase;
- approvazione richiesta lato driver/admin;
- scalata automatica dei posti tramite trigger Supabase;
- sblocco del link crew privato solo dopo approvazione.

La logica pubblica/privata è stata separata: la Bacheca pubblica mostra viaggi, posti e informazioni safe, ma non espone link Telegram o dati privati.

---

## 2. Stack tecnico usato

| Area | Tecnologia / servizio |
|---|---|
| Frontend | React + Vite |
| Backend / Database | Supabase |
| Auth | Supabase Auth email/password |
| Database realtime / API | Supabase REST / client JS |
| Hosting locale | `npm run dev -- --host 0.0.0.0 --port 5173` |
| Test | Playwright |
| Versionamento | Git |
| Deployment futuro | Da verificare |

---

## 3. File e componenti principali coinvolti

| File / componente | Ruolo |
|---|---|
| `src/App.jsx` | Orchestrazione stato app, caricamento ride, gestione submit offer/join, admin approval, auth gate, crew unlock |
| `src/services/supabaseClient.js` | Configurazione client Supabase |
| `src/services/roadToWaoDb.js` | Service layer Supabase: rides, auth, profile, join requests, approval, crew unlock |
| `src/components/RoadBoard.jsx` | Bacheca pubblica dei viaggi |
| `src/components/OfferRideModal.jsx` | Modale offerta passaggio |
| `src/components/JoinRequestModal.jsx` | Modale richiesta join |
| `src/components/AdminPanel.jsx` | Control Room / approvazione richieste |
| `src/components/MessagesPanel.jsx` | Messaggi, stato richieste e crew sbloccata |
| `src/components/ProfilePanel.jsx` | Profile Lite, login/signup/reset UX, stato viaggio |
| `supabase/road_to_wao_schema_v1.sql` | Schema Supabase, RLS, trigger e policy |
| `tests/road-to-wao-private-dry-run.spec.js` | Test Playwright del flow demo/private dry-run |

---

## 4. Tabelle Supabase usate

| Tabella | Uso |
|---|---|
| `profiles` | Profilo pubblico leggero: nickname, città, ruolo, maggiore età, admin flag se presente |
| `profile_secrets` | Dati privati utente: Telegram/Instagram username |
| `rides` | Passaggi reali pubblici |
| `ride_secrets` | Link privato Telegram crew associato al ride |
| `join_requests` | Richieste di unirsi a un passaggio |
| `general_requests` | Richieste generali, presente nello schema; integrazione completa da verificare |
| `moderation_events` | Audit/moderazione, presente nello schema; integrazione completa da verificare |

---

## 5. Flow core validato tipo Fubles

### 5.1 Browse pubblico

Validato: l’utente non loggato può vedere la Bacheca Viaggi e i ride pubblici.

Regola prodotto attuale:

- Home pubblica visibile;
- Bacheca Viaggi pubblica visibile;
- ride pubblici visibili;
- nessun link Telegram esposto pubblicamente;
- azioni di partecipazione bloccate se non autenticato.

### 5.2 Login / Profile Lite

Validato con utenti demo Supabase:

- `luca.driver.demo@roadtowao.local`
- `sara.raver.demo@roadtowao.local`

Profile Lite permette di leggere/mostrare:

- nickname;
- città di partenza;
- ruolo: seeker / driver / both;
- conferma maggiore età;
- Telegram username opzionale;
- Instagram username opzionale.

È stata migliorata la UX di auth con stati separati:

- login;
- signup;
- reset password;
- Profile Lite editor.

### 5.3 Offri passaggio reale su Supabase

Validato: utente autenticato può creare un passaggio reale.

Esempio reale emerso durante test:

- `Bologna → WAO Festival`
- `2 posti`
- `status = open`
- `visibility = public`

Il ride viene inserito in `public.rides`.

### 5.4 Chiedi di unirti reale su Supabase

Validato: utente autenticato può chiedere di unirsi a un ride reale.

Esempio reale emerso durante test:

- Sara ha creato una `join_request`;
- `status = pending`;
- `seats_requested = 1`;
- `requester_id = 0e16afb5-770d-4ce2-8d1c-0c463336261d`.

La lettura via `curl` anon restituiva `[]` per RLS, ma la riga risultava visibile da SQL Editor.

### 5.5 Driver/admin approva

Validato: richiesta pending approvata da Control Room/Admin flow.

Risultato verificato in Supabase:

- `join_requests.status = approved`;
- `approved_at` valorizzato.

### 5.6 Posti scalano via trigger Supabase

Validato: dopo approvazione, il numero di posti disponibili nel ride è scalato automaticamente.

Esempio verificato:

- ride Luca Milano aveva `seats_available = 3`;
- dopo approvazione richiesta Sara, `seats_available = 2`.

Questo conferma che il decremento posti è gestito lato Supabase trigger e non manualmente lato React.

### 5.7 Crew privata / Telegram solo dopo approvazione

Validato: il link Telegram privato viene letto da `ride_secrets` e sbloccato solo dopo approvazione.

Esempio inserito:

- `ride_id = 0692b606-0bd3-475c-9eed-caf1e4175732`;
- `telegram_group_link = https://t.me/+road_to_wao_demo_private_crew`.

Validazione UI:

- Sara approvata vede “Crew sbloccata”;
- Sara vede il bottone “Apri Telegram Crew” in Messaggi/Profilo;
- Profilo mostra “Crew attiva”;
- RoadBoard pubblica non deve mostrare link Telegram.

---

## 6. Cosa funziona oggi

| Funzione | Stato |
|---|---|
| Browse pubblico Bacheca | Funziona |
| Auth gate su azioni partecipative | Funziona |
| Login utenti demo Supabase | Funziona |
| Profile Lite demo | Funziona |
| Creazione ride reale | Funziona |
| Lettura ride reali in RoadBoard | Funziona |
| Join request reale | Funziona |
| Approval join request | Funziona |
| Trigger scalata posti | Funziona |
| Crew unlock / Telegram privato post-approval | Funziona |
| RoadBoard senza Telegram pubblico | Funziona / da continuare a monitorare |
| Signup reale con email personale | Bloccato da rate limit email Supabase default |
| Reset password reale | Service presente; validazione completa da verificare |

---

## 7. Stato validazione

| Controllo | Stato |
|---|---|
| `npm run build` | OK |
| Playwright full private flow | Non rieseguito al checkpoint / bloccato da accessi Auth-rate-limit |
| Core flow manuale | Validato durante implementazione |
| Creazione ride reale DB | Validata |
| Creazione join request reale DB | Validata |
| Approval reale DB | Validata |
| Trigger seats decrement | Validato |
| Crew unlock link privato | Validato manualmente |
| Signup reale nuova email | Da verificare dopo risoluzione rate limit / SMTP |

Nota: il warning Vite sui chunk superiori a 500 kB è emerso, ma non è bloccante per questa milestone.

---

## 8. Sicurezza / RLS emersa

Sono emersi e applicati questi principi di sicurezza:

- `rides` è pubblico-safe e leggibile per browse;
- `ride_secrets` contiene il link Telegram e non deve mai essere esposto pubblicamente;
- RoadBoard deve ricevere `telegramUrl: null` o non ricevere Telegram URL;
- `join_requests` non è pubblicamente leggibile via anon key;
- l’utente non autenticato può navigare ma non partecipare;
- richiesta join approvata sblocca crew privata;
- pending / rejected / cancelled non devono vedere link crew;
- driver del ride può accedere alla crew;
- approved requester può accedere alla crew;
- admin può accedere se supportato da schema/policy;
- decremento posti avviene via trigger Supabase su approval, non manualmente lato client;
- `profile_secrets` separa dati social privati dal profilo pubblico;
- `Confirm email` resta ON per prodotto serio.

Da verificare in seguito: copertura completa RLS per tutti i casi limite e admin/driver permissions in scenari multi-utente reali.

---

## 9. Problemi aperti

### OPEN ISSUE: Supabase built-in email provider

Supabase built-in email provider ha limite 2 emails/h.  
Per signup reale stabile serve SMTP custom oppure attendere rate limit.  
Confirm email resta ON per prodotto serio.

Dettaglio emerso:

- tentativi di signup con email reale hanno prodotto `email rate limit exceeded`;
- in Supabase Auth → Rate Limits il limite email default è risultato fisso;
- Supabase segnala che per aggiornare la configurazione email serve Custom SMTP o Send Email Hook;
- l’utente reale non risultava creato in Authentication → Users dopo l’errore.

### URL Configuration

È stata controllata la sezione Auth → URL Configuration.

Stato visto:

- Site URL aggiornato a `http://localhost:5173`;
- redirect locale telefono `http://192.168.1.52:5173` presente.

Da verificare:

- aggiunta wildcard locali se necessarie;
- aggiunta URL Vercel quando disponibile;
- comportamento conferma email/reset su mobile e desktop.

### Signup reale end-to-end

Da verificare quando il rate limit email non blocca più o dopo configurazione SMTP:

- crea account da app;
- conferma email;
- login;
- salvataggio Profile Lite;
- creazione ride/join senza intervento manuale Supabase.

### Test automatici aggiornati

Il vecchio Playwright full private flow era nato per demo/local fallback.  
Dopo auth gate e Supabase reale, va aggiornato o affiancato da nuovi test auth-aware.

Stato al checkpoint:

- non rieseguito come validazione finale completa;
- core flow validato manualmente durante implementazione.

### General requests

La tabella `general_requests` è presente nello schema e nel prodotto concettuale, ma la piena integrazione reale Supabase è da verificare.

---

## 10. Prossimi step consigliati

1. Chiudere eventuali commit pendenti separando:
   - crew unlock UI;
   - signup confirmation UX;
   - service changes.
2. Creare un test manuale breve post-milestone:
   - login Luca;
   - login Sara;
   - visualizzazione crew sbloccata;
   - verifica RoadBoard senza Telegram.
3. Aggiornare o creare test Playwright auth-aware.
4. Verificare Signup reale quando il rate limit Supabase non blocca più.
5. Valutare configurazione SMTP custom per signup/reset email stabile.
6. Consolidare la parte General Request su Supabase.
7. Preparare successivo checkpoint prima di nuove feature.

---

## 11. Nota finale milestone

Questa milestone segna il passaggio da una demo locale a un core flow reale Supabase per Road to WAO.

Il prodotto ora dimostra la logica principale:

```text
Bacheca pubblica
→ profilo leggero
→ richiesta partecipazione
→ approvazione
→ posti aggiornati
→ crew privata sbloccata
```

Questo rappresenta il nucleo operativo del modello tipo Fubles applicato a viaggi/crew per festival.
