# ROAD_TO_WAO_AUTH_STABILIZATION_NEXT_STEPS

**Data:** 2026-06-11  
**Progetto:** Road to WAO / BlaBlaParty  
**Area:** Supabase Auth + Profile Lite  
**Tipo documento:** Stabilization next steps dopo milestone Supabase core flow

---

## 1. Obiettivo del documento

Questo file documenta e prepara la stabilizzazione della parte **Auth/Profile** dopo la milestone tecnica del core flow Supabase.

La milestone core flow è stata raggiunta: l’app Road to WAO usa Supabase per il flusso principale stile Fubles:

- browse pubblico dei passaggi;
- login / Profile Lite;
- offerta passaggio reale su Supabase;
- richiesta join reale su Supabase;
- approvazione driver/admin;
- decremento posti via trigger Supabase;
- unlock della crew privata / Telegram solo dopo approvazione.

Questo documento **non introduce nuove feature**.  
Serve a stabilizzare login, signup, logout, conferma email e persistenza profilo prima di una demo seria o di utenti reali.

---

## 2. Stato attuale Auth/Profile

| Area | Stato attuale |
|---|---|
| Supabase Auth | Attivo |
| Email/password provider | Attivo |
| Signup nuovi utenti | Attivo |
| Confirm email | ON |
| Profile Lite | Implementato in app |
| Profilo creato dopo signup | Funzionante secondo ultimo update |
| Built-in email provider Supabase | Funzionante, ma fragile per limiti email |
| SMTP custom | Non ancora configurato |
| Reset password | Presente nel flusso UI / Da verificare end-to-end |
| Redirect conferma email | Fragile / Da verificare su localhost, telefono e futura Vercel |
| Demo users Luca/Sara | Presenti e usati per validazione manuale |
| Utente reale creato | Sì, secondo ultimo update dell’utente |
| Persistenza profilo | Da verificare con checklist completa |

---

## 3. Cosa ora funziona

Dopo il blocco iniziale causato dal rate limit email di Supabase, il signup/profilo è tornato a funzionare e almeno un profilo è stato creato.

Funzionano o risultano implementati:

- creazione utente tramite Supabase Auth;
- ricezione email di conferma;
- login email/password;
- logout;
- Profile Lite con dati utente;
- salvataggio profilo su Supabase;
- separazione tra account Auth e dati profilo;
- uso di `profiles` per dati pubblici/operativi;
- uso di `profile_secrets` per dati più sensibili come Telegram/Instagram;
- protezione del flusso partecipativo: browse pubblico consentito, azioni partecipative dietro login;
- integrazione Auth con il flow RoadBoard / OfferRide / JoinRequest.

Da verificare con test sistematico:

- conferma email da link aperto su telefono;
- conferma email da link aperto su Mac;
- redirect corretto dopo conferma email;
- reset password completo;
- persistenza profilo dopo refresh;
- persistenza profilo dopo logout/login;
- comportamento con email già registrata;
- comportamento con email non confermata.

---

## 4. Cosa resta fragile

### 4.1 Built-in email provider Supabase

Supabase built-in email provider funziona, ma nel progetto è emerso un limite forte:

```text
Supabase built-in email provider ha limite 2 emails/h.
```

Questo ha causato l’errore:

```text
email rate limit exceeded
```

La consequence pratica è che durante test ripetuti di signup / conferma email / reset password l’app può sembrare rotta anche se il codice funziona.

---

### 4.2 Redirect conferma email

È emerso che, registrandosi da telefono, il link di conferma può puntare a `localhost`.

Questo è fragile perché:

- `localhost` da telefono indica il telefono stesso, non il Mac;
- l’app locale su telefono gira tramite IP LAN, ad esempio `http://192.168.1.52:5173`;
- Supabase usa il redirect configurato o quello passato dal codice;
- se il codice non passa un redirect dinamico, Supabase può usare la Site URL di default.

Stato consigliato:

```text
signUpWithEmail deve usare emailRedirectTo basato su window.location.origin.
```

Da verificare se il fix è già stato applicato nel repo.

---

### 4.3 URL Configuration Supabase

Sono stati aggiunti i link richiesti nella configurazione Supabase, ma va verificato che siano presenti e completi.

Redirect URLs da avere durante sviluppo locale:

```text
http://localhost:5173
http://localhost:5173/**
http://192.168.1.52:5173
http://192.168.1.52:5173/**
```

Quando si passerà a Vercel, aggiungere anche:

```text
https://<vercel-project>.vercel.app
https://<vercel-project>.vercel.app/**
```

Da verificare il dominio finale Vercel.

---

### 4.4 Test automatici Auth

Il Playwright full private flow esistente non è stato rieseguito al checkpoint finale della stabilizzazione Auth.

Motivi emersi:

- accessi Auth reali;
- rate limit email;
- conferma email;
- flow diventato più realistico rispetto al vecchio test locale/demo.

Stato:

```text
Playwright full private flow: da aggiornare e rieseguire dopo stabilizzazione Auth/Profile.
```

---

## 5. Limite Supabase built-in email provider 2 emails/h

Open issue da tenere esplicito:

```text
OPEN ISSUE:
Supabase built-in email provider ha limite 2 emails/h.
Per signup reale stabile serve SMTP custom oppure attendere rate limit.
Confirm email resta ON per prodotto serio.
```

Implicazioni:

- non fare test ripetuti con molte email reali;
- evitare di cliccare continuamente “Crea account”;
- per demo tecnica usare utenti demo creati da dashboard;
- per demo seria configurare SMTP custom;
- per utenti reali non affidarsi al provider email built-in.

---

## 6. Perché SMTP custom resta consigliato

SMTP custom resta consigliato perché:

| Motivo | Impatto |
|---|---|
| Aumenta i limiti email | Evita blocchi durante signup/reset |
| Migliora deliverability | Le email arrivano più facilmente |
| Permette mittente brandizzato | Es. `noreply@roadtowao...` |
| Migliora affidabilità demo | Meno rischio di blocco durante presentazione |
| Supporta prodotto reale | Necessario prima di utenti veri |
| Riduce falsi bug | Evita di confondere limiti email con bug app |

Provider possibili discussi:

- Resend;
- Brevo;
- SendGrid;
- Mailgun;
- Amazon SES.

Scelta provider: **Da verificare**.

Dominio mittente: **Da verificare**.

---

## 7. Confirm email ON per prodotto serio

Decisione di prodotto:

```text
Confirm email resta ON.
```

Motivi:

- riduce account fake;
- verifica email reale;
- rende più solido reset password;
- aumenta credibilità per una community reale;
- è più coerente con un prodotto da usare con utenti veri.

Per test molto veloci si potrebbe disattivare temporaneamente, ma non è la direzione consigliata per una demo seria.

---

## 8. Checklist test Auth/Profile

### 8.1 Signup

| Test | Esito atteso | Stato |
|---|---|---|
| Signup con email reale nuova | Email di conferma inviata | Da verificare |
| Signup con email già registrata | Messaggio user-friendly | Da verificare |
| Signup con email non valida | Messaggio user-friendly | Da verificare |
| Signup durante rate limit | Messaggio chiaro | Da verificare |
| Signup da Mac localhost | Redirect corretto | Da verificare |
| Signup da telefono IP LAN | Redirect corretto | Da verificare |
| Signup crea utente in Authentication → Users | Utente visibile | Da verificare |
| Signup crea o permette creazione Profile Lite | Profilo salvato | Da verificare |

---

### 8.2 Email confirmation

| Test | Esito atteso | Stato |
|---|---|---|
| Click link conferma da Mac | Torna all’app corretta | Da verificare |
| Click link conferma da telefono | Torna all’app corretta | Da verificare |
| Utente risulta confirmed in Supabase | Email confirmed | Da verificare |
| Login dopo conferma email | Login OK | Da verificare |
| Login prima di conferma email | Blocco/messaggio coerente | Da verificare |

---

### 8.3 Login

| Test | Esito atteso | Stato |
|---|---|---|
| Login con email/password corretti | Accesso OK | Da verificare |
| Login con password errata | Messaggio chiaro | Da verificare |
| Login con email non registrata | Messaggio chiaro | Da verificare |
| Login utente demo Luca | Accesso OK | Da verificare |
| Login utente demo Sara | Accesso OK | Da verificare |

---

### 8.4 Logout

| Test | Esito atteso | Stato |
|---|---|---|
| Logout da profilo | Sessione rimossa | Da verificare |
| Dopo logout browse pubblico resta attivo | RoadBoard visibile | Da verificare |
| Dopo logout azioni partecipative bloccate | Redirect/banner Profilo | Da verificare |
| Login successivo ripristina profilo | Profilo recuperato | Da verificare |

---

### 8.5 Profile persistence

| Test | Esito atteso | Stato |
|---|---|---|
| Salvataggio nickname | Visibile dopo refresh | Da verificare |
| Salvataggio città partenza | Visibile dopo refresh | Da verificare |
| Salvataggio ruolo | Visibile dopo refresh | Da verificare |
| Salvataggio is_of_age | Persistente | Da verificare |
| Salvataggio Telegram/Instagram | Salvato in `profile_secrets` | Da verificare |
| Refresh pagina | Sessione/profilo persistono | Da verificare |
| Logout/login | Profilo recuperato | Da verificare |

---

## 9. Cosa fare manualmente in Supabase

### 9.1 Authentication → Users

Controllare:

- utente creato;
- email;
- UID;
- email confirmed;
- last sign in;
- provider email;
- eventuali errori o stato anomalo.

---

### 9.2 Authentication → URL Configuration

Verificare:

```text
Site URL:
http://localhost:5173
```

Redirect URLs dev:

```text
http://localhost:5173
http://localhost:5173/**
http://192.168.1.52:5173
http://192.168.1.52:5173/**
```

Redirect URLs Vercel:

```text
Da verificare dopo deploy.
```

---

### 9.3 Authentication → Rate Limits

Controllare:

```text
Rate limit email built-in: 2 emails/h
```

Nota:

```text
Non modificabile senza SMTP custom o email hook.
```

---

### 9.4 Authentication → Emails

Controllare:

- template conferma email;
- template reset password;
- eventuale configurazione SMTP custom;
- sender email.

SMTP custom:

```text
Da configurare prima di demo seria / utenti reali.
```

---

### 9.5 Table Editor / SQL Editor

Controllare `profiles`:

```sql
select id, nickname, departure_city, role, is_of_age, created_at
from public.profiles
order by created_at desc
limit 10;
```

Controllare `profile_secrets`:

```sql
select id, telegram_username, instagram_username, created_at
from public.profile_secrets
order by created_at desc
limit 10;
```

Da verificare se questi campi corrispondono esattamente allo schema finale.

---

## 10. Cosa può fare Antigravity

Antigravity può intervenire solo su task piccoli e controllati.

### Task adatti ad Antigravity

| Task | File probabili | Modello consigliato |
|---|---|---|
| Fix redirect signup `emailRedirectTo` | `src/services/roadToWaoDb.js` | Gemini Flash Medium |
| Migliorare messaggi errore Auth | `src/components/ProfilePanel.jsx` | Gemini Flash Medium |
| Aggiungere banner “controlla email” più chiaro | `src/components/ProfilePanel.jsx` | Gemini Flash Medium |
| Rendere reset password più chiaro | `src/components/ProfilePanel.jsx`, service se necessario | Gemini Flash Medium |
| Aggiungere piccolo stato “email non confermata” | `src/components/ProfilePanel.jsx` | Gemini Flash High se delicato |
| Creare test Playwright auth-gate aggiornato | `tests/...` | Gemini Flash High |

---

### Regole per Antigravity

```text
- Un task alla volta
- Un file alla volta quando possibile
- Non usare terminale
- Non fare git
- Non fare npm run build
- Non fare refactor generale
- Non toccare milestone report
- Non toccare experience report
```

Prompt pattern:

```text
TOKEN-SAVER FORMAT

Task level: 2/5
Model: Gemini Flash Medium
Terminal permission: forbidden

Do not use terminal.
Do not run git.
Do not run npm.
Do not run tests.

Read:
- <file necessario>

Modify only:
- <file da modificare>

Goal:
<obiettivo singolo>

Stop condition:
Report changed files.
Do not continue.
```

---

## 11. Rischi

| Rischio | Impatto | Mitigazione |
|---|---|---|
| Rate limit email Supabase | Signup apparentemente rotto | SMTP custom o attesa |
| Redirect errato a localhost | Conferma email fallisce da telefono | `emailRedirectTo: window.location.origin` + Redirect URLs |
| Confirm email non completato | Login bloccato | Messaggi UI chiari |
| Profile Lite non persistente | Utente perde dati profilo | Test SQL + refresh/logout/login |
| RLS troppo restrittive | Profilo non leggibile/salvabile | Test manuale Supabase + log |
| RLS troppo permissive | Dati privati esposti | Verifica `profile_secrets` e `ride_secrets` |
| Antigravity modifica troppo | Regressione core flow | Prompt limitati + git checkpoint |
| Test vecchi non aggiornati | Falsi fail | Aggiornare Playwright al flow Auth reale |
| SMTP configurato male | Email non arrivano | Test su account singolo prima demo |

---

## 12. Rollback

### 12.1 Rollback codice

Prima di ogni fix Auth/Profile:

```bash
git status --untracked-files=all
```

Dopo un fix riuscito:

```bash
npm run build
git add <file-modificato>
git commit -m "<messaggio commit>"
```

Se una modifica rompe il flow:

```bash
git restore <file-modificato>
```

Oppure, se già committata:

```bash
git log --oneline
git revert <commit_hash>
```

---

### 12.2 Rollback configurazione Supabase

Da fare manualmente:

- ripristinare Site URL precedente se redirect rompe conferma email;
- rimuovere Redirect URLs errati;
- disattivare temporaneamente SMTP custom se configurato male;
- usare utenti demo Luca/Sara se signup reale è bloccato;
- verificare `Authentication → Users` per stato utente.

---

## 13. Criteri di successo

La stabilizzazione Auth/Profile è completata quando:

| Criterio | Stato richiesto |
|---|---|
| Signup reale | Funziona con email confermata |
| Email confirmation | Redirect corretto da Mac e telefono |
| Login | Funziona dopo conferma email |
| Logout | Funziona e blocca azioni private |
| Profile Lite | Salva dati correttamente |
| Profile persistence | Dati persistono dopo refresh/logout/login |
| Supabase Users | Utenti reali visibili e confirmed |
| `profiles` | Profilo pubblico creato e leggibile |
| `profile_secrets` | Dati privati salvati e non pubblici |
| Auth gate | Browse pubblico sì, partecipazione solo logged-in |
| Build | `npm run build` OK |
| Test manuale | Signup → Profile → Offer/Join validato |
| Rate limit | Gestito con SMTP custom o procedura demo chiara |

---

## 14. Prossimo ordine operativo consigliato

Prima di nuove feature:

1. Verificare se `signUpWithEmail` usa `emailRedirectTo: window.location.origin`.
2. Controllare Supabase Redirect URLs.
3. Fare un solo test signup reale da Mac.
4. Fare un solo test signup reale da telefono.
5. Verificare `Authentication → Users`.
6. Verificare `profiles`.
7. Verificare `profile_secrets`.
8. Testare logout/login.
9. Eseguire `npm run build`.
10. Commit del fix Auth/Profile se ci sono modifiche.
11. Solo dopo: valutare SMTP custom per demo seria.

---

## 15. Nota finale

La parte Auth/Profile non va trattata come “feature secondaria”.  
Per Road to WAO è il punto che separa una demo visiva da un prodotto realmente usabile.

Prima di aggiungere nuove funzioni, bisogna rendere stabile questo blocco:

```text
utente reale → email confermata → login → profilo salvato → partecipazione controllata
```

Solo dopo ha senso continuare con nuove schermate, automazioni o miglioramenti di prodotto.

---

## Manual Auth/Profile Test — 2026-06-11

Stato: PASS parziale su demo users.

Validato manualmente:

- login utente demo Luca OK;
- Profile Lite Luca caricato correttamente;
- dati profilo Luca visibili: nickname, città, ruolo, Telegram, Instagram;
- stato viaggio Luca visibile;
- Crew attiva visibile;
- login utente demo Sara OK;
- Profile Lite Sara caricato correttamente;
- richiesta approved visibile;
- Crew sbloccata / Telegram crew visibile;
- logout OK.

Non testato in questo passaggio:

- signup nuova email reale;
- conferma email da telefono;
- conferma email da Mac;
- reset password end-to-end;
- SMTP custom.

Nota:
Non sono stati eseguiti test ripetuti di signup/reset per evitare il rate limit Supabase built-in email provider.

