# 10_PROFILE_LITE_AUTH_FLOW — Road to WAO

Versione: 1.0  
Area: Road to WAO / Profile Lite + Auth Gate  
Uso: definire quando creare profilo e come collegarlo a rides/requests

---

## 1. Regola principale

Non creare profilo all'ingresso.

```text
Browse libero prima.
Action gate solo quando l'utente vuole fare qualcosa.
```

L'utente deve vedere subito le crew/ride attive senza login.

---

## 2. Quando creare profilo

Creare o completare Profile Lite quando l'utente clicca:

```text
Offro un passaggio
Chiedi di unirti
Lascia richiesta generale
```

Non prima.

---

## 3. Campi Profile Lite

Campi minimi:

```text
nickname
città di partenza
18+ confermato
Telegram username
Instagram opzionale
ruolo: cerco / offro / entrambi
```

Campi tecnici:

```text
user_id = auth.users.id
created_at
updated_at
is_admin false
```

---

## 4. Flusso utente

### Step A — browse libero

```text
Home → Road Board → vede ride aperti
```

L'utente può leggere:

- tratte/città;
- date indicative;
- posti;
- status;
- vibe;
- CTA.

### Step B — action gate

Quando clicca una CTA operativa:

```text
se non autenticato → profile/auth modal
se autenticato ma profilo incompleto → completa Profile Lite
se profilo completo → continua azione originale
```

### Step C — ritorno all'azione originale

Dopo auth/profile:

```text
Offro passaggio → riapre OfferRideModal
Chiedi di unirti → riapre JoinRequestModal per ride selezionato
Lascia richiesta generale → riapre general request flow
```

---

## 5. Come resta collegato l'utente

Scelta consigliata:

```text
Supabase Auth magic link / OTP email
```

Il browser mantiene sessione Supabase.

Dopo login:

```text
auth.uid() → profiles.id → rides.driver_id / requests.requester_id
```

---

## 6. Se cambia dispositivo/browser

Scenario:

```text
utente apre da nuovo telefono/browser
```

Comportamento consigliato:

- deve rifare login magic link/OTP;
- se usa stessa email, recupera stesso `auth.users.id`;
- vede profilo e richieste collegate;
- non usare localStorage come identità reale.

Fallback V0:

- localStorage può servire solo per UX temporanea;
- non deve essere fonte di verità per accessi privati.

---

## 7. Collegamento profile_id / user_id

### profiles

```text
profiles.id = auth.users.id
```

### rides

```text
rides.driver_id = profiles.id
```

### join_requests

```text
join_requests.requester_id = profiles.id
join_requests.ride_id = rides.id
```

### general_requests

```text
general_requests.requester_id = profiles.id
nessun ride_id
```

---

## 8. Telegram unlock rule

Telegram privato è visibile solo se:

```text
utente autenticato
join_request.requester_id = auth.uid()
join_request.status = approved
join_request.ride_id esiste
ride.telegram_group_link non nullo
```

Non visibile per:

```text
anon
driver ride
general_request
pending request
rejected request
archived request
```

---

## 9. Admin flow

Admin entra come utente autenticato con ruolo admin.

Può:

- vedere pending join_requests;
- vedere general_requests;
- approvare/rifiutare/archiviare;
- aggiornare status ride;
- ridurre posti disponibili quando approva join;
- aggiungere/sbloccare Telegram link in modo controllato.

Non deve usare service_role nel browser.

---

## 10. UX copy consigliata

### Prima del gate

```text
Puoi guardare le crew liberamente. Ti chiediamo un profilo leggero solo quando vuoi offrire un posto o chiedere di unirti.
```

### Profile Lite

```text
Crea il tuo profilo leggero
Serve solo per gestire richieste, approvazioni e crew sbloccate. Non sarà pubblico nella board.
```

### 18+

```text
Confermo di avere almeno 18 anni.
```

### Telegram

```text
Il tuo Telegram non viene mostrato pubblicamente. Serve solo per la crew dopo approvazione.
```

---

## 11. Cosa NON fare

```text
NO password custom
NO profilo pubblico complesso
NO foto
NO documento identità
NO chat interna
NO geolocalizzazione precisa
NO lista pubblica utenti
NO Telegram pubblico in board
NO Instagram obbligatorio
NO login obbligatorio per browse
NO localStorage come sicurezza
NO creare account prima che l'utente abbia intenzione di agire
```

---

## 12. Distinzione V0 / MVP / Produzione

### V0 veloce

- action gate semplice;
- profilo minimo;
- magic link/OTP;
- richieste personali.

### MVP serio

- session handling curato;
- RLS verificata;
- admin role testato;
- no dati privati in public board;
- Playwright flow auth-aware.

### Produzione

- privacy/legal review;
- report abuse;
- ruoli admin più robusti;
- audit moderation;
- account deletion/export;
- terms/privacy dedicati.

---

## 13. Stop condition

Fermarsi se l'agente propone:

- login obbligatorio appena si entra;
- profilo social pubblico;
- chat interna;
- password custom;
- documento identità;
- service_role nel frontend;
- Telegram link in RoadBoard pubblica;
- generalRequest con accesso Telegram.
