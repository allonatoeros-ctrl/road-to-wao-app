# ANTIGRAVITY SAVE TOKEN AGENT WORKFLOW

Versione: 2026-06-12  
Progetto di riferimento: Road to WAO / Walbox / AI Business Factory  
Scopo: far lavorare Antigravity come agente operativo controllato, senza farlo esplorare, consumare quota o modificare file fuori obiettivo.

---

## 1. Principio base

Antigravity non va trattato come “chat libera che capisce tutto il progetto”. Va trattato come un agente operativo a missione stretta.

Il workflow corretto è:

```text
1. ChatGPT / umano decide il problema
2. Antigravity legge solo i file necessari
3. Antigravity produce report o patch minima
4. Umano controlla diff
5. Umano lancia build/test
6. Solo se passa: commit
```

Regola centrale:

```text
READ ONLY quando deve capire.
PATCH MINIMA quando deve modificare.
NO TERMINAL quasi sempre.
TEST e COMMIT li fa l’umano.
```

---

## 2. Cosa abbiamo imparato dal caso Playwright Road to WAO

Caso reale: suite Playwright mocked su Road to WAO.

Problema iniziale:

```text
4 failed / 4 passed
```

Antigravity, se lasciato troppo libero, tendeva a:

- esplorare troppe cartelle;
- leggere file non richiesti;
- lanciare test o comandi anche quando non serviva;
- trasformare “sistema il problema” in loop: modifica → test → analisi → altra modifica;
- consumare quota senza un vero checkpoint.

Workflow corretto usato con successo:

```text
1. Prompt READ ONLY per analizzare i failure.
2. Nessuna modifica.
3. Report tecnico: bug reale vs test fragile.
4. Prompt PATCH MINIMA su file precisi.
5. Nessun terminale.
6. Umano lancia npm run build e npm run test:e2e.
7. Micro-fix successivo solo se serve.
8. Commit solo a suite verde.
```

Risultato:

```text
✅ build passato
✅ Playwright mocked suite: 8 passed
✅ commit creato: 68c5af1
✅ push completato
```

---

## 3. Modalità operative consigliate

### A. READ ONLY MODE

Da usare quando:

- non sappiamo ancora se è bug reale o test fragile;
- serve capire quali file controllano un flusso;
- serve una diagnosi prima di modificare;
- il task coinvolge app logic, Supabase, Playwright, routing, auth o workflow multi-file.

Prompt deve contenere sempre:

```text
READ ONLY.
NO EDIT.
NO TERMINAL.
NO TEST RUN.
NO COMMIT.
```

Output richiesto:

```text
1. file/funzioni coinvolti
2. causa probabile
3. bug reale o test fragile
4. patch minima consigliata
5. fermati dopo il report
```

### B. PATCH MINIMA MODE

Da usare quando:

- abbiamo già capito il bug;
- sappiamo quali file toccare;
- vogliamo una modifica piccola e verificabile.

Prompt deve contenere sempre:

```text
PATCH MINIMA.
NO REFACTOR.
NO TERMINAL.
NO TEST RUN.
SHOW DIFF AND STOP.
```

Output richiesto:

```text
1. file modificati
2. diff
3. spiegazione breve
4. cosa testare manualmente
5. stop dopo il diff
```

### C. TEST MODE

Meglio non farlo fare ad Antigravity se si vuole risparmiare quota.

Il test lo lancia l’umano da terminale:

```bash
npm run build
npm run test:e2e
```

Solo dopo il test si decide il prossimo prompt.

---

## 4. Regola dei file consentiti e vietati

Ogni prompt deve avere due sezioni obbligatorie.

Esempio:

```text
File consentiti:
- src/App.jsx

File vietati:
- tests/
- package.json
- roadToWaoDb.js
- Supabase schema / RLS
- .env
- test-results/
- public/
- assets/
- qualsiasi altro file
```

Questa parte è fondamentale perché riduce:

- esplorazione inutile;
- modifiche fuori contesto;
- consumo token;
- rischio di regressioni.

---

## 5. Regole anti-sbarello

### Regola 1 — Non dire “sistema tutto”

Prompt da evitare:

```text
Sistema i test.
Correggi il bug.
Migliora il progetto.
Fai funzionare tutto.
```

Questi prompt sono troppo aperti e fanno partire esplorazioni larghe.

Prompt corretto:

```text
Modifica solo src/App.jsx.
Cerca solo i catch collegati a handleSubmitJoinRequest e onSubmitOffer.
Aggiungi throw alla fine dei catch.
Mostra diff e fermati.
```

### Regola 2 — Separare sempre diagnosi e patch

Mai fare:

```text
Analizza e correggi.
```

Meglio:

```text
Step 1: READ ONLY report.
Step 2: PATCH MINIMA su file scelti.
```

### Regola 3 — Il terminale non è automatico

Antigravity non deve lanciare test ogni volta.

Prompt standard:

```text
NO TERMINAL.
NO TEST RUN.
Non eseguire npm.
Non eseguire Playwright.
Non aprire browser.
```

Se chiede permesso per un comando:

```text
Risposta: No.
Chiedi solo report/diff.
```

### Regola 4 — Review Changes prima di accettare

Prima di accettare una patch:

```text
1. controlla quali file sono cambiati
2. verifica che siano solo quelli consentiti
3. leggi il diff
4. se tocca file extra, rifiuta o chiedi revert
```

### Regola 5 — Commit solo a checkpoint stabile

Non committare a metà se il task è ancora rotto.

Commit quando:

```text
✅ build passa
✅ test rilevanti passano
✅ test-results pulito
✅ git status mostra solo file intenzionali
```

---

## 6. Modelli consigliati

### Gemini Flash Low

Da usare per:

- micro-copy;
- assert Playwright semplici;
- piccole modifiche CSS;
- testo statico;
- un solo file molto chiaro.

### Gemini Flash Medium

Default operativo.

Da usare per:

- micro-fix React;
- componenti semplici;
- test Playwright non complessi;
- modifiche su 1–2 file;
- prompt già molto vincolato.

### Gemini Flash High

Da usare per:

- logica submit;
- error handling;
- Supabase flow;
- auth/session;
- Playwright diagnosis;
- bug dove serve capire async/promise/state.

### Pro / Thinking / Sonnet

Da usare solo per:

- architettura multi-file;
- refactor importanti;
- bug molto difficili;
- routing complesso;
- nuova feature strutturale;
- redesign grande.

Regola:

```text
Se il task è piccolo e il prompt è buono, non serve modello costoso.
```

---

## 7. Prompt template — READ ONLY

```text
[PROJECT] — READ ONLY BUG ANALYSIS

Modalità:
READ ONLY.
NO EDIT.
NO TERMINAL.
NO TEST RUN.
NO COMMIT.

Non modificare file.
Non eseguire npm.
Non eseguire Playwright.
Non aprire browser.
Non toccare servizi reali.

Obiettivo:
analizzare questo problema:
[DESCRIVI ERRORE / LOG / TEST FAILURE]

File che puoi leggere:
- [file 1]
- [file 2]
- eventuali servizi collegati solo se necessari

File vietati:
- [file/cartelle vietate]

Cosa devi produrre:
1. funzioni/handler coinvolti
2. bug reale o test fragile?
3. causa probabile
4. patch minima consigliata
5. file da toccare

Non applicare patch.
Fermati dopo il report.
```

---

## 8. Prompt template — PATCH MINIMA

```text
[PROJECT] — [NOME FIX]

Modalità:
PATCH MINIMA.
NO REFACTOR.
NO TERMINAL.
NO TEST RUN.
SHOW DIFF AND STOP.

Non eseguire comandi.
Non lanciare npm.
Non lanciare Playwright.
Non aprire browser.
Non fare commit.

File consentiti:
- [file preciso]

File vietati:
- [tutto il resto]

Contesto:
[spiega in 5 righe cosa è stato capito]

Obiettivo:
[fix preciso]

Task:
1. [azione precisa]
2. [azione precisa]
3. [azione precisa]

Vincoli:
- non cambiare UI/copy se non richiesto
- non refactorare
- non modificare file non consentiti
- non eliminare test
- non aggiungere dipendenze

Output finale:
- file modificati
- diff
- spiegazione breve
- cosa devo testare io manualmente

Stop dopo il diff.
```

---

## 9. Prompt template — PLAYWRIGHT MOCK FIX

```text
[PROJECT] — FIX PLAYWRIGHT MOCK ONLY

Modalità:
PATCH MINIMA.
NO REFACTOR.
NO TERMINAL.
NO TEST RUN.
SHOW DIFF AND STOP.

File consentito:
- tests/e2e/[nome-test].spec.js

File vietati:
- src/
- package.json
- servizi backend
- .env
- test-results/
- public/
- assets/

Contesto:
La suite fallisce solo nel test:
[nome test]

Diagnosi:
Il mock [POST/GET] probabilmente non aggiorna lo stato mockato usato dal GET successivo.

Obiettivo:
correggere solo il mock, non l’app.

Task:
1. trova il route handler mock interessato
2. leggi il request body
3. aggiorna il db mock in memoria
4. rispondi con l’oggetto appena creato
5. mantieni assert forti

Vincoli:
- non indebolire il test
- non cancellare il test
- non toccare app logic
- non usare timeout lunghi arbitrari

Output finale:
- diff
- cosa hai modificato nel mock
- cosa devo lanciare io
```

---

## 10. Comandi standard lato umano

### Build + test

```bash
npm run build
npm run test:e2e
```

### Pulizia test-results

```bash
git restore test-results
git clean -fd test-results
git status --short
```

### Commit sicuro

Mai usare `git add .`.

Usare sempre file espliciti:

```bash
git add package.json \
  src/App.jsx \
  src/components/JoinRequestModal.jsx \
  src/components/OfferRideModal.jsx \
  tests/e2e/road-to-wao-current-flows.spec.js

git commit -m "Add mocked WAO diagnostics and fix submit success handling"
git push
```

---

## 11. Checklist prima di accettare una patch

```text
[ ] Ha modificato solo i file consentiti?
[ ] Non ha toccato package.json se non richiesto?
[ ] Non ha toccato .env?
[ ] Non ha toccato public/assets per errore?
[ ] Non ha cancellato test?
[ ] Non ha aggiunto timeout lunghi inutili?
[ ] Non ha fatto refactor non richiesto?
[ ] Ha mostrato diff?
[ ] Si è fermato dopo il diff?
```

---

## 12. Checklist prima del commit

```text
[ ] npm run build passato
[ ] npm run test:e2e passato o failure documentata intenzionalmente
[ ] test-results pulito
[ ] git status --short controllato
[ ] git add solo file espliciti
[ ] messaggio commit chiaro
[ ] push completato
```

---

## 13. Regola finale

Antigravity deve essere usato come:

```text
esecutore controllato, non cervello libero.
```

ChatGPT / umano fa:

```text
regia, priorità, diagnosi, prompt, controllo qualità, commit decision.
```

Antigravity fa:

```text
lettura mirata, patch mirata, diff.
```

Playwright fa:

```text
allarme automatico.
```

Git fa:

```text
cintura di sicurezza.
```

Questa è la pipeline corretta per risparmiare token, quota e tempo.
