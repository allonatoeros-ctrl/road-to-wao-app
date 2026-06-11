# 08_SUPABASE_SCHEMA_RLS_PLAN — Road to WAO

Versione: 1.0  
Area: Road to WAO / Supabase schema + RLS concept  
Uso: piano dati prima di scrivere SQL definitivo

---

## 1. Principio schema

La Bacheca mostra viaggi aperti, non richieste.

```text
Offro passaggio = create ride
Chiedi di unirti = create join_request con ride_id
Lascia richiesta generale = create general_request senza ride_id
Telegram privato = solo join_request approved con ride_id
```

---

## 2. Tabelle minime

### 2.1 profiles

Scopo: profilo leggero collegato a Supabase Auth.

Campi consigliati:

```text
id uuid primary key references auth.users(id)
nickname text not null
departure_city text
telegram_username text private
instagram_username text optional private
role_preference text: seeker / driver / both
is_18_confirmed boolean not null
is_admin boolean default false
created_at timestamp
updated_at timestamp
```

Note:

- non usare dati personali inutili;
- no foto;
- no documento identità;
- `is_admin` è MVP semplice, ma per produzione valutare tabella roles separata.

---

### 2.2 rides

Scopo: ride/passaggio offerto e visibile in board quando approvato/attivo.

Campi consigliati:

```text
id uuid primary key
driver_id uuid references profiles(id)
title text
from_city text not null
from_area text optional
to_event text default 'WAO Festival'
departure_date date or text controlled
return_date date or text optional
seats_total int
seats_available int
luggage_info text optional
vibe text optional
notes_public text optional
telegram_group_link text private, nullable
status text
visibility text: public / hidden
created_at timestamp
updated_at timestamp
```

Status consentiti:

```text
open
almost_full
full
needs_driver
closed
archived
```

Regole prodotto:

- solo rides pubbliche/visibili appaiono in Road Board;
- driver non vede Telegram sbloccato come passenger;
- Telegram group link non deve mai essere letto da anon.

---

### 2.3 join_requests

Scopo: richiesta di unirsi a un ride specifico.

Campi consigliati:

```text
id uuid primary key
ride_id uuid references rides(id) not null
requester_id uuid references profiles(id) not null
seats_requested int default 1
message text optional
status text
admin_notes text private optional
approved_at timestamp nullable
rejected_at timestamp nullable
created_at timestamp
updated_at timestamp
```

Status consentiti:

```text
pending
approved
rejected
cancelled
archived
```

Regola prodotto:

```text
Telegram unlock solo se status = approved e ride_id esiste.
```

---

### 2.4 general_requests

Scopo: richiesta generale senza ride specifico.

Campi consigliati:

```text
id uuid primary key
requester_id uuid references profiles(id) not null
from_city text not null
from_area text optional
preferred_departure_date text/date optional
preferred_return_date text/date optional
people_count int default 1
message text optional
status text
admin_notes text private optional
created_at timestamp
updated_at timestamp
```

Status consentiti:

```text
pending
reviewed
matched_manually
archived
cancelled
```

Regola prodotto:

```text
general_request non sblocca Telegram privato ride.
```

---

### 2.5 moderation_events optional

Scopo: log leggero per azioni admin.

Campi consigliati:

```text
id uuid primary key
admin_id uuid references profiles(id)
target_type text: ride / join_request / general_request / profile
target_id uuid
action text
note text optional
created_at timestamp
```

Usare solo se serve audit MVP serio. Non blocca first release.

---

## 3. Relazioni

```text
profiles.id = auth.users.id
profiles 1 → many rides as driver
profiles 1 → many join_requests as requester
profiles 1 → many general_requests as requester
rides 1 → many join_requests
```

---

## 4. Public/private data separation

### Public board data

Può essere letto da anon:

```text
rides.id
rides.title
rides.from_city
rides.from_area generic
rides.to_event
rides.departure_date
rides.return_date
rides.seats_available
rides.seats_total
rides.vibe
rides.notes_public
rides.status
rides.visibility
```

### Private data

Mai pubblico:

```text
profiles.telegram_username
profiles.instagram_username
profiles.email
rides.telegram_group_link
join_requests.message
join_requests.admin_notes
general_requests.message
general_requests.admin_notes
moderation_events
```

---

## 5. RLS concept

### anon può leggere

- rides con `visibility = public` e status pubblico;
- nessun profilo privato;
- nessuna richiesta;
- nessun link Telegram.

### authenticated può leggere

- rides pubbliche;
- proprio profile;
- proprie join_requests;
- proprie general_requests;
- Telegram link solo se join_request approved per quel ride.

### authenticated può creare

- proprio profile;
- rides dove `driver_id = auth.uid()`;
- join_requests dove `requester_id = auth.uid()`;
- general_requests dove `requester_id = auth.uid()`.

### owner può aggiornare

- proprio profile;
- propria ride solo campi safe e se non archiviata;
- propria join_request solo cancel/update message prima di approval;
- propria general_request solo cancel/update prima di archiviazione.

### admin può aggiornare

- ride status/visibility;
- join_request status approve/reject/archive;
- general_request status reviewed/archive;
- moderation_events insert.

---

## 6. Admin role strategy

### First release semplice

Usare `profiles.is_admin = true` controllato manualmente da Supabase Dashboard.

### MVP serio

Valutare tabella:

```text
admin_roles(user_id, role, created_at)
```

### Produzione

Gestire ruoli con claims/role system più robusto e audit.

Approval umano richiesto prima di creare policy admin.

---

## 7. Realtime concept

Tabelle candidate:

```text
rides
join_requests
general_requests
```

Canali UI:

```text
RoadBoard: rides public changes
Messages/Profile: own join_requests/general_requests
AdminPanel: pending join_requests/general_requests + rides updates
```

Non usare Realtime per tutto se non serve.

---

## 8. Cosa evitare

```text
NO offers[] separato
NO general_request con ride_id
NO Telegram link in rides public select
NO service_role nel frontend
NO policy permissive tipo true per tutto
NO dati privati in RoadBoard
NO RLS disattivata su tabelle public
NO update seats_available dal client senza controllo/approval
NO Edge Functions per V0 se CRUD + RLS bastano
```

---

## 9. Esempi applicati

### Walbox-like lesson

```text
Telefono → Supabase → Dashboard → Live UI
```

Applicazione Road to WAO:

```text
Utente → join_request → AdminPanel → approval → Profile/Messages unlock
```

### Road to WAO core

```text
Ride = unità pubblica della board
JoinRequest = candidatura specifica
GeneralRequest = richiesta senza ride
Admin = gatekeeper
Telegram = reward/accesso dopo approval
```

---

## 10. Stop condition

Fermarsi prima di implementare se non sono approvati:

- campi definitivi;
- status lifecycle;
- public/private split;
- admin strategy;
- policy RLS concept;
- Realtime scope.
