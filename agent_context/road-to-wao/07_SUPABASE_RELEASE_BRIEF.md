# 07_SUPABASE_RELEASE_BRIEF — Road to WAO

Versione: 1.0  
Area: Road to WAO / BlaBlaParty / Supabase First Release  
Uso: contesto breve per Antigravity prima di implementare backend

---

## 1. Obiettivo release reale

Portare Road to WAO da demo locale React/Vite a prima app multi-utente con stato condiviso:

```text
utente A crea ride
utente B vede ride
utente B chiede di unirsi
admin approva
utente B vede crew sbloccata
board/profilo/messaggi si aggiornano
```

La release non deve diventare prodotto enterprise. Deve rendere reale il flow già validato in locale.

---

## 2. Perché serve Supabase

Oggi lo stato vive in React locale dentro `App.jsx`. Questo significa:

- ogni browser vede dati diversi;
- refresh/reset può perdere stato;
- telefono e desktop non condividono board reale;
- admin/moderazione non possono lavorare su dati persistenti;
- non esiste identità utente minima;
- non esiste storico richieste.

Supabase serve per:

- persistenza Postgres;
- auth/profile lite;
- CRUD controllato;
- RLS;
- Realtime su rides/requests;
- deploy Vercel con env pubbliche sicure.

---

## 3. Cosa cambia da demo locale a app multi-utente

### Demo locale

```text
state React
mock data
nessuna identità reale
admin simulato
nessun rischio dati pubblici
```

### First release Supabase

```text
Supabase Auth
profiles lite
rides persistenti
join_requests persistenti
general_requests persistenti
admin approval reale
Realtime selettivo
RLS obbligatoria
```

---

## 4. Regola prodotto: browse pubblico, azioni gated

L'utente deve poter entrare e capire subito il valore.

### Pubblico senza login

- Home;
- Road Board;
- lista ride aperti;
- città/tratta indicativa;
- stato ride: open / almost_full / full / needs_driver;
- posti disponibili;
- vibe generale;
- CTA: Offro passaggio / Chiedi di unirti / Lascia richiesta generale.

### Gated con Profile Lite/Auth

- creare ride;
- chiedere di unirsi a ride;
- lasciare richiesta generale;
- vedere proprie richieste;
- vedere crew sbloccata;
- vedere link Telegram privato dopo approval.

---

## 5. Profile Lite quando l'utente vuole agire

Non chiedere login/profilo all'ingresso.

Creare o completare Profile Lite solo quando l'utente clicca:

- `Offro un passaggio`;
- `Chiedi di unirti`;
- `Lascia richiesta generale`.

L'obiettivo è ridurre attrito e mantenere il browse libero.

---

## 6. Auth consigliata per prima release

Scelta consigliata:

```text
Supabase Auth con magic link / OTP email come first release.
```

Motivo:

- evita password custom;
- lega l'utente a `auth.users.id`;
- consente RLS con `auth.uid()`;
- permette ritorno futuro sullo stesso profilo;
- abbastanza semplice per MVP serio.

Fallback V0 veloce se serve demo immediata:

```text
profilo locale temporaneo + Supabase anon insert limitato
```

Ma per release pubblica reale è meglio Auth.

---

## 7. Cosa resta pubblico

- ride approvati/visibili;
- dati non sensibili della board;
- route/città generiche;
- data/periodo partenza;
- posti disponibili;
- stato ride;
- vibe;
- descrizione safe.

Non mostrare pubblicamente:

- Telegram link;
- Telegram username;
- Instagram;
- email;
- note private;
- richieste pending;
- admin notes;
- contatti driver/passenger.

---

## 8. Cosa richiede login/profilo

- create ride;
- create join request;
- create general request;
- vedere richieste personali;
- vedere crew sbloccata;
- accedere a Telegram privato dopo approval;
- azioni admin/moderatore.

---

## 9. Cosa NON fare nella first release

```text
NO service_role / secret key nel frontend
NO chat interna
NO pagamenti
NO ticket resale
NO verifica documenti
NO password custom
NO profilo pubblico complesso
NO foto profilo
NO geolocalizzazione precisa
NO Edge Functions se non strettamente necessarie
NO algoritmo matching automatico
NO scraping gruppi Telegram
NO dati sensibili inutili
NO link Telegram pubblico prima di approval
NO driver Telegram visibile pubblicamente
```

---

## 10. Distinzione V0 / MVP / Produzione

### V0 veloce

- schema minimo;
- auth semplice;
- RLS base;
- CRUD essenziale;
- admin manuale;
- Realtime limitato.

### MVP serio

- RLS verificata;
- admin role robusto;
- dati pubblici/privati separati;
- Playwright aggiornato;
- test mobile → DB → admin → UI;
- Vercel env pulite.

### Produzione

- audit privacy/legal;
- monitoring;
- policy più granulari;
- moderation log;
- backup/export;
- gestione abuse/report;
- rate limit/server-side dove serve.

---

## 11. Fonti Supabase da rispettare

- React/Vite env con `VITE_SUPABASE_URL` e publishable/anon key.
- RLS obbligatoria sulle tabelle esposte.
- Secret/service role keys mai nel browser.
- Realtime da abilitare sulle tabelle necessarie.

---

## 12. Stop condition

Fermarsi e chiedere approval umano se il task richiede:

- creare/modificare SQL schema;
- creare/modificare RLS policies;
- aggiungere admin role;
- esporre dati personali;
- modificare auth flow;
- usare secret/service key;
- modificare più di 2 file core nello stesso step.
