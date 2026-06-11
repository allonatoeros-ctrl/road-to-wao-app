# ROAD TO WAO — ANTIGRAVITY TOKEN-SAVER WORKFLOW

**Scopo del file:** fissare un workflow anti-spreco per Road to WAO / BlaBlaParty, ispirato al metodo usato con Walbox: usare file agent/context come memoria compressa, ridurre prompt enormi, scegliere il modello giusto per il task giusto, lavorare a micro-step, fare QA e commit dopo ogni blocco stabile.

---

## 1. Perché questo workflow esiste

Nel progetto Road to WAO stiamo usando Antigravity per costruire una demo React/Vite sempre più complessa:

- Bacheca Viaggi
- Offri passaggio
- Chiedi di unirti
- Richiesta generale
- Messaggi
- Profilo
- Control Room desktop
- rides / joinRequests / generalRequests
- storico, archiviazione, Telegram unlock demo

Il rischio è consumare troppa quota/token perché ogni volta l'agente deve rileggere troppo contesto o perché gli chiediamo task troppo larghi.

La regola principale è:

```text
File agent giusti + prompt corto + task piccolo = meno spreco.
```

Non significa far leggere sempre tutti i file. Significa creare una memoria compressa del progetto e far leggere solo i file necessari per quel task.

---

## 2. Lezione da Walbox

Con Walbox il workflow ha funzionato perché gli agenti leggevano file di contesto e regole chiare prima di operare:

- project context
- brand context
- safe UI edit workflow
- prompt library
- coding/security rules
- checkpoint attuale

Questo non riduce i token automaticamente, perché leggere file costa. Però riduce lo spreco perché:

- l'agente sbaglia meno;
- non cambia file fuori scope;
- non reinventa il progetto;
- servono meno retry;
- servono meno rollback;
- i prompt possono essere più corti;
- il modello può lavorare con regole stabili.

Quindi la formula corretta è:

```text
Non: più file = meno token
Ma: file giusti = meno errori = meno retry = meno consumo totale
```

---

## 3. Regola centrale della AI Business Factory

Prima si classifica il task. Poi si sceglie modello, modalità e contesto.

```text
Task piccolo → modello leggero → contesto piccolo → fast edit
Task medio → modello medio → contesto mirato → fix controllato
Task grosso → planning first → modello forte → implementazione a step
```

Mai partire da: “usa il modello migliore”.

Partire sempre da:

```text
Che tipo di task è?
Che rischio ha?
Quali file servono davvero?
Quali file non deve toccare?
Quando deve fermarsi?
```

---

## 4. Matrice modelli per Road to WAO

### Gemini Flash

Usarlo come default quando disponibile.

**Flash Low**
- copy
- testi
- micro-label
- colori
- spacing
- piccoli ritocchi CSS

**Flash Medium**
- modifica UI su 1 file
- piccola prop
- piccolo handler
- mini fix React

**Flash High**
- logica React su 1-3 file
- piccoli refactor controllati
- form logic
- state semplice
- bug moderati

### Claude Sonnet Thinking

Usarlo quando Gemini non basta, quando Gemini è finito, o quando serve ragionamento più forte.

**Sonnet Medium**
- QA report
- review diff
- fix bug specifico
- build error fix
- 1-3 file delicati

**Sonnet High**
- refactor multi-file
- stato React complesso
- Control Room desktop
- logica rides / joinRequests / generalRequests
- planning operativo

### Pro / Opus

Risorsa rara. Non usare come default.

Usarlo solo per:

- architettura pesante;
- Supabase schema e RLS;
- migrazione dati;
- AI Business Factory orchestrator;
- bug molto difficili;
- planning multi-step ad alto rischio.

Da evitare per:

- bottoni;
- card;
- spacing;
- copy;
- piccole UI;
- CSS semplice.

---

## 5. Formato standard prompt anti-spreco

Ogni prompt Antigravity deve usare questo formato:

```text
TOKEN-SAVER FORMAT

Task level: 1/5, 2/5, 3/5, 4/5, 5/5
Model:
Mode:
Read only:
Modify only:
Do not touch:
Goal:
Implementation:
Stop after:
Test:
```

### Esempio

```text
TOKEN-SAVER FORMAT

Task level: 2/5
Model: Claude Sonnet Medium
Mode: Fix only
Read only: no
Modify only:
- src/App.jsx
- src/components/MessagesPanel.jsx
- src/components/ProfilePanel.jsx

Do not touch:
- AdminPanel.jsx
- RoadBoard.jsx
- JoinRequestModal.jsx
- OfferRideModal.jsx
- vite.config.js
- package.json

Goal:
Show driver rides in Messages/Profile using rides as source of truth.

Implementation:
- Do not create offers[].
- Use rides where driver/ownerNickname/createdBy matches userProfile.nickname.
- Telegram only for approved joinRequest with rideId.

Stop after:
- minimal code changes
- npm run build
- report changed files
```

---

## 6. File agent/context da creare nel progetto Road to WAO

Creare una cartella dedicata nel repo:

```text
agent_context/road-to-wao/
```

Dentro inserire questi file:

### 01_ROAD_TO_WAO_PROJECT_CONTEXT.md

Contiene:
- cos'è Road to WAO;
- cos'è BlaBlaParty;
- obiettivo demo;
- cosa non deve essere;
- stack tecnico;
- visual direction;
- vincoli prodotto.

### 02_ROAD_TO_WAO_CURRENT_CHECKPOINT.md

Contiene lo stato attuale dopo l'ultimo commit:
- feature funzionanti;
- modello dati attuale;
- file principali;
- bug noti;
- prossimo step;
- cosa non toccare.

### 03_ROAD_TO_WAO_DATA_MODEL.md

Contiene:
- rides;
- joinRequests;
- generalRequests;
- legacy requests;
- status ammessi;
- regole Telegram;
- regole archiviazione;
- regole full ride;
- regole future su invalidazione richieste multiple.

### 04_ROAD_TO_WAO_SAFE_EDIT_RULES.md

Contiene:
- una modifica alla volta;
- niente backend se non richiesto;
- niente Supabase se non richiesto;
- niente package/vite se non richiesto;
- no redesign Home;
- build dopo ogni step;
- git status prima/dopo;
- non committare task.md/walkthrough.md/file temporanei.

### 05_ROAD_TO_WAO_PROMPT_LIBRARY.md

Contiene prompt riutilizzabili:
- QA only;
- fix only;
- planning only;
- implementation only;
- build error fix;
- desktop Control Room;
- Supabase bridge;
- checkpoint creation.

### 06_ROAD_TO_WAO_TOKEN_SAVER.md

Questo file, o una versione più corta, con:
- matrice modelli;
- quando usare Flash/Sonnet/Pro;
- token-saver prompt format;
- regole di contesto minimo.

---

## 7. Quali file far leggere ad Antigravity

### Micro-fix

```text
Read:
- 04_ROAD_TO_WAO_SAFE_EDIT_RULES.md
- 06_ROAD_TO_WAO_TOKEN_SAVER.md
- file da modificare
```

### Fix logica prodotto

```text
Read:
- 02_ROAD_TO_WAO_CURRENT_CHECKPOINT.md
- 03_ROAD_TO_WAO_DATA_MODEL.md
- 04_ROAD_TO_WAO_SAFE_EDIT_RULES.md
- file coinvolti
```

### Refactor grosso

```text
Planning first. Read:
- 01_ROAD_TO_WAO_PROJECT_CONTEXT.md
- 02_ROAD_TO_WAO_CURRENT_CHECKPOINT.md
- 03_ROAD_TO_WAO_DATA_MODEL.md
- 04_ROAD_TO_WAO_SAFE_EDIT_RULES.md
- file coinvolti
```

### Supabase / backend

```text
Planning first. Read:
- Supabase Agent Pack
- 03_ROAD_TO_WAO_DATA_MODEL.md
- 04_ROAD_TO_WAO_SAFE_EDIT_RULES.md
- checkpoint attuale
```

### Visual/UI polish

```text
Read:
- 01_ROAD_TO_WAO_PROJECT_CONTEXT.md
- visual/brand direction se presente
- componente specifico
- CSS specifico
```

---

## 8. Regole operative per ogni step

### Prima di Antigravity

1. Definire task level.
2. Scegliere modello.
3. Scegliere modalità: Planning / Fast / Fix / QA.
4. Dare file da leggere.
5. Dare file modificabili.
6. Dare file vietati.
7. Dare stop condition.

### Durante Antigravity

- Non accettare modifiche se tocca file fuori scope.
- Non lasciare che “migliori tutto”.
- Se crea task.md/walkthrough.md/file temporanei, non committarli.
- Se propone build workaround su vite/package, fermarlo.

### Dopo Antigravity

Sempre:

```bash
git status
npm run build
```

Se build fallisce per `.DS_Store`:

```bash
find . -name ".DS_Store" -delete
npm run build
```

Se funziona:

```bash
git add <solo file corretti>
git commit -m "<messaggio chiaro>"
```

---

## 9. Stop conditions

L'agente deve fermarsi quando:

- ha modificato i file richiesti;
- ha eseguito build o dichiarato perché non può;
- ha riportato i file modificati;
- ha scritto eventuali test manuali;
- non deve continuare con altri fix non richiesti.

Frase da usare spesso:

```text
Stop after this task. Do not continue with extra fixes.
```

---

## 10. Regole anti-spreco più importanti

```text
1. Non far leggere tutto se serve solo un file.
2. Non usare Pro/Opus per task piccoli.
3. Non fare planning per micro-copy.
4. Non fare fast edit per refactor rischiosi.
5. Non accettare modifiche fuori scope.
6. Non rigenerare uno step già generato.
7. Non usare browser/screenshot se non serve.
8. Non fare “fix everything”.
9. Commit dopo ogni step stabile.
10. Checkpoint dopo ogni blocco importante.
```

---

## 11. Workflow per nuova chat

Quando si apre una nuova chat Road to WAO, partire così:

```text
Sto lavorando al progetto Road to WAO / BlaBlaParty.
Voglio usare workflow Antigravity anti-spreco.

Prima di suggerire prompt Antigravity, applica sempre:
- task level
- modello consigliato
- modalità
- file da leggere
- file da modificare
- file da non toccare
- stop condition

Usa come riferimento:
- ROAD_TO_WAO_TOKEN_SAVER.md
- ROAD_TO_WAO_CURRENT_CHECKPOINT.md
- ROAD_TO_WAO_DATA_MODEL.md
- ROAD_TO_WAO_SAFE_EDIT_RULES.md

Non proporre prompt enormi se il task è piccolo.
Non usare modelli Pro/Opus se basta Flash o Sonnet.
Lavora a micro-step con build e commit.
```

---

## 12. Prossimo uso pratico

Prima cosa da fare nel progetto Road to WAO:

1. Creare la cartella:

```bash
mkdir -p agent_context/road-to-wao
```

2. Inserire questi file `.md`.

3. Committare i file agent:

```bash
git add agent_context/road-to-wao/
git commit -m "Add Road to WAO token saver agent workflow"
```

4. Da quel momento ogni task Antigravity deve partire dal formato anti-spreco.

---

## 13. Decisione finale

Da ora Road to WAO usa questo workflow:

```text
ChatGPT = regia / product owner / prompt architect
Antigravity = execution layer
Agent files = memoria compressa
Git = cintura di sicurezza
Build = verifica tecnica
Checkpoint = memoria operativa
```

Obiettivo:

```text
Meno token.
Meno retry.
Meno modifiche sbagliate.
Meno overbuilding.
Più controllo.
Più velocità reale.
```
