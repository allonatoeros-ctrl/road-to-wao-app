# 03_CODING_CONTEXT_PROMPTS_SECURITY_MASTER.md
Questo file è una fusione INTEGRALE di fonti originali.
Regola: il contenuto tra BEGIN_SOURCE_FILE e END_SOURCE_FILE non è riassunto.
È stato copiato integralmente dai file originali disponibili nella sessione.

## Indice interno

1. `03_CLAUDE_CODE_BEST_PRACTICES.md` — sha256: `679965a3f8137fc8118abb469dc31ca41b4804533e398472343cbd3138bbcbae` — chars: 22714
2. `04_CLAUDE_MEMORY_AND_CONTEXT.md` — sha256: `2c34d3837163e32f109217a7fd02837e940da4529566d9e2b5461a2ce76c1177` — chars: 28116
3. `05_AGENT_ROLES_AND_SUBAGENTS.md` — sha256: `b29f9a77138462fd88de7733561ecdafb290f0af90c77e93d888041a465870f8` — chars: 33242
4. `06_SKILLS_SYSTEM.md` — sha256: `0bc576fdbadae69ea2399b20b73ea9d9bdd081f80b4de100a737fba25224ac5d` — chars: 32596
5. `07_PROMPTING_RULES.md` — sha256: `d26e98ebe21aefef00a82e1998c7b0de5eb65cf65fc7de58def4fcd3130ccb45` — chars: 30977
6. `08_MODEL_SELECTION_AND_TOKEN_SAVING.md` — sha256: `2512179dbfcb563de280b8432fa147405daa6f1c12ad568b59417fb64344094c` — chars: 27909
7. `09_CONTEXT_ENGINEERING.md` — sha256: `68ebb7403059ca68a71d2e0e7eeeb732ddb18e2fbc631e61b8f7228e3c67c605` — chars: 31608
8. `10_SAFE_WORKFLOWS.md` — sha256: `57df58650570141ad04bc160bee448973d5baa2d77371805595d78839dde5377` — chars: 28772
9. `11_HOOKS_AND_AUTOMATION.md` — sha256: `1fea70a4f111124b53ef5b5027af736f42fed8ff5c3d60a76c1f0184a82084d4` — chars: 22813
10. `12_MCP_AND_AGENT_SDK_ROADMAP.md` — sha256: `3dbd4a3e53a7027361a65443dcf09f65813b9786be4ff48f0a277ebe5beda4c2` — chars: 26178
11. `13_TOOL_USE_AND_TOOL_DESIGN.md` — sha256: `30a3d71f9ae556119b1b6f8ed13d3f622e366d3c75dc6dd3a1f1e0fa495b09d9` — chars: 27833
12. `14_SECURITY_AND_APPROVALS.md` — sha256: `1b18f9f3156cb3ce41cac493516473a926764e1617ac77a3835984a853c23619` — chars: 24310

---



<!-- BEGIN_SOURCE_FILE: 03_CLAUDE_CODE_BEST_PRACTICES.md -->
<!-- SOURCE_SHA256_UTF8: 679965a3f8137fc8118abb469dc31ca41b4804533e398472343cbd3138bbcbae -->
<!-- SOURCE_CHAR_COUNT: 22714 -->

# 03_CLAUDE_CODE_BEST_PRACTICES.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Claude Core  
Completezza stimata: 86%

---

## Scopo del file

Questo file trasforma le best practice ufficiali Claude/Anthropic in un manuale operativo per usare Claude Code, Antigravity e coding agent senza:

- bruciare token inutili;
- far modificare troppi file;
- rompere codice stabile;
- perdere il controllo del progetto;
- creare sessioni troppo lunghe e confuse;
- mischiare brainstorming, coding, business e debug nello stesso task;
- trasformare ogni richiesta in un redesign enorme.

La logica è semplice:

> L’agente deve lavorare come un tecnico guidato, non come un creativo lasciato libero di rifare tutto.

---

## Fonti ufficiali usate

Fonti primarie:

1. Claude Code Best Practices  
   https://www.anthropic.com/engineering/claude-code-best-practices

2. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

3. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

4. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

5. Claude Code Settings  
   https://docs.anthropic.com/en/docs/claude-code/settings

6. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

7. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

8. Claude Code Hooks Guide  
   https://docs.anthropic.com/en/docs/claude-code/hooks-guide

9. Claude Code Hooks Reference  
   https://docs.anthropic.com/en/docs/claude-code/hooks

10. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

11. Effective Harnesses for Long-running Agents  
    https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

12. Claude Code Auto Mode  
    https://www.anthropic.com/engineering/claude-code-auto-mode

13. Claude Code GitHub Actions  
    https://docs.anthropic.com/en/docs/claude-code/github-actions

14. Claude Code IDE Integrations  
    https://docs.anthropic.com/en/docs/claude-code/ide-integrations

---

## Sintesi brutale

La best practice principale non è “scrivere prompt più lunghi”.

La best practice principale è:

```text
Preparare bene il lavoro prima di far lavorare l'agente.
```

Un agente AI lavora meglio quando ha:

- obiettivo chiaro;
- scope limitato;
- contesto minimo ma sufficiente;
- file target;
- vincoli;
- regole su cosa non toccare;
- verifica finale;
- possibilità di rollback;
- memoria progetto;
- task spezzato in fasi.

Lavora peggio quando riceve:

- richieste vaghe;
- chat troppo lunghe;
- troppi file aperti;
- screenshot inutili;
- contesto non selezionato;
- istruzioni contraddittorie;
- task multi-obiettivo;
- “migliora tutto”;
- “fai tu”;
- assenza di git checkpoint.

---

## Regola 1 — Prima pianifica, poi fai codice

Non mandare subito un agente a modificare file se il task è ancora confuso.

### Formula corretta

```text
Idea → chiarimento → specifica → task tecnico → modifica → test → commit
```

### Formula sbagliata

```text
Idea confusa → agente coding → modifiche enormi → casino → rollback
```

### Prompt utile

```text
Non modificare ancora file.

Analizza il task e rispondi con:
1. cosa hai capito;
2. file probabilmente coinvolti;
3. rischi;
4. patch minima consigliata;
5. cosa NON va toccato.
```

### Applicazione Walbox

Se dici:

```text
Rendi la Live TV più wow.
```

prima serve trasformarlo in:

```text
Modifica solo src/pages/LiveTvScreen.jsx.
Obiettivo: migliorare impatto visivo del blocco Now Playing.
Non toccare Spotify, Supabase, App.jsx, ManagerDashboard o routing.
Mantieni palette Walrus.
```

---

## Regola 2 — Un task deve avere un solo obiettivo

Un task buono è piccolo e verificabile.

### Task buono

```text
Centra il badge LIVE nella Live TV.
```

### Task cattivo

```text
Migliora la Live TV, rendila più moderna, sistema anche la dashboard e magari aggiungi animazioni.
```

Il secondo task contiene redesign, dashboard, animazioni, potenziale modifica multi-file, nessun criterio di successo e alto rischio token.

### Checklist

Prima di mandare il task:

```text
[ ] Posso descrivere il risultato in una frase?
[ ] Posso verificare se è fatto?
[ ] So quale file toccare?
[ ] So cosa non deve toccare?
[ ] Posso fare rollback?
```

---

## Regola 3 — Specifica sempre cosa NON toccare

Gli agenti spesso provano ad “aiutare troppo”.

Per questo la parte più importante del prompt non è solo cosa fare, ma cosa non fare.

### Template

```text
Vincoli:
- Non toccare [file].
- Non modificare [servizio].
- Non fare refactor.
- Non cambiare routing.
- Non cambiare schema database.
- Non modificare variabili ambiente.
- Non aggiungere nuove dipendenze.
```

### Per Walbox

File e aree protette:

```text
src/App.jsx
src/services/walboxDb.js
src/services/spotifyApi.js
api/search.js
vercel.json
.env / variabili ambiente
Supabase schema
Spotify auth flow
routing
ManagerDashboard.jsx, se il flusso funziona
```

### Regola Walbox

> Se stai facendo polish UI, non devi toccare Supabase, Spotify, App.jsx o routing.

---

## Regola 4 — Prima esplora, poi modifica

Per bug complessi, chiedi prima analisi senza modifica.

### Prompt

```text
Analizza soltanto.
Non modificare file.
Non eseguire comandi distruttivi.

Obiettivo:
capire perché [problema].

Output:
- causa probabile;
- file coinvolti;
- patch minima;
- rischio;
- test consigliato.
```

### Quando usarlo

- bug Supabase;
- bug Spotify;
- errore build;
- state React non aggiornato;
- useEffect complesso;
- routing;
- auth;
- env variables;
- sync tra dispositivi.

### Quando saltarlo

- typo;
- testo;
- spacing;
- micro CSS;
- label;
- badge.

---

## Regola 5 — Usa Git come cintura di sicurezza

Prima di far lavorare un agente:

```bash
git status
```

Se il working tree non è pulito, fermati.

Dopo modifica:

```bash
git diff
npm run build
```

Se funziona:

```bash
git add .
git commit -m "Descrizione breve"
```

Se non funziona:

```bash
git restore [file]
```

### Regola pratica

> Non fare mai 5 modifiche buone senza commit. Il commit è il punto di salvataggio del lavoro agentico.

---

## Regola 6 — Usa CLAUDE.md / project context per evitare ripetizioni

La documentazione ufficiale descrive `CLAUDE.md` come memoria/contesto progettuale.

Tradotto per te:

> Non ripetere ogni volta cos’è Walbox. Scrivilo in un file stabile e fai lavorare l’agente con quello.

### Cosa mettere nel contesto progetto

```md
# Project Context

## Project
Nome progetto e obiettivo.

## Stack
React, Vite, Supabase, Spotify, Vercel.

## Stable state
Cosa funziona ora.

## Critical files
File da non toccare senza richiesta.

## Safe workflow
Una modifica alla volta.
Git status prima.
Build dopo.
Commit dopo step funzionante.

## Current priority
Una sola priorità attiva.
```

### Cosa non mettere

- romanzi;
- brainstorming infinito;
- idee future non rilevanti;
- vecchi bug risolti;
- discussioni commerciali;
- note emotive;
- 20 roadmap insieme.

### Regola

> Il contesto progetto deve aiutare l’agente a lavorare meglio, non sommergerlo.

---

## Regola 7 — Memoria non significa sicurezza

`CLAUDE.md` guida l’agente, ma non blocca fisicamente le azioni.

Se scrivi:

```text
Non toccare App.jsx
```

è una forte istruzione, ma non è un firewall.

Per bloccare davvero servono:

- review manuale;
- permissions;
- hooks;
- git diff;
- protected branches;
- CI;
- workflow di approvazione.

### Regola

> Le istruzioni guidano. I controlli proteggono.

---

## Regola 8 — Usa sub-agents solo quando separano davvero il lavoro

I sub-agents servono se hanno ruoli chiari.

### Buoni sub-agents

```text
Frontend Agent
Backend Agent
QA Agent
Research Agent
Documentation Agent
Sales/Pitch Agent
Token Saver Agent
```

### Cattivo uso

```text
Crea 8 agenti e fagli fare tutto insieme sullo stesso file.
```

Questo crea conflitti.

### Regola

> Agenti paralleli sì per ricerca, copy, QA, documentazione.  
> Attenzione massima per agenti paralleli che modificano codice.

### Esempio sicuro

- Agent A: ricerca best practice per TV screen.
- Agent B: scrive copy/pitch.
- Agent C: analizza file senza modificare.
- Un solo Agent D: modifica il codice.

---

## Regola 9 — Usa Skills per compiti ripetibili

Le skills servono quando ripeti spesso lo stesso tipo di richiesta.

### Quando creare una skill

Se fai spesso:

- safe UI edit;
- mobile polish;
- code review;
- pitch per locale;
- business validation;
- checkpoint;
- token saving;
- QA checklist;
- Walbox-specific edits.

Allora serve una skill.

### Quando NON creare una skill

- task unico;
- idea ancora vaga;
- processo non testato;
- cosa che cambia ogni volta.

### Regola

> Prima testa il workflow manualmente 3 volte. Poi trasformalo in skill.

---

## Regola 10 — Le skills devono essere corte e operative

Una skill non deve essere un libro.

Deve dire:

- quando usarla;
- cosa fare;
- cosa non fare;
- output atteso;
- esempi;
- checklist finale.

### Template skill

```md
# Skill: frontend-safe-edit

## Use when
Small UI/CSS/React component changes.

## Do
- Edit only requested file.
- Preserve logic.
- Keep design tokens.
- Summarize changes.

## Do not
- Touch backend.
- Change routing.
- Add dependencies.
- Refactor unrelated code.

## Output
- Files changed.
- What changed.
- How to test.
```

---

## Regola 11 — Context engineering: scegli cosa dare al modello

Le fonti Anthropic su context engineering sottolineano che gli agenti lunghi devono preservare:

- decisioni architetturali;
- bug irrisolti;
- dettagli implementativi;
- stato corrente;
- file recenti importanti.

E scartare:

- output ridondanti;
- conversazioni vecchie non utili;
- log enormi;
- tentativi falliti irrilevanti;
- screenshot non necessari.

### Regola pratica

> Il contesto è carburante. Troppo carburante sporco rovina il motore.

### Template contesto minimo

```md
# Task Context

## Current stable state
Cosa funziona.

## Task
Cosa fare.

## File target
File da modificare.

## Constraints
Cosa non toccare.

## Verification
Come testare.

## Rollback
Come annullare.
```

---

## Regola 12 — Sessioni lunghe richiedono checkpoint

Dopo ogni step importante, crea un checkpoint.

### Checkpoint minimo

```md
# Checkpoint

## Date
YYYY-MM-DD

## Goal completed
Cosa è stato fatto.

## Files changed
Elenco file.

## Stable state
Cosa funziona.

## Do not touch
Aree protette.

## Known issues
Bug/rischi.

## Next step
Una sola prossima azione.
```

### Quando farlo

- dopo feature funzionante;
- dopo bugfix;
- dopo deploy;
- prima di aprire nuova chat;
- prima di far lavorare un altro agente;
- prima di spezzare il lavoro in parallelo.

---

## Regola 13 — Non mischiare modalità Fast e Planning

### Fast / micro edit

Usala per:

- testi;
- colori;
- spacing;
- badge;
- label;
- micro CSS;
- modifiche a un file.

Prompt:

```text
Modifica solo [file].
Fai solo [micro modifica].
Non toccare altro.
```

### Planning / task complesso

Usala per:

- bug logici;
- API;
- Supabase;
- Spotify;
- routing;
- multi-file;
- architettura;
- nuova feature grande.

Prompt:

```text
Non implementare subito.
Crea un piano con:
- file coinvolti;
- rischi;
- fasi;
- verifica;
- rollback.
```

### Regola

> Fast per ciò che sai già fare. Planning per ciò che devi capire.

---

## Regola 14 — Non fare refactor durante una feature

Refactor e feature devono essere separati.

### Errore comune

```text
Aggiungi loyalty system e già che ci sei pulisci tutto App.jsx.
```

Questo è pericoloso.

### Metodo corretto

1. Feature piccola.
2. Test.
3. Commit.
4. Refactor separato.
5. Test.
6. Commit.

### Regola

> Se non puoi spiegare il refactor in un commit separato, non farlo.

---

## Regola 15 — Non aggiungere dipendenze senza motivo

Gli agenti possono proporre librerie nuove.

Per un MVP, ogni dipendenza ha costo:

- bundle size;
- manutenzione;
- vulnerabilità;
- aggiornamenti;
- deploy risk;
- lock-in.

### Prompt

```text
Non aggiungere nuove dipendenze.
Se pensi servano, prima spiegami perché e proponi alternativa senza dipendenze.
```

---

## Regola 16 — Definisci il test prima della modifica

Un task senza test è vago.

### Esempi test

- `npm run build`;
- aprire `/customer`;
- inviare richiesta da telefono;
- controllare Supabase;
- vedere richiesta in ManagerDashboard;
- approvare;
- vedere Live TV;
- provare ricerca Spotify;
- controllare console browser;
- controllare mobile.

### Prompt

```text
Prima di modificare, indicami come verificherò che il task è riuscito.
```

---

## Regola 17 — Usa output strutturato

Chiedi sempre risposte con forma prevedibile.

### Output consigliato dopo modifica

```text
## Modifiche fatte
- ...

## File modificati
- ...

## Cosa non ho toccato
- ...

## Come testare
- ...

## Rischi residui
- ...
```

Questo ti evita risposte lunghe e confuse.

---

## Regola 18 — Per bug, chiedi patch minima

### Prompt

```text
Trova la causa del bug e proponi la patch minima.
Non fare refactor.
Non migliorare parti non collegate.
```

### Perché

Un bugfix deve ridurre incertezza, non aumentarla.

---

## Regola 19 — Per UI, separa design da logica

### Prompt UI sicuro

```text
Modifica solo UI/CSS del file [file].
Non modificare state, props, useEffect, chiamate API o funzioni di submit.
```

### Per Walbox

Se lavori su `CustomerJukeboxOldOrange.jsx`, attenzione a non rompere:

- ricerca Spotify;
- invio a Supabase;
- mood;
- dedication;
- selectedSong;
- queue create;
- popup conferma.

---

## Regola 20 — Review Changes prima di accettare

In Antigravity o editor agentici:

1. guarda file modificati;
2. leggi diff;
3. controlla se ha toccato file non richiesti;
4. se sì, non accettare tutto;
5. accetta solo patch coerente;
6. test;
7. commit.

### Regola

> L’agente propone. Tu approvi.

---

## Regola 21 — Usa hooks più avanti, non subito

Hooks possono:

- formattare file dopo edit;
- bloccare comandi;
- notificare quando Claude chiede input;
- reiniettare contesto;
- bloccare file protetti;
- fare audit;
- auto-approvare prompt sicuri.

Ma per ora non partire dagli hooks.

### Roadmap

Prima:

```text
Prompt chiari → Git → Review Changes → Build
```

Poi:

```text
Hooks per bloccare file critici e automatizzare test
```

### Hook futuro utile

```text
Se l'agente prova a modificare src/services/walboxDb.js durante safe-ui-edit, blocca e chiedi conferma.
```

---

## Regola 22 — Auto mode va usato con prudenza

Le fonti Anthropic parlano del problema approval fatigue: troppe richieste di conferma portano l’utente ad approvare tutto automaticamente.

Per te:

- micro-edit sicuri: ok automatizzare di più;
- API/database/auth: approvazione manuale;
- file critici: mai auto;
- comandi distruttivi: mai auto.

### Regola

> Più il task può rompere business/prodotto, meno autonomia devi dare.

---

## Regola 23 — GitHub Actions/CI è roadmap, non MVP immediato

Claude Code può integrarsi con GitHub Actions per PR, issue, review e automazioni.

Ma per te ora:

- non complicare il flusso;
- usa prima Antigravity/Claude manuale;
- commit piccoli;
- Vercel deploy;
- test reale.

Più avanti:

- PR automatiche;
- code review automatica;
- test su pull request;
- automazioni da issue;
- bot `@claude`.

### Regola

> Prima rendi ripetibile il lavoro manuale. Poi automatizzalo.

---

## Regola 24 — Usa parallelizzazione solo per task non conflittuali

Agenti paralleli sono utili per:

- ricerca documentazione;
- competitor;
- copy;
- pitch;
- QA teorico;
- alternative UI;
- lettura log;
- generazione checklist.

Sono rischiosi per:

- modifiche allo stesso file;
- refactor;
- API/database;
- routing;
- auth;
- deploy config.

### Workflow parallelo sicuro

```text
Agent A: ricerca competitor.
Agent B: scrive pitch.
Agent C: propone UI ideas.
Agent D: QA checklist.
Solo Agent E modifica il codice.
```

---

## Regola 25 — Usa “read-only mode” spesso

Un agente non deve sempre modificare.

Molti task migliori sono read-only:

- analizza codebase;
- crea mappa file;
- trova rischi;
- spiega errore;
- confronta alternative;
- crea piano;
- prepara prompt;
- scrive documentazione;
- fa QA.

### Prompt read-only

```text
Modalità read-only.
Non modificare file.
Non eseguire comandi.
Analizza e proponi.
```

---

## Regola 26 — Riduci token con task piccoli

Token si sprecano quando:

- chiedi tutto insieme;
- carichi troppi file;
- incolli log enormi;
- usi screenshot inutili;
- fai sessioni lunghe;
- ripeti contesto;
- non hai project context;
- fai agenti paralleli senza confini.

Token si risparmiano quando:

- usi file contesto;
- task piccoli;
- prompt template;
- output strutturato;
- checkpoint;
- modello giusto;
- read-only prima di edit;
- riassunti dopo sessioni lunghe.

---

## Regola 27 — Se l’agente sbaglia, non urlare: correggi il sistema

Ogni errore diventa una regola.

Esempio:

Errore:
l’agente ha modificato `App.jsx` durante un polish UI.

Nuova regola:
in `safe-ui-edit`, aggiungere:

```text
Non modificare App.jsx. Se pensi serva, fermati e chiedi.
```

Errore:
ha aggiunto una libreria inutile.

Nuova regola:

```text
Non aggiungere dipendenze senza spiegazione e conferma.
```

---

## Regola 28 — Fai documentazione viva

I file `.md` non sono monumenti.

Vanno aggiornati dopo:

- bug serio;
- deploy riuscito;
- demo cliente;
- cambio stack;
- nuova fonte ufficiale;
- nuovo tool;
- workflow che funziona;
- workflow che fallisce.

### Regola

> Ogni errore costa tempo una volta. Se lo documenti, non deve costare due volte.

---

## Regola 29 — Mantieni il business separato dal coding

Prima di far scrivere codice, chiediti:

```text
Questa feature serve alla demo?
Serve al cliente?
Serve a vendere?
Serve a validare?
O è solo una cosa figa?
```

Se è solo “figa” ma non urgente, va in roadmap.

### Per Walbox

Priorità MVP/demo:

- cliente invia richiesta;
- dashboard riceve;
- staff gestisce;
- TV mostra;
- Spotify funziona;
- demo stabile;
- pitch chiaro.

Roadmap:

- loyalty;
- profilo utente;
- meme generator;
- tourist mode;
- analytics;
- multi-tenant;
- conti aperti.

---

## Regola 30 — Non confondere demo e prodotto definitivo

Demo:

- deve funzionare davanti al cliente;
- deve sembrare viva;
- deve mostrare valore;
- può avere dati finti;
- può essere manuale;
- deve essere stabile.

Prodotto definitivo:

- auth;
- sicurezza;
- scalabilità;
- analytics;
- billing;
- GDPR;
- permessi;
- multi-tenant;
- monitoraggio;
- supporto.

### Regola

> In demo vendi il valore. Nel prodotto costruisci la robustezza.

---

## Safe Claude/Antigravity Prompt

```text
Modifica solo [file].

Obiettivo:
[obiettivo concreto]

Vincoli:
- Non toccare altri file.
- Non modificare logica dati.
- Non aggiungere dipendenze.
- Non fare refactor.
- Non cambiare routing.
- Non toccare Supabase/Spotify/API/env.

Processo:
1. Leggi solo ciò che serve.
2. Proponi piano breve.
3. Applica patch minima.
4. Riassumi diff.
5. Dimmi come testare.

Fermati se pensi di dover modificare più file.
```

---

## Prompt per Planning Mode

```text
Non modificare file.

Crea un piano operativo per [task].

Output:
1. Obiettivo
2. File coinvolti
3. Rischi
4. Sequenza step piccoli
5. Cosa non toccare
6. Test
7. Rollback
8. Quale modello/modalità usare
```

---

## Prompt per QA Agent

```text
Agisci come QA Agent.
Non modificare file.

Controlla il piano/modifica rispetto a:
- rispetto dello scope;
- rischio su file critici;
- bug possibili;
- mobile;
- build;
- flusso utente;
- regressioni;
- test manuali necessari.

Output:
- problemi trovati;
- gravità;
- cosa verificare;
- suggerimenti minimi.
```

---

## Prompt per Token Saver Agent

```text
Agisci come Token Saver Agent.

Classifica questo task:
- micro;
- semplice;
- medio;
- complesso;
- critico.

Dimmi:
1. modello/modalità consigliata;
2. perché;
3. contesto minimo da dare;
4. cosa evitare;
5. prompt finale ottimizzato.
```

---

## Prompt per Documentation Agent

```text
Trasforma questo lavoro in un checkpoint.

Formato:
- data;
- obiettivo;
- fonti/file usati;
- decisioni prese;
- file modificati;
- cosa funziona;
- cosa non toccare;
- prossimo step.
```

---

## Checklist prima di mandare un agente coding

```text
[ ] Il task è chiaro?
[ ] È piccolo?
[ ] So quale file modificare?
[ ] Ho scritto cosa NON toccare?
[ ] Il repo è pulito?
[ ] Ho fatto git status?
[ ] Serve read-only prima?
[ ] Serve Planning Mode?
[ ] Ho definito test?
[ ] Posso fare rollback?
[ ] Il modello scelto è proporzionato?
[ ] Ho evitato screenshot inutili?
```

---

## Checklist dopo modifica

```text
[ ] Ha modificato solo file richiesti?
[ ] Ha rispettato vincoli?
[ ] Non ha fatto refactor extra?
[ ] Non ha aggiunto dipendenze?
[ ] Build passa?
[ ] Flusso utente funziona?
[ ] Mobile ok?
[ ] Console senza errori bloccanti?
[ ] Git diff pulito?
[ ] Commit fatto?
[ ] Checkpoint aggiornato?
```

---

## Applicazione pratica Walbox

### Task sicuro

```text
Modifica solo CustomerJukeboxOldOrange.jsx.
Rendi più leggibile il bottone “Invia richiesta”.
Non toccare Supabase, Spotify, App.jsx, ManagerDashboard, LiveTvScreen.
```

### Task medio

```text
Analizza perché una richiesta non compare in dashboard.
Non modificare file.
Controlla solo flusso App.jsx → walboxDb.js → ManagerDashboard.
```

### Task complesso

```text
Progetta una modalità multi-locale.
Non implementare.
Crea piano con database, routing, UI, rischi, costi e fasi.
```

### Task da evitare

```text
Rifai Walbox per renderla più professionale.
```

Troppo ampio. Va spezzato.

---

## Best practice finale

Claude/Antigravity devono lavorare così:

```text
1. Understand
2. Plan
3. Edit minimally
4. Verify
5. Report
6. Commit
7. Checkpoint
```

Non così:

```text
Prompt enorme → modifica enorme → confusione → debug infinito
```

---

## Completezza stimata

Completezza: 86%

### Coperto bene

- best practice operative;
- anti-scope-creep;
- git safety;
- task splitting;
- context engineering;
- memory/CLAUDE.md;
- sub-agents;
- skills;
- hooks come roadmap;
- auto mode e approvals;
- parallelizzazione sicura;
- Walbox examples;
- prompt riutilizzabili;
- checklist prima/dopo.

### Da approfondire nei file dedicati

- sintassi esatta CLAUDE.md;
- configurazione sub-agents;
- struttura skill completa;
- hooks tecnici con JSON;
- Agent SDK;
- MCP;
- GitHub Actions;
- settings/scopes;
- sicurezza avanzata;
- pricing dettagliato.

---

## Prossimo file consigliato

```text
04_CLAUDE_MEMORY_AND_CONTEXT.md
```

Perché dopo le best practice, la cosa più importante è costruire una memoria di progetto buona: `CLAUDE.md`, `PROJECT_CONTEXT.md`, checkpoint e regole anti-contesto-spazzatura.

<!-- END_SOURCE_FILE: 03_CLAUDE_CODE_BEST_PRACTICES.md -->


<!-- BEGIN_SOURCE_FILE: 04_CLAUDE_MEMORY_AND_CONTEXT.md -->
<!-- SOURCE_SHA256_UTF8: 2c34d3837163e32f109217a7fd02837e940da4529566d9e2b5461a2ce76c1177 -->
<!-- SOURCE_CHAR_COUNT: 28116 -->

# 04_CLAUDE_MEMORY_AND_CONTEXT.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Claude Core  
Completezza stimata: 89%

---

## Scopo del file

Questo file spiega come costruire una memoria di progetto efficace per Claude Code, Antigravity e più in generale per agenti AI che lavorano su progetti reali.

L’obiettivo non è “scrivere tanti documenti”.

L’obiettivo è:

> fare in modo che l’agente sappia sempre cosa conta, cosa non deve toccare, dove siamo arrivati e qual è il prossimo step, senza dover ripetere tutto ogni volta.

Questo file serve per creare:

- `CLAUDE.md`;
- `PROJECT_CONTEXT.md`;
- file di checkpoint;
- memoria locale del progetto;
- regole anti-contesto-spazzatura;
- template per Walbox;
- template per nuovi clienti/progetti;
- istruzioni riutilizzabili per agenti coding, business, QA e research.

---

## Fonti ufficiali usate

Fonti principali:

1. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

2. Claude Code Settings  
   https://docs.anthropic.com/en/docs/claude-code/settings

3. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

4. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

5. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

6. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

7. Claude Code Hooks Reference  
   https://docs.anthropic.com/en/docs/claude-code/hooks

8. Effective Context Engineering for AI Agents  
   https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

9. Effective Harnesses for Long-running Agents  
   https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

10. Code Execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp

11. Claude Code CLI Reference  
    https://docs.anthropic.com/en/docs/claude-code/cli-reference

12. Claude Apps Release Notes / Memory  
    https://docs.anthropic.com/en/release-notes/claude-apps

---

## Sintesi brutale

Ogni sessione parte con una finestra di contesto nuova.  
Quindi, se non prepari bene la memoria, l’agente deve ricostruire tutto da zero.

La memoria serve a evitare questo problema.

Però attenzione:

> memoria non significa controllo assoluto.

Un file tipo `CLAUDE.md` dice all’agente cosa deve sapere e come deve comportarsi.  
Ma non blocca fisicamente un’azione pericolosa. Per bloccare davvero servono review, permessi, hooks, Git, CI o regole tecniche.

Quindi esistono due livelli:

```text
Memoria = guida l’agente.
Controlli = proteggono il progetto.
```

---

## Differenza tra memoria e contesto

### Contesto

È tutto ciò che l’agente riceve in una sessione:

- prompt;
- file aperti;
- documenti caricati;
- chat precedente;
- log;
- screenshot;
- codice letto;
- output terminale;
- istruzioni;
- tool disponibili.

### Memoria

È la parte persistente o semi-persistente del contesto:

- `CLAUDE.md`;
- memory automatiche;
- project context;
- checkpoint;
- regole di progetto;
- preferenze;
- decisioni già prese;
- cosa non toccare.

### Regola pratica

> Il contesto è ciò che l’agente vede ora.  
> La memoria è ciò che deve ricordare tra una sessione e l’altra.

---

## Perché ti serve davvero

Nel tuo caso, la memoria serve per 5 motivi:

1. Non ripetere sempre cos’è Walbox.
2. Non far rompere flussi già funzionanti.
3. Non consumare token rispiegando tutto.
4. Non perdere decisioni prese.
5. Creare un metodo replicabile per altri progetti/clienti.

Senza memoria, ogni nuova sessione rischia di diventare:

```text
Spiego tutto da capo → agente capisce metà → modifica troppo → debug → casino
```

Con memoria buona:

```text
Carica contesto → task piccolo → patch → test → checkpoint
```

---

## I due tipi di memoria Claude Code

La documentazione Claude Code descrive due meccanismi principali:

### 1. `CLAUDE.md`

File scritto da te.

Contiene istruzioni persistenti:

- contesto progetto;
- architettura;
- standard;
- workflow;
- comandi;
- file critici;
- cosa non toccare;
- regole di comportamento;
- preferenze tecniche.

### 2. Auto memory

Memoria scritta da Claude in base a correzioni, preferenze, pattern o istruzioni che emergono.

Esempi:

- “usa pnpm, non npm”;
- “i test API richiedono Redis locale”;
- “il progetto usa questa convenzione per i servizi”;
- “l’utente preferisce patch minime”.

### Regola

> `CLAUDE.md` è memoria deliberata.  
> Auto memory è apprendimento progressivo.

---

## Quando usare `CLAUDE.md`

Usa `CLAUDE.md` quando vuoi guidare stabilmente Claude su un progetto.

Esempi:

- Walbox;
- progetto cliente;
- template SaaS;
- app React;
- agente betting;
- agent business factory;
- progetto Expedia/copilot;
- documentazione tecnica;
- progetto musicale/creative workflow.

### Cosa deve fare

Un buon `CLAUDE.md` deve rispondere a:

```text
Che progetto è?
Qual è lo stack?
Cosa funziona già?
Quali file sono critici?
Come deve lavorare l’agente?
Cosa non deve fare?
Come si testa?
Come si fa rollback?
```

---

## Quando NON usare `CLAUDE.md`

Non usarlo per:

- brainstorming casuale;
- appunti enormi;
- idee future non prioritarie;
- contenuti non collegati al progetto;
- vecchie conversazioni;
- documentazione ufficiale intera copiata;
- log terminale;
- chat lunghe;
- screenshot descritti;
- roadmap infinita;
- problemi personali non legati al task.

### Regola

> `CLAUDE.md` non è un diario. È un manuale operativo compatto.

---

## La regola dei 3 livelli

Per non creare documenti enormi, dividi la memoria in tre livelli.

### Livello 1 — Core memory

File piccolo, caricato spesso.

Esempio:

```text
CLAUDE.md
```

Contiene solo ciò che serve sempre.

### Livello 2 — Project docs

File più dettagliati, consultabili quando servono.

Esempi:

```text
PROJECT_CONTEXT.md
SAFE_WORKFLOWS.md
WALBOX_ARCHITECTURE.md
PROMPT_LIBRARY.md
CHECKPOINTS.md
```

### Livello 3 — Archive / reference

Materiale storico o pesante.

Esempi:

```text
OLD_NOTES.md
RESEARCH_DUMPS.md
RAW_TRANSCRIPTS.md
SCREENSHOT_ANALYSIS.md
LONG_ROADMAP.md
```

### Regola

> Core piccolo. Dettagli separati. Archivio fuori dal contesto principale.

---

## Struttura consigliata per `CLAUDE.md`

Template base:

```md
# CLAUDE.md

## Project
Nome progetto e obiettivo in 3 righe.

## Current Stable State
Cosa funziona ora.

## Stack
Tecnologie principali.

## Critical Files
File da non modificare senza richiesta esplicita.

## Working Rules
Regole operative per l’agente.

## Safe Workflow
Come lavorare su modifiche.

## Verification
Comandi/test da eseguire.

## Do Not Do
Cose vietate.

## Current Priority
Una sola priorità attiva.
```

---

## Esempio `CLAUDE.md` per Walbox

```md
# CLAUDE.md — Walbox

## Project
Walbox / Walrus Social Jukebox è una demo React/Vite per locali.
I clienti entrano via QR, cercano canzoni, scelgono mood/dedica e inviano richieste.
La dashboard gestore modera la queue e la Live TV mostra il brano live.

## Current Stable State
- Deploy Vercel funzionante.
- Supabase Realtime sincronizza richieste tra telefono, dashboard e TV.
- Spotify search funziona via endpoint Vercel.
- Spotify Test Panel funziona per device/queue/playback.
- LiveTvScreen mostra Now Playing reale.
- ManagerDashboard funziona: non modificare senza richiesta.

## Stack
- React + Vite
- Supabase Realtime
- Vercel serverless functions
- Spotify API
- GitHub + Vercel deploy

## Critical Files
Non modificare senza richiesta esplicita:
- src/App.jsx
- src/services/walboxDb.js
- src/services/spotifyApi.js
- api/search.js
- vercel.json
- routing
- env variables
- Supabase schema
- Spotify auth flow

## Working Rules
- Una modifica alla volta.
- Preferisci patch minime.
- Non fare refactor non richiesti.
- Non aggiungere dipendenze senza spiegare perché.
- Non toccare backend/API durante polish UI.
- Se servono più file, fermati e spiega prima.

## Safe Workflow
1. Analizza task.
2. Indica file coinvolti.
3. Applica patch minima.
4. Spiega cosa hai cambiato.
5. Indica test manuale.
6. Non fare commit automatico.

## Verification
Comandi tipici:
- npm run build
- npm run dev
- git status
- git diff

Test manuali:
- cliente invia richiesta da telefono;
- Supabase riceve;
- dashboard vede;
- TV aggiorna;
- Spotify search/playback funziona se coinvolto.

## Do Not Do
- Non riscrivere l'app.
- Non modificare App.jsx per polish UI.
- Non rompere Supabase.
- Non cambiare schema database.
- Non cambiare Spotify auth.
- Non eliminare varianti già create.
- Non fare redesign totale senza piano.

## Current Priority
Mantenere demo stabile e fare solo miglioramenti piccoli, sicuri e presentabili.
```

---

## Esempio `CLAUDE.md` per nuovo cliente/locale

```md
# CLAUDE.md — Local Client App

## Project
Applicazione/demo personalizzata per un locale.
Obiettivo: creare esperienza digitale via QR per aumentare coinvolgimento, contenuti social e ritorno clienti.

## Product Type
Possibili moduli:
- jukebox/social experience;
- menu multilingua;
- loyalty card;
- promo/coupon;
- dashboard gestore;
- TV screen;
- raccolta feedback.

## Stack
- React/Vite
- Supabase
- Vercel
- eventuali API esterne

## Business Rule
Prima demo semplice, poi prodotto.
Non costruire feature grandi senza validazione cliente.

## Development Rule
Clonare/riusare template esistente quando possibile.
Separare brand copy/UI da logica core.

## Critical Areas
- database schema;
- routing;
- auth;
- payments;
- env variables;
- deploy config.

## Safe Workflow
1. Crea demo verticale.
2. Mantieni scope piccolo.
3. Testa su mobile.
4. Prepara pitch.
5. Raccogli feedback.
6. Solo dopo aggiungi feature.
```

---

## `PROJECT_CONTEXT.md` vs `CLAUDE.md`

### `CLAUDE.md`

Serve all’agente.

Deve essere breve, operativo e caricato spesso.

### `PROJECT_CONTEXT.md`

Serve a te e al progetto.

Può essere più descrittivo.

Contiene:

- visione;
- storia;
- roadmap;
- decisioni;
- pitch;
- stato attuale;
- business;
- note clienti;
- feature future.

### Regola

> `CLAUDE.md` guida il lavoro tecnico.  
> `PROJECT_CONTEXT.md` conserva il quadro completo.

---

## Template `PROJECT_CONTEXT.md`

```md
# PROJECT_CONTEXT.md

## Nome progetto

## One-liner
Descrizione in una frase.

## Problema che risolve

## Target
Chi lo usa.

## Valore per il cliente

## Stato attuale

## Stack tecnico

## Flusso utente

## Flusso gestore/admin

## File principali

## Decisioni già prese

## Cosa funziona

## Cosa non funziona

## Cosa non toccare

## Roadmap breve

## Roadmap futura

## Rischi

## Pricing/Business notes

## Prossimo step
```

---

## Esempio `PROJECT_CONTEXT.md` per Walbox

```md
# PROJECT_CONTEXT.md — Walbox

## One-liner
Walbox trasforma una serata normale in una social experience interattiva per locali.

## Problema
I locali vogliono coinvolgere clienti, creare contenuti social, raccogliere segnali sui gusti e rendere le serate più vive.

## Target
Bar, pub, piccoli locali, eventi, serate musicali.

## Valore
- QR experience semplice.
- Clienti partecipano.
- Staff controlla.
- TV crea atmosfera.
- Social media manager riceve contenuti pronti.
- Possibile loyalty/promo futura.

## Stato attuale
Demo Vercel funzionante con React/Vite, Supabase Realtime e Spotify.

## Flusso utente
QR → tavolo/nickname → cerca canzone → mood/dedica → invia richiesta.

## Flusso gestore
Dashboard → approva/rifiuta → invia a Spotify/queue → TV aggiorna.

## Roadmap breve
- demo stabile;
- pitch;
- prova locale;
- polish mobile;
- TV screen spettacolare.

## Roadmap futura
- loyalty;
- tessera punti;
- profilo Walrus;
- tourist mode;
- meme generator;
- conti aperti;
- multi-locale;
- analytics;
- pricing.
```

---

## `CHECKPOINT.md`

Un checkpoint serve quando chiudi una fase e vuoi riaprire più avanti senza perdere il filo.

### Quando crearlo

- dopo deploy riuscito;
- dopo bugfix;
- dopo modifica UI approvata;
- dopo presentazione cliente;
- prima di aprire nuova chat;
- prima di lavorare con nuovo agente;
- prima di refactor;
- quando qualcosa funziona e non va rotto.

### Template

```md
# CHECKPOINT — [Nome progetto]

## Data
YYYY-MM-DD

## Obiettivo completato

## Stato stabile

## File modificati

## Test effettuati

## Cosa funziona

## Cosa non toccare

## Problemi aperti

## Decisioni prese

## Prossimo step singolo

## Prompt utile per ripartire
```

---

## Esempio checkpoint Walbox

```md
# CHECKPOINT — Walbox Supabase Realtime

## Data
2026-05-28

## Obiettivo completato
Sostituita queue locale con Supabase Realtime.

## Stato stabile
- telefono cliente invia richieste;
- Supabase riceve righe;
- ManagerDashboard aggiorna;
- LiveTvScreen aggiorna;
- Vercel deploy Ready.

## File modificati
- src/App.jsx
- src/services/walboxDb.js
- package.json
- package-lock.json

## Test effettuati
- invio da telefono;
- verifica su Supabase;
- dashboard Mac;
- TV screen Mac;
- deploy Vercel.

## Cosa funziona
La queue è condivisa tra dispositivi.

## Cosa non toccare
- walboxDb.js
- App.jsx queue logic
- Supabase schema
- env variables Vercel

## Problemi aperti
Errore Unsplash non bloccante.

## Prossimo step
Polish Live TV senza toccare logica Supabase.
```

---

## Regola del “prossimo step singolo”

Ogni memoria deve chiudersi con una sola azione successiva.

Non:

```text
Prossimi step:
- loyalty;
- multi-locale;
- tourist mode;
- dashboard nuova;
- pitch;
- refactor;
- pricing;
- analytics;
- app mobile.
```

Sì:

```text
Prossimo step:
migliorare leggibilità mobile di CustomerJukeboxOldOrange senza toccare logica Supabase/Spotify.
```

### Perché

Gli agenti performano meglio quando hanno una direzione unica.

---

## Cosa NON mettere in memoria attiva

Evita:

- lunghe discussioni;
- motivazioni personali;
- chat complete;
- output vecchi;
- idee future non prioritarie;
- link non spiegati;
- screenshot senza descrizione;
- codice intero se non serve;
- documentazione ufficiale copiata;
- prompt falliti non riassunti;
- vecchi errori già superati.

### Regola

> In memoria attiva entra solo ciò che cambia il prossimo lavoro.

---

## Cosa mettere invece

Metti:

- decisioni tecniche;
- stato stabile;
- bug aperti;
- file critici;
- comandi build/test;
- preferenze di lavoro;
- vincoli;
- next step;
- rollback;
- errori ricorrenti;
- regole nate da errori.

---

## Context engineering per la AI Business Factory

Context engineering significa progettare bene cosa entra nella finestra di contesto.

Non è solo “riassumere”.

È decidere:

- cosa deve sapere l’agente;
- cosa può ignorare;
- cosa va richiamato solo quando serve;
- cosa va archiviato;
- cosa va trasformato in regola;
- cosa va trasformato in skill;
- cosa va trasformato in workflow.

### Formula

```text
Raw material → distillation → rule/template → active memory
```

Esempio:

Materiale grezzo:

```text
Chat lunga dove abbiamo capito che l'agente ha modificato App.jsx per errore.
```

Memoria buona:

```text
Durante safe-ui-edit non modificare App.jsx.
Se pensi serva, fermati e chiedi.
```

---

## Tipi di memoria nella tua Factory

### 1. Project memory

Per ogni progetto:

```text
PROJECT_CONTEXT.md
CLAUDE.md
CHECKPOINTS.md
SAFE_WORKFLOWS.md
```

### 2. Business memory

Per metodo generale:

```text
BUSINESS_FACTORY_WORKFLOW.md
PRICING_RULES.md
PITCH_TEMPLATES.md
VALIDATION_CHECKLIST.md
```

### 3. Agent memory

Per ruoli:

```text
FRONTEND_AGENT.md
QA_AGENT.md
TOKEN_SAVER_AGENT.md
RESEARCH_AGENT.md
SALES_AGENT.md
```

### 4. Skill memory

Per competenze riutilizzabili:

```text
frontend-safe-edit/SKILL.md
pitch-builder/SKILL.md
business-validator/SKILL.md
documentation-compressor/SKILL.md
```

### 5. Archive

Per materiale grezzo:

```text
raw_notes/
transcripts/
screenshots/
old_outputs/
research_dumps/
```

---

## Struttura cartella consigliata per un progetto

```text
project-name/
│
├── CLAUDE.md
├── PROJECT_CONTEXT.md
├── CHECKPOINTS.md
├── PROMPT_LIBRARY.md
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SAFE_WORKFLOWS.md
│   ├── BUSINESS_NOTES.md
│   └── ROADMAP.md
│
├── .agents/
│   ├── rules/
│   ├── workflows/
│   ├── skills/
│   └── references/
│
└── archive/
    ├── raw_notes/
    ├── old_checkpoints/
    └── research/
```

---

## Regola di aggiornamento memoria

Aggiorna memoria solo quando succede una di queste cose:

- nuova decisione tecnica;
- nuovo file critico;
- bug risolto;
- bug ancora aperto;
- nuova regola anti-errore;
- nuova fonte ufficiale importante;
- cambio workflow;
- demo cliente;
- cambio priorità;
- deploy stabile;
- feature completata.

Non aggiornare memoria per:

- pensieri casuali;
- prove temporanee;
- ipotesi non confermate;
- dettagli che non userai più.

---

## Prompt per aggiornare memoria

```text
Trasforma questa conversazione in aggiornamento memoria.

Output:
1. Decisioni prese
2. Regole operative nuove
3. File critici
4. Stato stabile
5. Cosa non toccare
6. Prossimo step
7. Cosa archiviare e NON mettere in memoria attiva
```

---

## Prompt per comprimere contesto

```text
Comprimi questo contesto per una nuova sessione agentica.

Mantieni solo:
- obiettivo;
- stato stabile;
- file rilevanti;
- vincoli;
- bug aperti;
- prossimo step;
- test.

Rimuovi:
- discussioni lunghe;
- idee future non necessarie;
- spiegazioni duplicate;
- dettagli emotivi;
- log non utili.
```

---

## Prompt per creare `CLAUDE.md`

```text
Crea un file CLAUDE.md per questo progetto.

Deve includere:
- project summary;
- stack;
- current stable state;
- critical files;
- working rules;
- safe workflow;
- verification;
- do not do;
- current priority.

Stile:
breve, operativo, non narrativo.
```

---

## Prompt per controllare `CLAUDE.md`

```text
Review this CLAUDE.md.

Check:
- too long sections;
- vague rules;
- missing critical files;
- missing verification steps;
- missing do-not-touch list;
- outdated info;
- instructions that should be hooks/permissions instead;
- content that belongs in PROJECT_CONTEXT.md instead.
```

---

## Prompt per creare checkpoint

```text
Crea un checkpoint operativo.

Formato:
- data;
- obiettivo completato;
- stato stabile;
- file modificati;
- test effettuati;
- cosa funziona;
- cosa non toccare;
- problemi aperti;
- decisioni prese;
- prossimo step singolo;
- prompt utile per ripartire.
```

---

## Prompt per ripartire da checkpoint

```text
Riparti da questo checkpoint.

Prima:
1. riassumi cosa è stabile;
2. indica cosa non va toccato;
3. proponi un solo prossimo step;
4. suggerisci il prompt sicuro per l’agente coding.

Non proporre feature extra.
```

---

## Anti-pattern di memoria

### 1. Memoria enciclopedica

Errore:

```text
Mettere tutto nel CLAUDE.md.
```

Problema: l’agente si perde e consuma contesto.

Soluzione:

```text
CLAUDE.md breve + docs separati.
```

---

### 2. Memoria troppo vaga

Errore:

```text
Lavora bene e non fare casino.
```

Soluzione:

```text
Non modificare App.jsx durante safe-ui-edit.
Se servono più di 2 file, fermati.
Esegui npm run build dopo modifiche React.
```

---

### 3. Memoria non aggiornata

Errore:

```text
Il file dice che la queue è localStorage, ma ora è Supabase.
```

Soluzione:

```text
Aggiorna stato stabile dopo ogni cambio architetturale.
```

---

### 4. Memoria con roadmap infinita

Errore:

```text
Inserire loyalty, tourist mode, meme generator, multi-locale, analytics, conti aperti come priorità attive.
```

Soluzione:

```text
Roadmap futura separata. Current priority una sola.
```

---

### 5. Memoria senza “do not touch”

Errore:

```text
L’agente sa cosa fare, ma non sa cosa evitare.
```

Soluzione:

```text
Aggiungi sempre Critical Files e Do Not Do.
```

---

## Memoria e token saving

Una buona memoria riduce token perché:

- evita di rispiegare il progetto;
- evita prompt lunghi;
- evita lettura inutile di file;
- evita errori e retry;
- permette task piccoli;
- rende i prompt standardizzati;
- riduce scope creep.

Ma una memoria cattiva aumenta token perché:

- è troppo lunga;
- contiene roba non rilevante;
- confonde il modello;
- fa caricare dettagli inutili;
- obbliga a chiarire dopo.

### Regola

> Memoria buona = meno token.  
> Memoria lunga ma sporca = più token.

---

## Differenza tra `CLAUDE.md`, skills e sub-agents

### `CLAUDE.md`

Contesto del progetto.

Risponde a:

```text
Dove siamo? Come si lavora qui?
```

### Skill

Competenza riutilizzabile.

Risponde a:

```text
Come si fa questo tipo di task?
```

### Sub-agent

Ruolo specializzato.

Risponde a:

```text
Chi deve fare questo task?
```

### Esempio

Task: polish mobile Walbox.

- `CLAUDE.md`: spiega cos’è Walbox e cosa non toccare.
- Skill `frontend-safe-edit`: spiega come fare modifiche UI sicure.
- Frontend Agent: esegue il task.

---

## Memoria per sub-agents

Ogni sub-agent dovrebbe avere istruzioni proprie.

Esempio:

```md
# Frontend Agent Memory

## Role
Lavora solo su UI, React components, CSS e responsive.

## Do
- patch minime;
- preserva logica;
- controlla mobile;
- rispetta brand.

## Do Not
- backend;
- database;
- API;
- routing;
- auth;
- env variables.
```

QA Agent:

```md
# QA Agent Memory

## Role
Controlla rischi e regressioni.

## Do
- read-only;
- verifica scope;
- cerca bug;
- propone test;
- segnala rischi.

## Do Not
- modificare file;
- proporre redesign;
- espandere scope.
```

---

## Memoria per AI Business Factory generale

File consigliato:

```text
AI_BUSINESS_FACTORY_MEMORY.md
```

Contenuto:

```md
# AI Business Factory Memory

## Goal
Creare business/prototipi con agenti AI attraverso workflow riutilizzabili.

## Core Principle
Ogni fonte deve diventare regola, workflow, prompt, skill o template.

## Tools
- ChatGPT: regia, sintesi, business, prompt.
- Claude Code: coding agent.
- Antigravity: sviluppo agentico su progetto.
- Supabase/Vercel/GitHub: infrastruttura.
- Web research: fonti ufficiali e competitor.

## Work Style
- uno step alla volta;
- deep dive quando serve;
- percentuale completezza;
- file .md operativi;
- prompt corti;
- documentazione viva;
- no teoria non applicata.

## Current Focus
Costruire la v1 dei file fondamentali.
```

---

## Completezza ideale di una memoria

Una memoria non deve arrivare al 100% in lunghezza.  
Deve arrivare al 100% in utilità per il prossimo lavoro.

Quindi:

- `CLAUDE.md`: 70–90% utile, breve.
- `PROJECT_CONTEXT.md`: 85–95% completo.
- `CHECKPOINT.md`: 90–100% dello stato attuale.
- `ROADMAP.md`: 60–80%, sempre vivo.
- `ARCHIVE`: può essere grezzo.

### Regola

> La memoria attiva deve essere completa per agire, non completa per raccontare tutto.

---

## Mini checklist per `CLAUDE.md`

```text
[ ] Il progetto è spiegato in meno di 5 righe?
[ ] Lo stack è chiaro?
[ ] Lo stato stabile è aggiornato?
[ ] I file critici sono elencati?
[ ] Le regole di lavoro sono pratiche?
[ ] C’è una lista Do Not Do?
[ ] C’è una verifica/test?
[ ] C’è una sola priorità corrente?
[ ] Non contiene roadmap enorme?
[ ] Non contiene materiale vecchio?
[ ] Non contiene log o chat grezze?
```

---

## Mini checklist per checkpoint

```text
[ ] Data presente?
[ ] Stato stabile chiaro?
[ ] File modificati?
[ ] Test effettuati?
[ ] Cosa funziona?
[ ] Cosa non toccare?
[ ] Problemi aperti?
[ ] Decisioni prese?
[ ] Prossimo step singolo?
```

---

## Mini checklist per context compression

```text
[ ] Ho rimosso duplicati?
[ ] Ho rimosso idee future non utili?
[ ] Ho mantenuto decisioni tecniche?
[ ] Ho mantenuto bug aperti?
[ ] Ho mantenuto file critici?
[ ] Ho mantenuto test/verifica?
[ ] Ho mantenuto prossimo step?
[ ] Ho trasformato errori in regole?
```

---

## Regole specifiche per Walbox

### Memoria attiva Walbox deve sempre includere

- demo Vercel stabile;
- Supabase Realtime funzionante;
- Spotify search/playback separati;
- ManagerDashboard funzionante da non toccare senza motivo;
- CustomerJukeboxOldOrange come area mobile cliente;
- LiveTvScreen come area TV demo;
- palette Walrus;
- social experience come posizionamento;
- prossimo step singolo.

### Memoria Walbox non deve includere sempre

- tutte le idee future;
- tutte le varianti vecchie;
- discussioni business lunghe;
- ogni dettaglio dei meeting;
- vecchi errori risolti;
- post social;
- brainstorming non selezionato.

### Regola

> Walbox active memory deve proteggere la demo. La roadmap futura può stare altrove.

---

## Regola “memory first” prima di un nuovo progetto cliente

Prima di creare una nuova versione per un altro bar/locale:

1. Duplica template.
2. Crea `PROJECT_CONTEXT.md`.
3. Crea `CLAUDE.md`.
4. Definisci brand e target.
5. Definisci feature MVP.
6. Definisci cosa riusare da Walbox.
7. Definisci cosa NON toccare nel core.
8. Solo dopo apri coding agent.

### Prompt

```text
Crea PROJECT_CONTEXT.md e CLAUDE.md per questo nuovo cliente locale.
Usa Walbox come base riutilizzabile, ma separa:
- brand;
- testi;
- colori;
- feature MVP;
- core tecnico da non toccare.
```

---

## Memoria e business

La memoria non serve solo al codice.

Serve anche a vendere.

Per ogni cliente dovresti avere:

```text
CLIENT_CONTEXT.md
```

Con:

```md
# CLIENT_CONTEXT.md

## Cliente
Nome locale.

## Problema percepito

## Obiezioni emerse

## Cosa gli piace

## Feature da mostrare

## Feature da NON proporre subito

## Linguaggio da usare

## Prezzo ipotetico

## Prossimo messaggio/pitch
```

### Esempio Walrus

```md
## Obiezione SMM
“Chi approva? Chi la gestisce?”

## Risposta
Walbox non sostituisce il social media manager.
Gli genera contenuti vivi, classifiche, momenti e materiale già pronto.

## Linguaggio chiave
“social experience”
```

---

## Memoria e documentazione ufficiale

Non copiare tutta la documentazione ufficiale dentro i file memoria.

Meglio:

```md
## Fonte
Claude Code Memory:
https://docs.anthropic.com/en/docs/claude-code/memory

## Regola estratta
CLAUDE.md è contesto, non sicurezza. Per blocchi veri servono hooks/permissions/review.
```

### Regola

> Fonte lunga fuori. Regola estratta dentro.

---

## Decisione operativa

Per la AI Business Factory, la memoria deve essere divisa così:

```text
AI_BUSINESS_FACTORY/
│
├── CORE_MEMORY/
│   ├── AI_BUSINESS_FACTORY_MEMORY.md
│   ├── PROJECT_CONTEXT_TEMPLATE.md
│   ├── CLAUDE_MD_TEMPLATE.md
│   └── CHECKPOINT_TEMPLATE.md
│
├── PROJECTS/
│   └── WALBOX/
│       ├── PROJECT_CONTEXT.md
│       ├── CLAUDE.md
│       ├── CHECKPOINTS.md
│       └── CLIENT_CONTEXT.md
│
├── AGENTS/
│   ├── FRONTEND_AGENT.md
│   ├── QA_AGENT.md
│   ├── TOKEN_SAVER_AGENT.md
│   └── SALES_AGENT.md
│
└── ARCHIVE/
    ├── raw_notes/
    ├── old_outputs/
    └── research_dumps/
```

---

## File da creare dopo questo

Questo file genera direttamente questi futuri file/template:

```text
20_PROJECT_CONTEXT_TEMPLATE.md
19_CHECKPOINT_TEMPLATE.md
CLAUDE_MD_TEMPLATE.md
AI_BUSINESS_FACTORY_MEMORY.md
WALBOX_CLAUDE_MD.md
CLIENT_CONTEXT_TEMPLATE.md
CONTEXT_COMPRESSION_PROMPTS.md
```

---

## Regola finale

La memoria deve fare una cosa sola:

```text
Aiutare il prossimo agente a fare il prossimo task meglio.
```

Se un’informazione non aiuta il prossimo task, non deve stare nella memoria attiva.

---

## Completezza stimata

Completezza attuale: 89%

### Coperto bene

- differenza tra contesto e memoria;
- `CLAUDE.md`;
- auto memory;
- memoria vs sicurezza;
- template `CLAUDE.md`;
- template `PROJECT_CONTEXT.md`;
- template checkpoint;
- context engineering;
- esempi Walbox;
- memoria per clienti;
- memoria per agenti;
- memoria per business;
- prompt per creare/aggiornare/comprimere;
- regole anti-contesto-spazzatura;
- token saving collegato alla memoria.

### Da approfondire nei file dedicati

- sintassi precisa `.claude/rules/`;
- auto memory operativa dentro Claude Code;
- sub-agent memory;
- hooks per bloccare davvero azioni;
- settings managed/org;
- import/export memory Claude app;
- differenze tra Claude app memory e Claude Code memory;
- esempi reali di file `.claude/`;
- integrazione con Antigravity `.agents`.

---

## Prossimo file consigliato

```text
05_AGENT_ROLES_AND_SUBAGENTS.md
```

Perché dopo memoria e contesto, il passo successivo è definire bene “chi fa cosa”: strategist, research, frontend, backend, QA, sales, token saver e documentation agent.

<!-- END_SOURCE_FILE: 04_CLAUDE_MEMORY_AND_CONTEXT.md -->


<!-- BEGIN_SOURCE_FILE: 05_AGENT_ROLES_AND_SUBAGENTS.md -->
<!-- SOURCE_SHA256_UTF8: b29f9a77138462fd88de7733561ecdafb290f0af90c77e93d888041a465870f8 -->
<!-- SOURCE_CHAR_COUNT: 33242 -->

# 05_AGENT_ROLES_AND_SUBAGENTS.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Agents  
Completezza stimata: 88%

---

## Scopo del file

Questo file definisce la struttura degli agenti della tua **AI Business Factory**.

L’obiettivo è trasformare il concetto generico di “agenti AI che lavorano insieme” in una squadra operativa concreta, con:

- ruoli chiari;
- confini chiari;
- task adatti a ogni agente;
- cosa ogni agente può fare;
- cosa ogni agente NON deve fare;
- quando usare sub-agents;
- quando NON usarli;
- come evitare caos, conflitti e spreco token;
- come applicarli a Walbox e a nuovi business.

La regola centrale:

> Un agente non deve fare tutto. Un agente deve avere un mestiere.

---

## Fonti ufficiali usate

Fonti primarie:

1. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

2. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

3. Claude Code Settings  
   https://docs.anthropic.com/en/docs/claude-code/settings

4. Claude Code CLI Reference  
   https://docs.anthropic.com/en/docs/claude-code/cli-reference

5. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

6. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

7. Claude Agent SDK Overview  
   https://docs.anthropic.com/en/docs/claude-code/sdk

8. Building Agents with the Claude Agent SDK  
   https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

9. Building Effective AI Agents  
   https://www.anthropic.com/research/building-effective-agents

10. How we built our multi-agent research system  
    https://www.anthropic.com/engineering/multi-agent-research-system

11. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

12. Effective Harnesses for Long-running Agents  
    https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

13. Building a C compiler with a team of parallel Claudes  
    https://www.anthropic.com/engineering/building-c-compiler

14. Writing Effective Tools for Agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

15. Claude Code Hooks Guide  
    https://docs.anthropic.com/en/docs/claude-code/hooks-guide

16. Anthropic Courses / Sub-agents  
    https://docs.anthropic.com/en/docs/resources/courses

---

## Sintesi brutale

I sub-agents sono agenti specializzati.

La documentazione Claude Code li descrive come assistenti AI separati, con proprio contesto, istruzioni, tool access e permessi, pensati per workflow specifici e per migliorare la gestione del contesto.

Tradotto per te:

> non devi avere “un AI gigante che fa tutto”.  
> devi avere una squadra di agenti piccoli, ognuno con un ruolo preciso.

Esempio:

- Strategist Agent: decide cosa costruire.
- Research Agent: cerca fonti, competitor, docs.
- Product Manager Agent: spezza idee in roadmap.
- Frontend Agent: modifica UI.
- Backend Agent: lavora su API/database.
- QA Agent: trova rischi.
- Sales Agent: crea pitch.
- Token Saver Agent: sceglie modello/modalità.
- Documentation Agent: crea checkpoint e manuali.

---

## Perché servono i ruoli agentici

Senza ruoli, succede questo:

```text
Prompt generico → agente legge troppo → modifica troppo → spiega troppo → costa troppo → rischia di rompere.
```

Con ruoli:

```text
Task → agente giusto → contesto giusto → output giusto → meno token → meno rischio.
```

### Esempio

Richiesta vaga:

```text
Miglioriamo Walbox.
```

Sistema agentico:

```text
Strategist Agent → decide priorità.
Product Manager Agent → crea task piccoli.
Frontend Agent → modifica solo UI.
QA Agent → controlla regressioni.
Documentation Agent → crea checkpoint.
Sales Agent → aggiorna pitch.
```

---

## Regola madre degli agenti

```text
Un agente = un ruolo + un obiettivo + confini + output atteso.
```

Se manca uno di questi elementi, l’agente diventa pericoloso o inutile.

---

## Quando usare un sub-agent

Usa un sub-agent quando:

- il task è ricorrente;
- serve competenza specifica;
- vuoi isolare contesto;
- vuoi evitare di sporcare la conversazione principale;
- vuoi delegare una parte del lavoro;
- l’output deve essere sintetico;
- il task non deve modificare tutto;
- vuoi applicare permessi o tool diversi;
- vuoi parallelizzare ricerca/copy/QA;
- vuoi mantenere la chat principale pulita.

### Esempi buoni

```text
Research Agent cerca competitor.
QA Agent controlla regressioni.
Frontend Agent modifica un componente.
Token Saver Agent classifica task e modello.
Sales Agent crea pitch.
Documentation Agent crea checkpoint.
```

---

## Quando NON usare un sub-agent

Non usare sub-agent quando:

- il task è troppo semplice;
- basta un prompt diretto;
- non sai ancora cosa vuoi;
- più agenti modificherebbero gli stessi file;
- il task richiede una decisione umana;
- vuoi solo brainstorming libero;
- non hai definito output;
- stai creando complessità inutile;
- rischi di far leggere contesto a 5 agenti inutilmente.

### Esempio cattivo

```text
Apri 8 agenti per rifare tutta Walbox.
```

Perché è pericoloso:

- conflitti sui file;
- token bruciati;
- output contraddittori;
- difficile review;
- alto rischio regressioni;
- nessun owner chiaro.

---

## Regola anti-caos

> Più agenti possono pensare in parallelo.  
> Un solo agente alla volta dovrebbe modificare codice critico.

---

## Architettura base della tua squadra agentica

```text
AI BUSINESS FACTORY AGENT TEAM

1. Strategist Agent
2. Research Agent
3. Product Manager Agent
4. Frontend Agent
5. Backend Agent
6. QA Agent
7. Sales/Pitch Agent
8. Token Saver Agent
9. Documentation Agent
10. Security/Permissions Agent
11. Client Context Agent
12. Walbox Specialist Agent
```

Non devi usarli tutti sempre.

Devi scegliere l’agente giusto per lo step giusto.

---

# 1. Strategist Agent

## Ruolo

Trasforma idee confuse in direzione chiara.

## Quando usarlo

- quando hai troppe idee;
- quando non sai quale progetto priorizzare;
- quando vuoi capire se un’idea ha senso;
- quando devi decidere MVP;
- quando devi scegliere tra feature;
- quando devi trasformare brainstorming in piano;
- quando vuoi capire “è business o solo cosa figa?”.

## Input ideale

```text
Ho questa idea: [descrizione].
Target: [chi la usa].
Contesto: [perché mi interessa].
Vincoli: [tempo/costo/skill].
Output desiderato: priorità e prossimo step.
```

## Output atteso

- idea sintetizzata;
- problema reale;
- target;
- valore;
- rischi;
- MVP minimo;
- cosa NON fare ora;
- prossimo step.

## Cosa può fare

- valutare potenziale business;
- tagliare feature;
- creare roadmap;
- scegliere priorità;
- definire demo;
- indicare quali agenti servono dopo.

## Cosa NON deve fare

- scrivere codice;
- modificare file;
- decidere dettagli tecnici profondi;
- creare roadmap infinita;
- aggiungere feature solo perché “fighe”.

## Prompt template

```text
Agisci come Strategist Agent.

Obiettivo:
trasformare questa idea in direzione operativa.

Input:
[idea]

Output:
1. Problema reale
2. Target
3. Valore
4. MVP minimo
5. Cosa evitare ora
6. Rischi
7. Agente successivo da usare
8. Prossimo step singolo
```

## Applicazione Walbox

Esempio:

```text
Idea: creare versione per altro bar.
Strategist Agent decide:
- non rifare app da zero;
- clonare struttura Walbox;
- cambiare brand;
- mantenere core tecnico;
- fare demo serata/test;
- preparare pitch.
```

---

# 2. Research Agent

## Ruolo

Cerca fonti, competitor, documentazione, benchmark e best practice.

## Quando usarlo

- fonti ufficiali Claude/Anthropic;
- docs Antigravity/Gemini;
- competitor locali;
- prezzi di servizi simili;
- best practice UI;
- esempi SaaS;
- privacy/GDPR;
- API docs;
- trend business;
- tool alternativi.

## Input ideale

```text
Tema da ricercare:
[tema]

Tipo fonti:
- ufficiali;
- competitor;
- esempi;
- prezzi;
- tutorial;
- norme.

Output:
sintesi + link + cosa estrarre.
```

## Output atteso

- fonti;
- ranking per qualità;
- cosa dice ogni fonte;
- perché serve;
- cosa trasformare in regola;
- cosa ignorare;
- prossimi file da creare.

## Cosa può fare

- cercare;
- confrontare;
- filtrare;
- distinguere fonti ufficiali da casuali;
- creare indici;
- aggiornare watchlist.

## Cosa NON deve fare

- modificare codice;
- prendere decisioni finali di prodotto;
- usare blog come fonte primaria se esiste doc ufficiale;
- copiare articoli interi;
- creare output enciclopedico senza regole operative.

## Prompt template

```text
Agisci come Research Agent.

Ricerca:
[tema]

Priorità:
1. fonti ufficiali;
2. documentazione primaria;
3. engineering blog autorevoli;
4. competitor reali;
5. video/blog solo come extra.

Output:
- fonte;
- link;
- cosa spiega;
- utilità per noi;
- regola operativa da estrarre;
- priorità;
- file .md collegato.
```

## Regola

> Research Agent non deve solo trovare link. Deve trasformare fonti in materiale operativo.

---

# 3. Product Manager Agent

## Ruolo

Trasforma strategia in roadmap, task e priorità.

## Quando usarlo

- dopo Strategist Agent;
- prima di coding agent;
- quando il progetto ha troppe feature;
- quando serve spezzare in step;
- quando devi decidere cosa fare oggi;
- prima di sprint;
- prima di demo.

## Output atteso

- roadmap breve;
- task piccoli;
- ordine;
- dipendenze;
- rischi;
- definizione di done;
- cosa rimandare;
- file/task per agenti tecnici.

## Cosa può fare

- creare backlog;
- dividere MVP e roadmap;
- definire milestone;
- creare task tecnici;
- ordinare priorità;
- proteggere demo stabile.

## Cosa NON deve fare

- scrivere codice;
- aprire refactor enormi;
- trasformare MVP in prodotto enterprise;
- aggiungere complessità non validata.

## Prompt template

```text
Agisci come Product Manager Agent.

Contesto:
[progetto]

Obiettivo:
trasformare questa idea in task eseguibili.

Output:
1. MVP
2. Non-MVP
3. Task immediati
4. Ordine consigliato
5. Dipendenze
6. Rischi
7. Definition of Done
8. Prompt per agente tecnico
```

## Applicazione Walbox

Product Manager Agent deve dire:

```text
Non implementare subito loyalty completa.
Prima crea demo Profilo Walrus Coming Soon con dati finti.
```

---

# 4. Frontend Agent

## Ruolo

Lavora su UI, React components, CSS, responsive, layout e polish visivo.

## Quando usarlo

- componenti React;
- mobile layout;
- TV screen;
- dashboard UI;
- copy UI;
- bottoni;
- card;
- spacing;
- responsive;
- animazioni leggere;
- brandizzazione.

## Input ideale

```text
File da modificare:
[percorso]

Obiettivo UI:
[descrizione]

Vincoli:
- non toccare logica;
- non toccare API;
- non toccare routing;
- non aggiungere dipendenze.
```

## Output atteso

- patch minima;
- file modificati;
- cosa ha cambiato;
- cosa NON ha toccato;
- come testare;
- rischi UI.

## Cosa può fare

- JSX/CSS;
- layout;
- responsive;
- componenti;
- stile;
- microcopy;
- classi CSS;
- miglioramenti visuali.

## Cosa NON deve fare

- backend;
- Supabase;
- Spotify API;
- routing;
- auth;
- env variables;
- schema database;
- refactor globale;
- modificare App.jsx se non richiesto.

## Prompt template

```text
Agisci come Frontend Agent.

Modifica solo:
[file]

Obiettivo:
[obiettivo UI]

Vincoli:
- non modificare logica dati;
- non modificare state/useEffect/API;
- non toccare backend;
- non aggiungere dipendenze;
- non fare refactor.

Output:
1. piano breve;
2. patch minima;
3. file modificati;
4. test UI;
5. rischi residui.
```

## Applicazione Walbox

Task buono:

```text
Modifica solo CustomerJukeboxOldOrange.jsx.
Rendi più leggibile il blocco ricerca su mobile.
Non toccare createSongRequest, searchTrack, selectedSong o Supabase.
```

---

# 5. Backend Agent

## Ruolo

Lavora su API, database, servizi, Supabase, Spotify, serverless functions, auth e integrazioni.

## Quando usarlo

- Supabase schema;
- Realtime;
- API Vercel;
- Spotify endpoint;
- auth;
- env variables;
- backend logic;
- database queries;
- error handling;
- data models.

## Output atteso

- piano prima della modifica;
- file coinvolti;
- rischio;
- patch minima;
- test;
- rollback.

## Cosa può fare

- servizi;
- API routes;
- database integration;
- query;
- serverless functions;
- gestione errori;
- logging;
- auth flow.

## Cosa NON deve fare

- redesign UI;
- copy commerciale;
- modifiche estetiche;
- cambiare schema senza piano;
- modificare env senza istruzioni;
- toccare dati reali senza backup;
- usare segreti in chiaro.

## Prompt template

```text
Agisci come Backend Agent.

Modalità:
prima analisi, poi patch solo se approvata.

Task:
[task backend]

Output iniziale:
1. file coinvolti;
2. flusso dati;
3. rischi;
4. patch minima;
5. test;
6. rollback.

Non modificare schema database o env variables senza conferma.
```

## Applicazione Walbox

Task backend medio:

```text
Analizza perché una richiesta viene salvata in Supabase ma non compare in Dashboard.
Non modificare file.
Controlla solo flusso walboxDb.js → App.jsx → ManagerDashboard.
```

---

# 6. QA Agent

## Ruolo

Trova bug, regressioni, rischi, casi limite e problemi di flusso.

## Quando usarlo

- dopo patch;
- prima di commit;
- prima di deploy;
- prima di demo;
- dopo modifica multi-file;
- dopo interventi su Supabase/Spotify;
- quando qualcosa “sembra funzionare” ma vuoi sicurezza.

## Output atteso

- rischi;
- test manuali;
- regressioni possibili;
- cosa controllare;
- gravità;
- fix consigliati;
- no codice se non richiesto.

## Cosa può fare

- review;
- test plan;
- edge cases;
- checklist;
- rilevare scope creep;
- controllare se file protetti sono stati toccati.

## Cosa NON deve fare

- modificare codice;
- proporre redesign;
- espandere scope;
- aggiungere nuove feature;
- fare refactor.

## Prompt template

```text
Agisci come QA Agent.
Modalità read-only.

Controlla questa modifica/piano rispetto a:
- scope;
- file toccati;
- rischi;
- regressioni;
- mobile;
- build;
- flusso utente;
- Supabase/Spotify se coinvolti;
- test manuali.

Output:
1. problemi trovati;
2. gravità;
3. test necessari;
4. fix minimi;
5. decisione: safe / attenzione / bloccare.
```

## Applicazione Walbox

QA deve verificare:

```text
Cliente invia richiesta → Supabase riceve → Dashboard vede → Staff approva → TV aggiorna → Spotify mostra now playing.
```

---

# 7. Sales/Pitch Agent

## Ruolo

Trasforma prodotto e demo in proposta commerciale.

## Quando usarlo

- prima di parlare con locale;
- dopo una demo;
- dopo feedback cliente;
- per messaggi WhatsApp;
- per one-page;
- per proposta prezzo;
- per spiegare valore;
- per superare obiezioni.

## Output atteso

- pitch breve;
- messaggio WhatsApp;
- one-page;
- proposta commerciale;
- risposte a obiezioni;
- pacchetti/prezzi;
- script demo.

## Cosa può fare

- copy;
- posizionamento;
- naming;
- offerte;
- demo script;
- storytelling;
- risposte a obiezioni;
- pricing base.

## Cosa NON deve fare

- promettere feature non costruite;
- vendere “AI” in modo vago;
- parlare troppo tecnico;
- usare parole che spaventano tipo “profilazione”;
- inventare risultati economici non provati.

## Prompt template

```text
Agisci come Sales/Pitch Agent.

Prodotto:
[descrizione]

Target:
[cliente]

Obiettivo:
[demo / vendita / follow-up]

Output:
1. pitch in 3 righe;
2. messaggio WhatsApp;
3. proposta valore;
4. obiezioni e risposte;
5. prezzo/pacchetti se richiesto;
6. CTA finale.
```

## Applicazione Walbox

Frase chiave:

```text
Walbox trasforma una serata normale in una social experience interattiva: il cliente partecipa, la TV crea atmosfera e il social media manager riceve contenuti vivi già pronti.
```

---

# 8. Token Saver Agent

## Ruolo

Riduce spreco di token/crediti scegliendo modello, modalità e contesto minimo.

## Quando usarlo

- prima di task costoso;
- prima di usare modello potente;
- prima di allegare screenshot;
- prima di multi-agent;
- prima di task multi-file;
- prima di deep dive;
- quando non sai se usare Fast/Planning/High.

## Output atteso

- classificazione task;
- modello/modalità consigliata;
- contesto minimo;
- cosa evitare;
- prompt ottimizzato;
- rischio token.

## Cosa può fare

- scegliere Low/Medium/High;
- consigliare read-only;
- comprimere prompt;
- evitare screenshot inutili;
- spezzare task;
- evitare agenti multipli se inutili.

## Cosa NON deve fare

- implementare;
- decidere business;
- fare ricerca lunga;
- espandere task.

## Prompt template

```text
Agisci come Token Saver Agent.

Task:
[descrizione]

Classifica:
- micro;
- semplice;
- medio;
- complesso;
- critico.

Output:
1. modello/modalità consigliata;
2. perché;
3. contesto minimo da fornire;
4. cosa evitare;
5. prompt finale ottimizzato;
6. rischio token.
```

## Esempio

Task:

```text
Cambiare testo bottone.
```

Output:

```text
Micro. Usa modello economico/Fast. Un file. Nessuno screenshot. Prompt diretto.
```

Task:

```text
Nuova architettura multi-locale.
```

Output:

```text
Critico. Planning, modello forte, read-only prima, nessuna implementazione subito.
```

---

# 9. Documentation Agent

## Ruolo

Trasforma lavoro, fonti e decisioni in documentazione viva.

## Quando usarlo

- dopo ogni step;
- dopo deploy;
- dopo bugfix;
- dopo demo cliente;
- dopo deep dive;
- dopo cambio architettura;
- prima di chiudere chat;
- quando serve checkpoint;
- quando serve template.

## Output atteso

- checkpoint;
- changelog;
- file `.md`;
- sintesi;
- regole estratte;
- aggiornamento memoria;
- next step.

## Cosa può fare

- riassumere;
- comprimere;
- creare template;
- aggiornare context;
- creare file docs;
- estrarre regole;
- distinguere attivo vs archivio.

## Cosa NON deve fare

- inventare fonti;
- modificare codice;
- creare documentazione infinita;
- mettere tutto in memoria attiva;
- trasformare brainstorming grezzo in regola senza filtro.

## Prompt template

```text
Agisci come Documentation Agent.

Trasforma questo materiale in:
- decisioni;
- regole operative;
- checkpoint;
- file da aggiornare;
- cose da archiviare;
- prossimo step singolo.

Stile:
breve, operativo, pronto per .md.
```

---

# 10. Security/Permissions Agent

## Ruolo

Controlla rischi, permessi, segreti, sicurezza e azioni potenzialmente distruttive.

## Quando usarlo

- prima di dare accesso a tool;
- prima di auto mode;
- prima di hooks;
- prima di lavorare su repo cliente;
- prima di usare segreti/API keys;
- prima di modificare database;
- prima di deploy produzione;
- prima di multi-agent su codebase reale.

## Output atteso

- rischio;
- permessi minimi;
- file/azioni vietate;
- controllo segreti;
- rollback;
- raccomandazioni.

## Cosa può fare

- controllare blast radius;
- indicare azioni distruttive;
- proporre sandbox;
- consigliare hooks;
- controllare env;
- creare policy.

## Cosa NON deve fare

- sostituire consulenza legale/sicurezza;
- autorizzare azioni senza review;
- esporre segreti;
- modificare permessi da solo.

## Prompt template

```text
Agisci come Security/Permissions Agent.

Controlla questo workflow:
[workflow]

Output:
1. rischi;
2. file/azioni pericolose;
3. permessi minimi;
4. cosa bloccare;
5. cosa richiede conferma;
6. rollback;
7. livello sicurezza: basso/medio/alto.
```

---

# 11. Client Context Agent

## Ruolo

Tiene traccia del contesto di un cliente/locale e lo trasforma in proposta personalizzata.

## Quando usarlo

- dopo incontro con cliente;
- prima di pitch;
- prima di follow-up;
- quando cloni Walbox per altro locale;
- quando vuoi capire cosa proporre/non proporre;
- quando devi rispondere a obiezioni.

## Output atteso

- profilo cliente;
- problemi percepiti;
- opportunità;
- obiezioni;
- linguaggio da usare;
- feature da mostrare;
- prezzo ipotetico;
- prossimo messaggio.

## Cosa può fare

- organizzare appunti;
- distinguere bisogno reale da idea tua;
- suggerire demo;
- creare proposta personalizzata;
- aggiornare `CLIENT_CONTEXT.md`.

## Cosa NON deve fare

- inventare budget cliente;
- promettere feature non pronte;
- usare gergo tecnico;
- proporre troppa roba subito.

## Prompt template

```text
Agisci come Client Context Agent.

Appunti cliente:
[appunti]

Output:
1. cosa gli interessa davvero;
2. obiezioni;
3. feature da mostrare;
4. feature da NON mostrare ora;
5. linguaggio giusto;
6. proposta iniziale;
7. follow-up message.
```

---

# 12. Walbox Specialist Agent

## Ruolo

Agente specializzato su Walbox: conosce stack, stato stabile, roadmap, file critici e posizionamento.

## Quando usarlo

- task specifici Walbox;
- demo locale;
- polish UI;
- roadmap;
- pitch Walrus/altro locale;
- Supabase/Spotify;
- live TV;
- dashboard;
- customer flow;
- business social experience.

## Output atteso

- task sicuro;
- file coinvolti;
- cosa non toccare;
- next step;
- prompt per coding agent;
- aggiornamento checkpoint.

## Cosa può fare

- collegare tecnico e business;
- proteggere demo stabile;
- decidere se una feature è MVP o roadmap;
- creare prompt Antigravity;
- aggiornare documentazione Walbox.

## Cosa NON deve fare

- rifare app da zero;
- toccare core stabile senza motivo;
- promettere prodotto definitivo;
- dimenticare che Walbox è demo/pilota.

## Prompt template

```text
Agisci come Walbox Specialist Agent.

Contesto:
Walbox è una social experience per locali con QR, richiesta canzoni, Supabase Realtime, Spotify, dashboard e Live TV.

Task:
[task]

Output:
1. è MVP o roadmap?
2. file coinvolti;
3. rischi;
4. cosa non toccare;
5. prompt sicuro per Antigravity/Claude;
6. test;
7. checkpoint da aggiornare.
```

---

## Differenza tra agente, skill e workflow

### Agente

Risponde alla domanda:

```text
Chi deve fare il lavoro?
```

Esempio:

```text
Frontend Agent
```

### Skill

Risponde alla domanda:

```text
Come si fa quel tipo di lavoro?
```

Esempio:

```text
frontend-safe-edit
```

### Workflow

Risponde alla domanda:

```text
In che sequenza si lavora?
```

Esempio:

```text
git status → patch minima → npm run build → git diff → commit
```

### Esempio completo

Task:

```text
Migliorare bottone mobile in CustomerJukeboxOldOrange.
```

Sistema:

```text
Agent: Frontend Agent
Skill: frontend-safe-edit
Workflow: safe-ui-edit
Context: Walbox CLAUDE.md
Model: Fast/Medium
```

---

## Schema di delega

```text
IDEA CONFUSA
↓
Strategist Agent
↓
Product Manager Agent
↓
Token Saver Agent
↓
Agente tecnico giusto
↓
QA Agent
↓
Documentation Agent
↓
Sales Agent, se serve
```

Esempio Walbox:

```text
Idea: facciamo versione altro bar.
↓
Strategist: è clonabile? cosa vendere?
↓
Product Manager: demo minima per quel bar.
↓
Token Saver: modello/modalità.
↓
Frontend: brand UI.
↓
Backend: solo se serve database separato.
↓
QA: test flusso.
↓
Sales: pitch.
↓
Documentation: checkpoint cliente.
```

---

## Parallelizzazione sicura

### Sì

Puoi far lavorare in parallelo:

```text
Research Agent → competitor
Sales Agent → pitch
QA Agent → checklist
Documentation Agent → template
Strategist Agent → analisi idea
```

### No o attenzione

Non far lavorare in parallelo:

```text
Frontend Agent A → modifica LiveTvScreen.jsx
Frontend Agent B → modifica LiveTvScreen.jsx
Backend Agent → modifica App.jsx
Walbox Specialist → modifica App.jsx
```

### Regola

> Parallelizza pensiero e ricerca. Serializza modifiche al codice.

---

## Matrice: quale agente usare?

| Situazione | Agente |
|---|---|
| Ho un’idea nuova | Strategist Agent |
| Devo capire se vale business | Strategist + Research |
| Devo spezzare in task | Product Manager |
| Devo fare ricerca fonti | Research |
| Devo modificare UI | Frontend |
| Devo lavorare su API/database | Backend |
| Devo testare rischi | QA |
| Devo fare pitch | Sales/Pitch |
| Devo non sprecare token | Token Saver |
| Devo aggiornare file .md | Documentation |
| Devo valutare permessi | Security |
| Devo personalizzare per cliente | Client Context |
| Devo lavorare su Walbox | Walbox Specialist |

---

## Livelli di autonomia

### Livello 0 — Read-only

Agente può solo analizzare.

Usare per:

- QA;
- research;
- planning;
- sicurezza;
- bug complesso prima di patch.

### Livello 1 — Patch minima

Agente può modificare un file specifico.

Usare per:

- micro UI;
- testo;
- componenti piccoli.

### Livello 2 — Multi-file controllato

Agente può modificare più file dopo piano approvato.

Usare per:

- feature media;
- API service;
- routing piccolo.

### Livello 3 — Autonomia alta

Agente lavora su task lungo con verifiche e checkpoint.

Usare solo quando:

- repo pulito;
- test esistono;
- rollback chiaro;
- task ben definito;
- niente dati sensibili;
- budget token accettato.

### Regola

> Per Walbox ora usare soprattutto Livello 0 e Livello 1. Livello 2 solo con piano. Livello 3 non ancora.

---

## Sub-agent definition template

Template generico per creare un sub-agent:

```md
---
name: frontend-agent
description: Use for React/Vite UI edits, mobile responsive fixes, CSS, layout and small visual improvements.
tools: Read, Edit, Bash
---

# Role
You are a Frontend Agent focused on safe UI edits.

# Responsibilities
- Modify only requested UI files.
- Preserve logic.
- Keep responsive behavior.
- Avoid backend/API changes.

# Do
- Read relevant file.
- Apply minimal patch.
- Summarize changes.
- Provide test steps.

# Do Not
- Touch backend.
- Change routing.
- Add dependencies.
- Modify env variables.
- Refactor unrelated code.

# Output
- Files changed.
- What changed.
- How to test.
- Risks.
```

Nota: sintassi e tool effettivi vanno adattati all’ambiente reale Claude Code/Antigravity. Questo template è concettuale-operativo per la tua Factory.

---

## Dynamic sub-agents via CLI

La CLI Claude Code permette anche di definire sub-agents dinamicamente tramite JSON.

Uso concettuale:

```text
claude --agents '{"reviewer":{"description":"Reviews code","prompt":"You are a code reviewer"}}'
```

### Regola pratica

Per te, non partire dalla CLI dinamica.

Prima crea file `.md` chiari con i ruoli.  
Quando il metodo è stabile, trasformi i ruoli in sub-agents reali.

---

## Agenti per AI Business Factory v1

Per la v1, crea questi file agente:

```text
AGENTS/
├── STRATEGIST_AGENT.md
├── RESEARCH_AGENT.md
├── PRODUCT_MANAGER_AGENT.md
├── FRONTEND_AGENT.md
├── BACKEND_AGENT.md
├── QA_AGENT.md
├── SALES_PITCH_AGENT.md
├── TOKEN_SAVER_AGENT.md
├── DOCUMENTATION_AGENT.md
├── SECURITY_AGENT.md
├── CLIENT_CONTEXT_AGENT.md
└── WALBOX_SPECIALIST_AGENT.md
```

Non serve implementarli subito come sub-agents reali.  
Puoi usarli come prompt/ruoli manuali.

---

## Sistema minimo per partire

Se vuoi partire leggero, bastano 5 agenti:

```text
1. Strategist Agent
2. Frontend Agent
3. QA Agent
4. Token Saver Agent
5. Documentation Agent
```

Per Walbox oggi questi sono i più utili.

Poi aggiungi:

```text
Research Agent
Sales Agent
Backend Agent
Walbox Specialist
```

---

## Workflow completo esempio: nuova feature Walbox

Idea:

```text
Aggiungere schermata Profilo Walrus Coming Soon.
```

### Step 1 — Strategist Agent

Output:

```text
È utile per demo. Non costruire auth vera. Usare dati finti.
```

### Step 2 — Product Manager Agent

Output:

```text
Task:
creare nuova schermata statica ProfileComingSoon.jsx con nickname, punti, badge, promo finta.
```

### Step 3 — Token Saver Agent

Output:

```text
Task medio-semplice. Modello medio/Fast High. Un file + routing solo se già previsto. No backend.
```

### Step 4 — Frontend Agent

Output:

```text
Crea componente UI. Non tocca Supabase/Spotify.
```

### Step 5 — QA Agent

Output:

```text
Controlla mobile, routing, build, no regressioni.
```

### Step 6 — Documentation Agent

Output:

```text
Checkpoint: schermata demo profilo creata.
```

### Step 7 — Sales Agent

Output:

```text
Pitch: “questa è la preview di loyalty futura, senza account obbligatorio”.
```

---

## Workflow completo esempio: altro locale

Idea:

```text
Creare versione Walbox per altro bar.
```

### Strategist Agent

Decide:

- non rifare app;
- creare demo personalizzata;
- cambiare brand;
- mantenere core;
- vendere serata test;
- non promettere multi-tenant subito.

### Client Context Agent

Crea:

- target;
- tono locale;
- obiezioni;
- feature da mostrare;
- prezzo ipotetico;
- follow-up.

### Product Manager Agent

Crea:

- task brand UI;
- task testi;
- task TV screen;
- task dashboard copy;
- task demo flow.

### Frontend Agent

Modifica solo layer visuale/testi.

### Backend Agent

Solo se serve database separato o env diverse.

### QA Agent

Testa flusso.

### Sales Agent

Crea proposta.

### Documentation Agent

Checkpoint nuovo cliente.

---

## Errori comuni con agenti

### Errore 1 — Agente unico per tutto

```text
Fai ricerca, codice, pitch, pricing e test.
```

Soluzione:

```text
Dividi in ruoli.
```

### Errore 2 — Troppi agenti troppo presto

```text
Creo 12 agenti prima di avere un workflow.
```

Soluzione:

```text
Inizia con 3–5 agenti manuali.
```

### Errore 3 — Agenti paralleli sullo stesso file

Soluzione:

```text
Un owner per file/modifica.
```

### Errore 4 — Nessun QA Agent

Soluzione:

```text
Ogni patch importante passa da QA read-only.
```

### Errore 5 — Nessun Documentation Agent

Soluzione:

```text
Ogni step stabile crea checkpoint.
```

### Errore 6 — Sales Agent troppo presto

Soluzione:

```text
Prima demo minima, poi pitch serio.
```

### Errore 7 — Backend Agent per task UI

Soluzione:

```text
Frontend UI = niente backend.
```

---

## Regole anti-token per agenti

1. Non attivare agenti non necessari.
2. Non far leggere a ogni agente tutto il progetto.
3. Usa contesto specifico per ruolo.
4. Research Agent restituisce sintesi, non dump.
5. QA Agent lavora su diff/piano, non su tutto.
6. Documentation Agent comprime, non allunga.
7. Token Saver Agent prima dei task costosi.
8. Un task = un agente owner.
9. Parallelizza solo se output separati.
10. Se il task è micro, niente agent team.

---

## Regole di output per tutti gli agenti

Ogni agente deve rispondere in modo strutturato:

```md
## Ruolo
[agent]

## Cosa ho capito
...

## Output
...

## Rischi
...

## Prossimo step
...
```

Per agenti tecnici:

```md
## File coinvolti
...

## Cosa non toccare
...

## Test
...
```

Per agenti business:

```md
## Valore
...

## Target
...

## Obiezioni
...

## CTA
...
```

---

## Prompt master: scegliere l’agente

```text
Agisci come AI Business Factory Router.

Dato questo task:
[task]

Dimmi:
1. quale agente deve occuparsene;
2. se serve più di un agente;
3. ordine corretto;
4. livello autonomia;
5. modello/modalità consigliata;
6. contesto minimo;
7. prompt finale per l’agente scelto.
```

---

## Prompt master: team agentico per progetto

```text
Progetta una squadra agentica per questo progetto:

[descrizione progetto]

Output:
1. agenti necessari;
2. responsabilità di ognuno;
3. cosa NON devono fare;
4. ordine di lavoro;
5. dove possono lavorare in parallelo;
6. dove serve lavoro seriale;
7. rischi;
8. checkpoint.
```

---

## Prompt master: review del team agentico

```text
Fai review di questo sistema di agenti.

Controlla:
- ruoli sovrapposti;
- agenti inutili;
- rischio conflitti;
- rischio token;
- assenza QA;
- assenza documentazione;
- assenza sicurezza;
- task che dovrebbero restare umani.

Output:
- cosa tenere;
- cosa eliminare;
- cosa unire;
- cosa separare;
- versione migliorata.
```

---

## Decisione operativa per te

Per ora non serve creare subito sub-agents reali in Claude Code.

Prima fase:

```text
Usare questi agenti come ruoli/prompt manuali.
```

Seconda fase:

```text
Trasformare i ruoli più usati in file sub-agent reali.
```

Terza fase:

```text
Aggiungere skills e hooks.
```

Quarta fase:

```text
Automatizzare parti ripetibili con Agent SDK/MCP.
```

---

## File generati da questo documento

Questo file porta alla creazione futura di:

```text
AGENTS/STRATEGIST_AGENT.md
AGENTS/RESEARCH_AGENT.md
AGENTS/PRODUCT_MANAGER_AGENT.md
AGENTS/FRONTEND_AGENT.md
AGENTS/BACKEND_AGENT.md
AGENTS/QA_AGENT.md
AGENTS/SALES_PITCH_AGENT.md
AGENTS/TOKEN_SAVER_AGENT.md
AGENTS/DOCUMENTATION_AGENT.md
AGENTS/SECURITY_AGENT.md
AGENTS/CLIENT_CONTEXT_AGENT.md
AGENTS/WALBOX_SPECIALIST_AGENT.md
```

E più avanti:

```text
.claude/agents/frontend-agent.md
.claude/agents/qa-agent.md
.claude/agents/research-agent.md
.claude/agents/token-saver-agent.md
```

---

## Completezza stimata

Completezza attuale: 88%

### Coperto bene

- concetto sub-agents;
- quando usarli;
- quando evitarli;
- ruoli principali;
- confini per agente;
- prompt template per ogni agente;
- parallelizzazione sicura;
- autonomia livelli 0–3;
- applicazione Walbox;
- agent routing;
- token saving;
- differenza agente/skill/workflow;
- roadmap verso sub-agents reali.

### Da approfondire nei file dedicati

- sintassi effettiva sub-agent Claude Code;
- esempi completi `.claude/agents/*.md`;
- tool access reale per ogni agente;
- permissions;
- invocation control;
- subagent execution con skills;
- dynamic agents via CLI;
- Agent SDK per orchestrazione vera;
- multi-agent cost modeling;
- agent evaluation/benchmark;
- integrazione con Antigravity Agent Manager.

---

## Prossimo file consigliato

```text
06_SKILLS_SYSTEM.md
```

Perché dopo aver definito “chi fa cosa”, serve definire “come si impacchettano le competenze riutilizzabili”: skill frontend, pitch, token saver, QA, documentation e Walbox-dev.

<!-- END_SOURCE_FILE: 05_AGENT_ROLES_AND_SUBAGENTS.md -->


<!-- BEGIN_SOURCE_FILE: 06_SKILLS_SYSTEM.md -->
<!-- SOURCE_SHA256_UTF8: 0bc576fdbadae69ea2399b20b73ea9d9bdd081f80b4de100a737fba25224ac5d -->
<!-- SOURCE_CHAR_COUNT: 32596 -->

# 06_SKILLS_SYSTEM.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Agents & Skills  
Completezza stimata: 87%

---

## Scopo del file

Questo file spiega come usare le **Skills** nella tua AI Business Factory.

L’obiettivo è trasformare competenze ripetibili in pacchetti riutilizzabili, così da non dover riscrivere ogni volta:

- come fare una modifica UI sicura;
- come creare un pitch;
- come fare QA;
- come comprimere contesto;
- come risparmiare token;
- come lavorare su Walbox;
- come analizzare un’idea business;
- come creare checkpoint;
- come usare fonti ufficiali;
- come evitare scope creep.

La regola centrale:

> Una skill è una competenza operativa riutilizzabile, non un’enciclopedia.

---

## Fonti ufficiali usate

Fonti primarie:

1. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

2. Anthropic Courses / Introduction to agent skills  
   https://docs.anthropic.com/en/docs/resources/courses

3. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

4. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

5. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

6. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

7. Prompting Best Practices  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting

8. Define Tools / Tool Use best practices  
   https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use

9. Tool Use with Claude  
   https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview

10. Writing Effective Tools for Agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

11. Equipping Agents for the Real World with Agent Skills  
    https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

12. Building Agents with the Claude Agent SDK  
    https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

13. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

14. Claude Code Hooks Guide  
    https://docs.anthropic.com/en/docs/claude-code/hooks-guide

15. Define Success Criteria and Build Evaluations  
    https://docs.anthropic.com/en/docs/build-with-claude/develop-tests

---

## Sintesi brutale

Le skills servono a insegnare a Claude “come fare bene un certo tipo di lavoro”.

Non sono la stessa cosa di un agente.

- Agente = chi fa il lavoro.
- Skill = come si fa quel tipo di lavoro.
- Workflow = in che ordine si fa.
- Memory = cosa deve ricordare del progetto.
- Tool = cosa può usare.

Esempio:

```text
Task:
Migliora bottone mobile di CustomerJukeboxOldOrange.

Agente:
Frontend Agent

Skill:
frontend-safe-edit

Workflow:
safe-ui-edit

Memory:
Walbox CLAUDE.md

Tool:
Read/Edit/Bash, se disponibili
```

---

## Perché servono le skills

Senza skills:

```text
Ogni volta riscrivi tutto:
non toccare backend, non fare refactor, controlla mobile, patch minima...
```

Con skills:

```text
Usa skill frontend-safe-edit.
```

La skill contiene già:

- regole;
- vincoli;
- output atteso;
- checklist;
- esempi;
- errori da evitare.

### Vantaggio

- meno token;
- meno ripetizione;
- meno errori;
- output più uniforme;
- agenti più specializzati;
- workflow riutilizzabile;
- onboarding più veloce per nuovi progetti.

---

## Quando creare una skill

Crea una skill quando un’attività è:

- ripetibile;
- frequente;
- abbastanza specifica;
- utile in più progetti;
- rischiosa se spiegata male;
- standardizzabile;
- collegata a un output chiaro.

### Segnale pratico

> Se hai scritto lo stesso tipo di prompt 3 volte, forse serve una skill.

### Esempi di skill utili

- `frontend-safe-edit`
- `walbox-dev`
- `qa-review`
- `token-saver`
- `pitch-builder`
- `business-validator`
- `documentation-compressor`
- `checkpoint-writer`
- `official-source-digester`
- `project-context-builder`
- `safe-backend-change`
- `client-proposal-builder`

---

## Quando NON creare una skill

Non creare una skill per:

- un task unico;
- un’idea ancora confusa;
- un workflow non testato;
- una procedura che cambia ogni volta;
- un concetto troppo generico;
- un documento enorme;
- una cosa che basta scrivere in un prompt;
- una competenza che non userai più.

### Esempio cattivo

```text
skill: make-everything-better
```

Troppo vaga.

### Esempio buono

```text
skill: frontend-safe-edit
```

Chiara, ripetibile, con confini.

---

## Differenza tra skill e prompt

### Prompt

Istruzione temporanea per un task specifico.

Esempio:

```text
Modifica solo LiveTvScreen.jsx e aumenta leggibilità box IN CODA.
```

### Skill

Istruzione riutilizzabile per una classe di task.

Esempio:

```text
frontend-safe-edit:
quando fai modifiche UI, non toccare backend, non refactorare, patch minima, test mobile.
```

### Regola

> Prompt = richiesta di oggi.  
> Skill = metodo riutilizzabile.

---

## Differenza tra skill e agente

### Agente

Ha ruolo/persona operativa.

Esempio:

```text
Frontend Agent
```

### Skill

Ha procedura/competenza.

Esempio:

```text
frontend-safe-edit
```

### Combinazione

```text
Frontend Agent + frontend-safe-edit = modifica UI sicura.
```

Altro esempio:

```text
Sales Agent + pitch-builder = proposta commerciale.
```

---

## Differenza tra skill e memory

### Memory / `CLAUDE.md`

Dice:

```text
Che progetto è questo? Dove siamo arrivati? Cosa non va toccato?
```

### Skill

Dice:

```text
Come si fa questo tipo di lavoro?
```

Esempio:

`CLAUDE.md` Walbox:

```text
Walbox usa React/Vite/Supabase/Spotify. Non toccare App.jsx senza motivo.
```

Skill `frontend-safe-edit`:

```text
Per modifiche UI, preserva logica, modifica un file, testa mobile.
```

### Regola

> Memory è contesto del progetto. Skill è metodo di lavoro.

---

## Differenza tra skill e workflow

### Skill

Competenza riutilizzabile.

### Workflow

Sequenza di passi.

Esempio:

Skill:

```text
frontend-safe-edit
```

Workflow:

```text
git status → leggere file → patch minima → npm run build → git diff → checkpoint
```

### Regola

> Skill spiega come ragionare. Workflow spiega in che ordine agire.

---

## Struttura ideale di una skill

Una skill buona dovrebbe avere:

```md
# Skill: nome-skill

## Purpose
A cosa serve.

## Use when
Quando usarla.

## Do not use when
Quando non usarla.

## Inputs required
Cosa serve prima di partire.

## Rules
Regole operative.

## Do
Cosa fare.

## Do not
Cosa evitare.

## Workflow
Passi consigliati.

## Output format
Formato risposta.

## Examples
Esempi buoni/cattivi.

## Checklist
Controlli finali.

## Related agents
Agenti collegati.

## Related files
File/template collegati.
```

---

## Skill minima

Non tutte le skill devono essere lunghe.

Versione minima:

```md
# Skill: frontend-safe-edit

## Use when
Small React/Vite UI edits.

## Rules
- Edit only requested file.
- Preserve logic.
- Do not touch backend/API/routing.
- No refactor.
- No new dependencies.

## Output
- Files changed.
- What changed.
- How to test.
- Risks.
```

### Regola

> Meglio una skill corta usata spesso che una skill enorme ignorata.

---

## Naming delle skill

Usa nomi brevi, chiari, con trattini.

### Buoni nomi

```text
frontend-safe-edit
walbox-dev
token-saver
qa-review
pitch-builder
business-validator
checkpoint-writer
official-source-digester
context-compressor
safe-backend-change
client-context-builder
```

### Cattivi nomi

```text
ai-helper
super-agent
best-skill
make-app-better
general-workflow
do-everything
```

### Regola

> Dal nome della skill devo capire quando usarla.

---

## Skill 1 — frontend-safe-edit

### Scopo

Fare modifiche UI/React/CSS sicure senza rompere logica, API, routing o backend.

### Use when

- testo UI;
- spacing;
- responsive;
- layout;
- card;
- bottoni;
- badge;
- palette;
- microinterazioni leggere;
- componenti React visivi.

### Do not use when

- API;
- Supabase;
- Spotify;
- routing;
- auth;
- database;
- schema;
- multi-file refactor;
- feature grande.

### Regole

```text
- Modifica solo file richiesti.
- Non cambiare state/useEffect/funzioni submit se non richiesto.
- Non toccare backend/API.
- Non aggiungere dipendenze.
- Non fare refactor.
- Mantieni brand e palette.
- Output con test manuale.
```

### Prompt d’uso

```text
Usa skill frontend-safe-edit.

Modifica solo:
[file]

Obiettivo:
[obiettivo UI]

Vincoli:
- non toccare logica dati;
- non toccare API;
- non toccare routing;
- non aggiungere dipendenze.

Output:
piano breve, patch minima, test.
```

### Applicazione Walbox

```text
Modifica solo CustomerJukeboxOldOrange.jsx.
Rendi più leggibile il blocco ricerca su mobile.
Non toccare searchTrack, createSongRequest, selectedSong o Supabase.
```

---

## Skill 2 — walbox-dev

### Scopo

Guidare agenti che lavorano sul progetto Walbox proteggendo stato stabile, stack e file critici.

### Use when

- qualunque task Walbox;
- prompt Antigravity;
- controllo file;
- modifica UI;
- roadmap;
- QA;
- demo;
- checkpoint.

### Regole core

```text
Walbox è una demo social experience per locali.
Stack: React/Vite, Supabase Realtime, Spotify API, Vercel.
Proteggi sempre queue, dashboard, Spotify e Live TV.
```

### Do

- chiedere file target;
- proteggere App.jsx;
- proteggere walboxDb.js;
- proteggere spotifyApi.js;
- proteggere ManagerDashboard se stabile;
- fare patch minime;
- mantenere demo funzionante;
- separare MVP da roadmap.

### Do not

- rifare app da zero;
- toccare Supabase durante UI polish;
- cambiare Spotify auth senza piano;
- eliminare varianti già create;
- promettere multi-tenant definitivo;
- cambiare routing senza conferma.

### Prompt d’uso

```text
Usa skill walbox-dev.

Task:
[task]

Prima dimmi:
1. è MVP o roadmap?
2. file coinvolti;
3. cosa non toccare;
4. prompt sicuro per agente tecnico;
5. test.
```

---

## Skill 3 — qa-review

### Scopo

Controllare modifiche, piani o patch prima di accettarle.

### Use when

- prima di commit;
- prima di deploy;
- dopo patch;
- dopo task multi-file;
- dopo modifica API;
- prima di demo;
- quando un agente ha toccato più del previsto.

### Regole

```text
- Modalità read-only.
- Non modificare file.
- Cerca regressioni.
- Controlla scope.
- Controlla file non richiesti.
- Segnala rischi.
- Suggerisci test.
```

### Output

```md
## Verdict
safe / attenzione / bloccare

## Scope check
...

## Risks
...

## Required tests
...

## Suggested minimal fixes
...
```

### Prompt d’uso

```text
Usa skill qa-review.
Modalità read-only.

Controlla questa modifica/piano:
[diff/piano]

Verifica:
- scope;
- file toccati;
- rischi;
- regressioni;
- test;
- se va accettata.
```

---

## Skill 4 — token-saver

### Scopo

Ridurre consumo di token/crediti scegliendo contesto, modello e modalità giusta.

### Use when

- prima di task complesso;
- prima di deep dive;
- prima di multi-agent;
- prima di allegare screenshot;
- prima di usare modello forte;
- prima di creare file grande;
- quando non sai se usare Fast/Planning/High.

### Regole

```text
- Classifica task.
- Riduci contesto.
- Evita screenshot inutili.
- Suggerisci modello/modalità.
- Spezza task troppo grandi.
- Crea prompt ottimizzato.
```

### Classificazione

```text
micro → testo/spacing
semplice → un componente
medio → logica leggera
complesso → API/database/multi-file
critico → architettura/produzione/sicurezza
```

### Prompt d’uso

```text
Usa skill token-saver.

Task:
[task]

Output:
1. livello;
2. modello/modalità consigliata;
3. contesto minimo;
4. cosa evitare;
5. prompt ottimizzato.
```

---

## Skill 5 — pitch-builder

### Scopo

Trasformare prodotto/demo in comunicazione commerciale.

### Use when

- messaggio WhatsApp;
- proposta locale;
- one-page;
- pitch demo;
- follow-up;
- risposta obiezioni;
- pricing iniziale.

### Regole

```text
- Parla valore, non tecnologia.
- Evita gergo AI.
- Non promettere feature non pronte.
- Collega sempre al problema cliente.
- Usa linguaggio semplice.
- CTA chiara.
```

### Prompt d’uso

```text
Usa skill pitch-builder.

Prodotto:
[descrizione]

Cliente:
[cliente]

Obiettivo:
[demo / follow-up / vendita]

Output:
- pitch 3 righe;
- messaggio WhatsApp;
- obiezioni e risposte;
- proposta valore;
- CTA.
```

### Esempio Walbox

```text
Walbox non è “un jukebox”.
È una social experience: il cliente partecipa, la TV crea atmosfera e il social media manager riceve contenuti vivi.
```

---

## Skill 6 — business-validator

### Scopo

Capire se un’idea può diventare MVP/business o se è solo una cosa interessante.

### Use when

- nuova idea;
- altro locale;
- nuovo verticale;
- feature futura;
- decisione se costruire;
- pricing;
- priorità.

### Regole

```text
- Problema reale prima della feature.
- Cliente prima della tecnologia.
- Demo prima del prodotto completo.
- Prezzo solo dopo valore percepito.
- Evita MVP gonfiati.
```

### Output

```md
## Problema
...

## Target
...

## Valore
...

## MVP minimo
...

## Cosa non fare ora
...

## Rischi
...

## Prossimo test
...
```

### Prompt

```text
Usa skill business-validator.

Idea:
[idea]

Valuta:
1. problema reale;
2. target;
3. valore;
4. MVP minimo;
5. cosa evitare;
6. come testarla;
7. prezzo ipotetico se sensato.
```

---

## Skill 7 — documentation-compressor

### Scopo

Trasformare materiale grezzo in documentazione utile e compatta.

### Use when

- chat lunga;
- video;
- screenshot;
- documentazione;
- output agente;
- meeting notes;
- errore risolto;
- nuova fonte ufficiale;
- checkpoint.

### Regole

```text
- Estrarre decisioni.
- Estrarre regole.
- Rimuovere rumore.
- Separare attivo da archivio.
- Creare prossimo step singolo.
- Non copiare tutto.
```

### Prompt

```text
Usa skill documentation-compressor.

Materiale:
[materiale]

Output:
1. decisioni;
2. regole operative;
3. template/prompt;
4. cosa mettere in memoria attiva;
5. cosa archiviare;
6. prossimo step.
```

---

## Skill 8 — checkpoint-writer

### Scopo

Creare checkpoint operativi dopo step importanti.

### Use when

- deploy riuscito;
- bugfix;
- feature finita;
- demo;
- cambio architettura;
- fine sessione;
- prima di aprire nuova chat.

### Template

```md
# CHECKPOINT — [Project]

## Date
YYYY-MM-DD

## Goal completed

## Stable state

## Files changed

## Tests done

## What works

## Do not touch

## Open issues

## Decisions

## Next step

## Restart prompt
```

### Prompt

```text
Usa skill checkpoint-writer.

Crea checkpoint da questo materiale:
[materiale]

Mantieni:
- stato stabile;
- file modificati;
- cosa funziona;
- cosa non toccare;
- prossimo step singolo.
```

---

## Skill 9 — official-source-digester

### Scopo

Trasformare fonti ufficiali in regole operative.

### Use when

- documentazione Claude;
- docs Antigravity;
- Supabase;
- Vercel;
- GitHub;
- API esterne;
- pricing docs;
- security docs.

### Regole

```text
- Preferire fonti ufficiali.
- Citare link.
- Non copiare tutto.
- Estrarre cosa serve.
- Tradurre in regole pratiche.
- Creare file collegato.
```

### Output

```md
## Fonte
...

## Cosa spiega
...

## Perché serve a noi
...

## Regole operative estratte
...

## Template/prompt derivati
...

## File da aggiornare
...
```

### Prompt

```text
Usa skill official-source-digester.

Fonte:
[link/testo]

Output:
1. cosa spiega;
2. utilità per AI Business Factory;
3. regole pratiche;
4. cosa ignorare;
5. file .md da creare/aggiornare.
```

---

## Skill 10 — project-context-builder

### Scopo

Creare `PROJECT_CONTEXT.md` e `CLAUDE.md` per un progetto nuovo.

### Use when

- nuovo cliente;
- nuova app;
- nuova demo;
- clone Walbox;
- nuovo verticale;
- inizio MVP.

### Regole

```text
- Distinguere contesto progetto da memoria agente.
- Non inserire roadmap infinita.
- Definire file critici.
- Definire stato corrente.
- Definire prossimo step.
```

### Prompt

```text
Usa skill project-context-builder.

Progetto:
[descrizione]

Crea:
1. PROJECT_CONTEXT.md
2. CLAUDE.md
3. lista file critici
4. safe workflow
5. prossimo step singolo
```

---

## Skill 11 — safe-backend-change

### Scopo

Gestire modifiche su API, database, env, auth e servizi esterni senza rompere produzione/demo.

### Use when

- Supabase;
- Spotify;
- Vercel API;
- database schema;
- env variables;
- auth;
- webhooks;
- payments;
- serverless functions.

### Regole

```text
- Prima analisi read-only.
- Nessuna modifica schema senza piano.
- Nessun segreto in chiaro.
- File coinvolti chiari.
- Rollback.
- Test.
- Non mischiare UI redesign.
```

### Prompt

```text
Usa skill safe-backend-change.

Task:
[task]

Prima non modificare file.
Output:
1. flusso dati;
2. file coinvolti;
3. rischio;
4. patch minima;
5. test;
6. rollback.
```

---

## Skill 12 — client-proposal-builder

### Scopo

Creare proposta personalizzata per cliente/locale.

### Use when

- dopo incontro;
- prima di WhatsApp;
- prima di demo;
- preventivo;
- follow-up;
- obiezioni.

### Regole

```text
- Usare linguaggio cliente.
- Evitare tecnicismi.
- Collegare feature a problema.
- Proporre demo semplice.
- Non vendere prodotto enorme subito.
- Separare setup da canone.
```

### Prompt

```text
Usa skill client-proposal-builder.

Cliente:
[appunti]

Prodotto:
[descrizione]

Output:
1. cosa gli interessa;
2. proposta semplice;
3. messaggio WhatsApp;
4. pacchetti/prezzo;
5. obiezioni e risposte;
6. prossima azione.
```

---

## Skill 13 — walbox-clone-adapter

### Scopo

Adattare Walbox a un altro locale senza riscrivere il core.

### Use when

- nuovo bar;
- nuova demo locale;
- clone brandizzato;
- evento;
- pub/ristorante;
- serata test.

### Regole

```text
- Riusare core tecnico.
- Separare brand/copy da logica.
- Non toccare Supabase/Spotify core se non necessario.
- Creare demo verticale.
- Personalizzare palette, testi, mood, TV.
- Evitare multi-tenant subito.
```

### Prompt

```text
Usa skill walbox-clone-adapter.

Nuovo locale:
[info]

Obiettivo:
demo personalizzata.

Output:
1. cosa riusare da Walbox;
2. cosa personalizzare;
3. cosa non toccare;
4. file probabili;
5. roadmap demo;
6. pitch.
```

---

## Skill 14 — demo-builder

### Scopo

Costruire una demo mostrabile, non un prodotto definitivo.

### Use when

- prima di incontro;
- MVP;
- presentazione;
- pitch;
- prototipo;
- proof of concept.

### Regole

```text
- Valore visibile prima di robustezza totale.
- Dati finti ok se dichiarati internamente.
- Stabilità > feature.
- Mobile/TV devono funzionare.
- Storytelling chiaro.
- Niente feature non mostrabili.
```

### Prompt

```text
Usa skill demo-builder.

Prodotto:
[descrizione]

Obiettivo demo:
[cliente/evento]

Output:
1. flusso demo;
2. schermate chiave;
3. cosa deve funzionare;
4. cosa può essere finto;
5. rischi;
6. script presentazione.
```

---

## Skill 15 — prompt-optimizer

### Scopo

Trasformare una richiesta confusa in un prompt pulito per agente/tool.

### Use when

- prima di Antigravity;
- prima di Claude Code;
- prima di Research Agent;
- prima di QA;
- quando il task è lungo;
- quando vuoi ridurre token.

### Regole

```text
- Ruolo chiaro.
- Task chiaro.
- Contesto minimo.
- Vincoli.
- Output atteso.
- Stop conditions.
```

### Prompt

```text
Usa skill prompt-optimizer.

Richiesta grezza:
[richiesta]

Output:
1. prompt finale;
2. ruolo corretto;
3. contesto minimo;
4. vincoli;
5. cosa evitare;
6. modello/modalità consigliata.
```

---

## Come organizzare le skills in cartella

Struttura consigliata:

```text
AI_BUSINESS_FACTORY/
└── SKILLS/
    ├── frontend-safe-edit/
    │   └── SKILL.md
    ├── walbox-dev/
    │   └── SKILL.md
    ├── qa-review/
    │   └── SKILL.md
    ├── token-saver/
    │   └── SKILL.md
    ├── pitch-builder/
    │   └── SKILL.md
    ├── business-validator/
    │   └── SKILL.md
    ├── documentation-compressor/
    │   └── SKILL.md
    ├── checkpoint-writer/
    │   └── SKILL.md
    ├── official-source-digester/
    │   └── SKILL.md
    ├── project-context-builder/
    │   └── SKILL.md
    └── safe-backend-change/
        └── SKILL.md
```

Per Antigravity/Walbox:

```text
walrus-social-jukebox/
└── .agents/
    └── skills/
        └── walbox-dev/
            ├── SKILL.md
            ├── references/
            └── examples/
```

---

## Priorità skills per te

### Da creare subito

```text
1. walbox-dev
2. frontend-safe-edit
3. token-saver
4. qa-review
5. documentation-compressor
6. checkpoint-writer
```

### Subito dopo

```text
7. pitch-builder
8. business-validator
9. official-source-digester
10. project-context-builder
```

### Più avanti

```text
11. safe-backend-change
12. client-proposal-builder
13. walbox-clone-adapter
14. demo-builder
15. prompt-optimizer
```

---

## Skill lifecycle

Una skill passa da 5 fasi.

### 1. Prompt ripetuto

Ti accorgi che scrivi sempre la stessa richiesta.

### 2. Regola

Trasformi il prompt in regole.

### 3. Skill v1

Crei un file `SKILL.md`.

### 4. Test reale

La usi in 2–3 task.

### 5. Refinement

Aggiungi errori, esempi e vincoli.

### Regola

> Una skill nasce da un problema reale, non da teoria.

---

## Skill quality checklist

```text
[ ] Il nome è chiaro?
[ ] Dice quando usarla?
[ ] Dice quando NON usarla?
[ ] Ha input richiesti?
[ ] Ha regole pratiche?
[ ] Ha Do / Do not?
[ ] Ha output format?
[ ] Ha esempi?
[ ] È abbastanza corta?
[ ] Evita teoria inutile?
[ ] Riduce token?
[ ] Riduce rischio?
[ ] È testabile?
```

---

## Errori comuni nella creazione skill

### 1. Skill troppo generica

```text
ai-business-helper
```

Problema: non si sa quando usarla.

### 2. Skill troppo lunga

Se contiene tutto, il modello non sa cosa conta.

### 3. Skill senza “do not”

L’agente capisce cosa fare, ma non cosa evitare.

### 4. Skill senza output format

Risposte imprevedibili.

### 5. Skill non testata

Scritta bene ma mai usata.

### 6. Skill duplicata

Due skill fanno la stessa cosa.

### 7. Skill che dovrebbe essere memoria

Esempio: “Walbox usa Supabase” è memory, non skill.

### 8. Skill che dovrebbe essere workflow

Esempio: “git status → build → commit” è workflow, non skill pura.

---

## Come una skill riduce token

Skill utile:

```text
Usa frontend-safe-edit su LiveTvScreen.jsx...
```

Invece di ripetere ogni volta:

```text
Non toccare backend, non toccare API, non fare refactor, patch minima...
```

La skill riduce:

- istruzioni ripetute;
- errori;
- chiarimenti;
- retry;
- file letti inutilmente;
- output troppo lunghi.

### Regola

> Skill buona = prompt più corto + comportamento più stabile.

---

## Skills e sub-agents

La documentazione sub-agents indica che le skills possono essere pre-caricate nei sub-agents, così l’agente parte già con competenze specifiche.

Tradotto:

```text
Frontend Agent + frontend-safe-edit
Backend Agent + safe-backend-change
Sales Agent + pitch-builder
QA Agent + qa-review
Walbox Specialist + walbox-dev
```

### Esempio concettuale

```md
---
name: frontend-agent
description: React/Vite UI safe edits
skills:
  - frontend-safe-edit
  - token-saver
---

You are a Frontend Agent. Apply safe UI edits only.
```

### Regola

> Agente senza skill = ruolo generico.  
> Agente con skill = ruolo + metodo.

---

## Skills e hooks

Le skills guidano.  
Gli hooks possono automatizzare o bloccare.

Esempio:

Skill `frontend-safe-edit` dice:

```text
Non modificare backend.
```

Hook futuro può bloccare:

```text
Se safe-ui-edit e file modificato contiene src/services/, blocca e chiedi conferma.
```

### Regola

> Skill = comportamento desiderato.  
> Hook = controllo automatico.

---

## Skills e evaluations

Le fonti Anthropic sulle evaluation dicono di definire criteri di successo misurabili.

Per le skill, questo significa:

```text
Una skill deve poter essere valutata.
```

Esempio `frontend-safe-edit`:

Successo se:

- ha modificato solo file richiesto;
- non ha toccato logica;
- non ha aggiunto dipendenze;
- ha fornito test;
- build passa.

Fallimento se:

- ha toccato API;
- ha cambiato routing;
- ha fatto refactor non richiesto;
- non ha spiegato test.

---

## Skill scorecard

Per valutare una skill dopo uso reale:

```md
# Skill Scorecard

## Skill
[nome]

## Task
[task]

## Ha rispettato scope?
Sì/No

## Ha ridotto token?
Sì/No

## Ha evitato errori?
Sì/No

## Output utile?
Sì/No

## Cosa migliorare
...

## Nuova regola da aggiungere
...
```

---

## Esempio completo: `frontend-safe-edit/SKILL.md`

```md
# Skill: frontend-safe-edit

## Purpose
Apply small, safe UI changes in React/Vite projects without touching backend, routing or business logic.

## Use when
- UI text
- spacing
- layout
- responsive fixes
- button/card styling
- visual polish
- small component changes

## Do not use when
- API/database/auth changes
- routing changes
- state architecture changes
- multi-file refactor
- new dependencies
- backend logic

## Inputs required
- target file
- UI goal
- constraints
- verification method

## Rules
- edit only requested files
- preserve state and handlers
- no refactor
- no dependencies
- no backend/API/routing
- keep brand palette
- output test steps

## Workflow
1. Read target file.
2. Identify minimal patch.
3. Apply UI-only change.
4. Summarize diff.
5. Provide manual test.

## Output format
- Files changed
- What changed
- What was not touched
- How to test
- Risks

## Bad task
“Make the app better.”

## Good task
“Modify only LiveTvScreen.jsx to make the queue box more readable on TV. Do not touch data logic.”
```

---

## Esempio completo: `token-saver/SKILL.md`

```md
# Skill: token-saver

## Purpose
Reduce unnecessary token and credit usage by choosing the smallest effective model, context and workflow.

## Use when
- before deep research
- before coding
- before using high model
- before screenshots
- before multi-agent work
- before long context tasks

## Rules
- classify task complexity
- use read-only first for uncertain tasks
- avoid screenshots unless visual issue
- avoid loading whole project
- use templates
- split large tasks
- choose cheap/fast model when possible

## Output format
1. Task level
2. Model/mode
3. Context required
4. Context to avoid
5. Optimized prompt
6. Risk
```

---

## Esempio completo: `walbox-dev/SKILL.md`

```md
# Skill: walbox-dev

## Purpose
Work safely on Walbox / Walrus Social Jukebox.

## Project facts
- React/Vite app
- Supabase Realtime queue
- Spotify API/search/playback
- Vercel deploy
- Customer QR flow
- Manager Dashboard
- Live TV screen

## Critical files
- src/App.jsx
- src/services/walboxDb.js
- src/services/spotifyApi.js
- api/search.js
- vercel.json
- env variables
- Supabase schema
- Spotify auth flow

## Rules
- protect demo stability
- one change at a time
- no refactor unless asked
- UI polish must not touch backend
- keep Walrus brand palette
- preserve already approved screens
- checkpoint after working step

## Output
- MVP or roadmap?
- Files involved
- Do not touch
- Prompt for coding agent
- Test steps
- Checkpoint update
```

---

## Applicazione pratica: come usare una skill in prompt

### Prompt corto

```text
Usa skill frontend-safe-edit.
Modifica solo LiveTvScreen.jsx.
Obiettivo: rendere più leggibile il box IN CODA.
Non toccare logica dati.
```

### Prompt completo

```text
Agisci come Frontend Agent e usa skill frontend-safe-edit.

File:
src/pages/LiveTvScreen.jsx

Obiettivo:
rendere più leggibile il box IN CODA su TV.

Vincoli:
- non toccare Supabase;
- non toccare Spotify;
- non toccare App.jsx;
- non cambiare routing;
- no refactor;
- no nuove dipendenze.

Output:
piano breve, patch minima, test manuale.
```

---

## Applicazione pratica: combinare skill

Esempio task Walbox UI:

```text
Agente: Walbox Specialist Agent
Skills:
- walbox-dev
- frontend-safe-edit
- token-saver
```

Processo:

1. `walbox-dev` capisce contesto e file critici.
2. `token-saver` riduce contesto.
3. `frontend-safe-edit` guida modifica UI.

Esempio task commerciale:

```text
Agente: Sales Agent
Skills:
- pitch-builder
- client-proposal-builder
- business-validator
```

Esempio task documentazione:

```text
Agente: Documentation Agent
Skills:
- official-source-digester
- documentation-compressor
- checkpoint-writer
```

---

## Skill routing matrix

| Task | Skill primaria | Skill secondaria |
|---|---|---|
| UI polish Walbox | frontend-safe-edit | walbox-dev |
| Bug Supabase | safe-backend-change | qa-review |
| Nuova idea business | business-validator | pitch-builder |
| Messaggio locale | pitch-builder | client-proposal-builder |
| Ridurre costi token | token-saver | prompt-optimizer |
| Deep dive docs | official-source-digester | documentation-compressor |
| Fine sessione | checkpoint-writer | documentation-compressor |
| Nuovo progetto cliente | project-context-builder | client-proposal-builder |
| Clone Walbox | walbox-clone-adapter | walbox-dev |
| Demo prima incontro | demo-builder | pitch-builder |

---

## Skills minime per iniziare domani

Per non complicare tutto, la v1 reale dovrebbe partire con 6 skills:

```text
1. walbox-dev
2. frontend-safe-edit
3. token-saver
4. qa-review
5. checkpoint-writer
6. pitch-builder
```

Queste coprono:

- codice Walbox;
- UI sicura;
- risparmio token;
- controllo bug;
- memoria/checkpoint;
- vendita/demo.

---

## Roadmap skills

### Fase 1 — Manuale

Creare questo file e usare le skills come prompt manuali.

### Fase 2 — Cartelle skill

Creare cartelle con `SKILL.md`.

### Fase 3 — Uso in Antigravity

Integrare in `.agents/skills/`.

### Fase 4 — Uso in Claude Code

Trasformare in skills Claude Code effettive.

### Fase 5 — Preload in sub-agents

Collegare skills a sub-agents.

### Fase 6 — Hooks/evaluations

Aggiungere controlli automatici e scorecard.

---

## Skill governance

Quando hai molte skill serve pulizia.

Ogni mese/progetto:

```text
[ ] Quali skill uso davvero?
[ ] Quali sono duplicate?
[ ] Quali sono troppo lunghe?
[ ] Quali vanno aggiornate?
[ ] Quali errori ricorrenti devono diventare regole?
[ ] Quali skill vanno archiviate?
```

### Regola

> Una skill non usata è debito cognitivo.

---

## Decisione operativa per te

Non devi creare subito 20 skills reali.

Devi fare così:

1. Usare questo file come mappa.
2. Creare 6 skill fondamentali.
3. Testarle su Walbox.
4. Aggiornarle dopo errori reali.
5. Solo dopo trasformarle in sub-agent preload / Claude Code skills vere.

### Priorità immediata

```text
SKILLS/
├── walbox-dev/SKILL.md
├── frontend-safe-edit/SKILL.md
├── token-saver/SKILL.md
├── qa-review/SKILL.md
├── checkpoint-writer/SKILL.md
└── pitch-builder/SKILL.md
```

---

## Prompt per creare una nuova skill

```text
Crea una skill per [tipo di lavoro].

La skill deve includere:
- Purpose
- Use when
- Do not use when
- Inputs required
- Rules
- Do
- Do not
- Workflow
- Output format
- Good example
- Bad example
- Checklist
- Related agents

Stile:
operativo, breve, senza teoria inutile.
```

---

## Prompt per migliorare una skill

```text
Review questa skill.

Controlla:
- è troppo generica?
- è troppo lunga?
- manca “do not use when”?
- mancano vincoli?
- output format è chiaro?
- riduce token?
- riduce rischio?
- è testabile?
- ci sono duplicati con altre skill?

Output:
1. problemi;
2. modifiche consigliate;
3. versione migliorata.
```

---

## Prompt per decidere se serve una skill

```text
Valuta se questo task/processo merita una skill.

Task/processo:
[descrizione]

Rispondi:
1. è ripetibile?
2. capita spesso?
3. ha rischi se spiegato male?
4. può essere standardizzato?
5. quale sarebbe il nome skill?
6. cosa includere?
7. cosa lasciare fuori?
```

---

## Completezza stimata

Completezza attuale: 87%

### Coperto bene

- differenza skill/agente/workflow/memory/tool;
- quando creare skills;
- quando evitarle;
- struttura skill;
- naming;
- skill principali per AI Business Factory;
- skill specifiche Walbox;
- prompt d’uso;
- combinazione con agenti;
- routing matrix;
- roadmap;
- scorecard;
- governance;
- esempi completi `SKILL.md`.

### Da approfondire nei file dedicati

- sintassi esatta per installare/condividere skills in Claude Code;
- bundled skills disponibili;
- skills marketplace o condivisione;
- metadata formale Claude Code;
- preload skills in sub-agents con esempi reali;
- skill packaging;
- security review delle skills;
- versioning;
- evaluation automatica;
- conversione in `.agents/skills/` Antigravity;
- confronto con Google Antigravity skills/rules/workflows.

---

## Prossimo file consigliato

```text
07_PROMPTING_RULES.md
```

Perché dopo aver definito agenti e skills, serve definire il linguaggio operativo: come scrivere prompt corti, precisi, economici e adatti ai vari ruoli.

<!-- END_SOURCE_FILE: 06_SKILLS_SYSTEM.md -->


<!-- BEGIN_SOURCE_FILE: 07_PROMPTING_RULES.md -->
<!-- SOURCE_SHA256_UTF8: d26e98ebe21aefef00a82e1998c7b0de5eb65cf65fc7de58def4fcd3130ccb45 -->
<!-- SOURCE_CHAR_COUNT: 30977 -->

# 07_PROMPTING_RULES.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Prompting & Tokens  
Completezza stimata: 90%

---

## Scopo del file

Questo file definisce le regole di prompting della tua **AI Business Factory**.

L’obiettivo non è diventare “prompt engineer” in modo teorico.  
L’obiettivo è scrivere prompt che facciano lavorare ChatGPT, Claude, Antigravity e agenti AI in modo:

- chiaro;
- economico;
- controllato;
- verificabile;
- riutilizzabile;
- adatto al ruolo;
- senza scope creep;
- senza output enormi inutili;
- senza rompere codice stabile;
- senza sprecare token.

La regola centrale:

> Un buon prompt non è lungo. È preciso.

---

## Fonti ufficiali usate

Fonti principali:

1. Prompting Best Practices — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting

2. Prompt Engineering Overview  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview

3. Console Prompting Tools / Prompt Generator  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/prompt-generator

4. Define Success Criteria and Build Evaluations  
   https://docs.anthropic.com/en/docs/build-with-claude/develop-tests

5. Claude Code Best Practices  
   https://www.anthropic.com/engineering/claude-code-best-practices

6. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

7. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

8. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

9. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

10. Tool Use Overview  
    https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview

11. Define Tools / Tool Use Implementation  
    https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use

12. Writing Effective Tools for Agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

13. Building Effective AI Agents  
    https://www.anthropic.com/research/building-effective-agents

14. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

15. Effective Harnesses for Long-running Agents  
    https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

16. Multi-agent Research System  
    https://www.anthropic.com/engineering/multi-agent-research-system

17. Code Execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp

18. Equipping Agents with Skills  
    https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

---

## Sintesi brutale

Prompt buono:

```text
Ruolo + contesto minimo + task specifico + vincoli + output atteso + verifica.
```

Prompt cattivo:

```text
Aiutami a migliorare tutto.
```

Un prompt buono deve rispondere a 7 domande:

1. Chi deve agire?
2. Su cosa deve lavorare?
3. Qual è l’obiettivo?
4. Qual è il contesto minimo?
5. Cosa NON deve fare?
6. Come deve rispondere?
7. Come verifichiamo che ha funzionato?

---

## Regola 0 — Prima definisci successo, poi scrivi prompt

Le fonti Anthropic sul prompt engineering sottolineano che prima di migliorare prompt serve sapere cosa significa “buon risultato”.

Per te:

> Prima di chiedere all’AI di fare qualcosa, devi sapere come capirai se l’ha fatto bene.

### Esempio cattivo

```text
Migliora questa schermata.
```

Non ha criterio di successo.

### Esempio buono

```text
Modifica solo LiveTvScreen.jsx.
Obiettivo: rendere il box IN CODA leggibile da 3 metri su TV.
Successo:
- testo più grande;
- contrasto migliore;
- nessuna modifica alla logica dati;
- build ok.
```

### Prompt

```text
Prima di ottimizzare il prompt, aiutami a definire i success criteria:
- cosa deve uscire;
- cosa non deve succedere;
- come testerò;
- quali errori rendono il risultato non accettabile.
```

---

## Regola 1 — Il prompt deve avere un ruolo

Non dire solo “fai”.

Dì chi deve essere l’agente:

```text
Agisci come Frontend Agent.
Agisci come QA Agent.
Agisci come Token Saver Agent.
Agisci come Sales/Pitch Agent.
Agisci come Documentation Agent.
Agisci come Research Agent.
```

### Perché

Il ruolo limita mentalmente il campo.

Frontend Agent non deve fare backend.  
Sales Agent non deve modificare codice.  
QA Agent non deve implementare.

### Esempio

```text
Agisci come QA Agent.
Modalità read-only.
Non modificare file.
Controlla questa patch.
```

---

## Regola 2 — Il contesto deve essere minimo ma sufficiente

Il contesto non deve essere “tutto”.

Deve essere solo ciò che serve.

### Contesto buono

```text
Progetto: Walbox.
File: CustomerJukeboxOldOrange.jsx.
Stato: invio richiesta a Supabase funziona.
Task: migliorare UI mobile del bottone.
Vincolo: non toccare createSongRequest/searchTrack.
```

### Contesto cattivo

```text
Tutta la storia Walbox, tutte le idee future, tutti i meeting, tutte le roadmap, vecchi bug, screenshot non necessari.
```

### Regola

> Se un’informazione non cambia la risposta, non metterla nel prompt.

---

## Regola 3 — Specifica sempre il file o l’area

Per coding agent:

```text
Modifica solo [file].
```

oppure:

```text
Analizza solo questi file:
- ...
```

### Esempio

```text
Modifica solo src/pages/LiveTvScreen.jsx.
Non toccare App.jsx, walboxDb.js, spotifyApi.js o routing.
```

### Perché

Gli agenti possono esplorare troppo se non li limiti.

---

## Regola 4 — Specifica cosa NON fare

La parte “non fare” è spesso più importante del task.

### Template

```text
Vincoli:
- Non toccare altri file.
- Non fare refactor.
- Non aggiungere dipendenze.
- Non cambiare routing.
- Non modificare backend/API.
- Non cambiare schema database.
- Non modificare env variables.
- Non alterare logica dati.
```

### Esempio Walbox

```text
Non toccare:
- App.jsx
- walboxDb.js
- spotifyApi.js
- api/search.js
- ManagerDashboard.jsx
- Supabase schema
- Spotify auth flow
```

---

## Regola 5 — Chiedi output strutturato

Output libero = difficile da usare.

Output strutturato = veloce da controllare.

### Template per codice

```md
## Piano breve
...

## File modificati
...

## Cosa ho cambiato
...

## Cosa non ho toccato
...

## Come testare
...

## Rischi
...
```

### Template per ricerca

```md
## Fonte
...

## Cosa dice
...

## Perché serve
...

## Regola operativa
...

## File da aggiornare
...
```

### Template per business

```md
## Problema
...

## Target
...

## Valore
...

## MVP minimo
...

## Cosa evitare
...

## Prossimo step
...
```

---

## Regola 6 — Usa stop conditions

Una stop condition dice all’agente quando deve fermarsi.

### Esempi

```text
Fermati se pensi di dover modificare più di 2 file.
Fermati se serve cambiare schema database.
Fermati se serve aggiungere dipendenze.
Fermati se non sei sicuro del file giusto.
Fermati se il task richiede API/env variables.
```

### Perché

Serve a evitare che l’agente prenda iniziative pericolose.

---

## Regola 7 — Usa read-only prima dei task incerti

Per task complessi:

```text
Non modificare file.
Analizza e proponi piano.
```

### Quando usarlo

- bug non chiaro;
- Supabase;
- Spotify;
- auth;
- database;
- routing;
- architettura;
- multi-file;
- deploy error.

### Prompt

```text
Modalità read-only.
Non modificare file.
Analizza il problema e rispondi con:
1. causa probabile;
2. file coinvolti;
3. rischio;
4. patch minima;
5. test.
```

---

## Regola 8 — Prompt corto per task semplice

Non usare prompt enormi per micro-edit.

### Task micro

```text
Modifica solo LiveTvScreen.jsx.
Cambia il testo “LIVE” in “ON AIR”.
Non toccare altro.
```

### Task medio

Aggiungi:

- ruolo;
- contesto;
- vincoli;
- test.

### Task complesso

Aggiungi:

- read-only;
- piano;
- rischi;
- rollback;
- step;
- conferma prima di modifica.

---

## Regola 9 — Non usare il prompt per compensare un task confuso

Se il task è confuso, non serve prompt più lungo.

Serve chiarire il task.

### Cattivo

```text
Prompt di 200 righe per chiedere “migliora app”.
```

### Buono

```text
Prima trasformiamo “migliora app” in:
- obiettivo;
- file;
- vincoli;
- test.
```

### Prompt

```text
Trasforma questa richiesta grezza in un task tecnico sicuro.
Output:
- obiettivo;
- file target;
- vincoli;
- cosa non toccare;
- test;
- prompt finale.
```

---

## Regola 10 — Usa esempi solo quando servono

Le fonti Anthropic parlano dell’utilità degli esempi/multishot.

Per te:

- usa esempi quando vuoi formato preciso;
- usa esempi quando il task è ambiguo;
- usa esempi per tono/copy;
- usa esempi per distinguere buono/cattivo.

Non servono esempi per micro task ovvi.

### Esempio

```text
Formato desiderato:
Buono: “Walbox trasforma la serata in social experience.”
Cattivo: “Sistema di profilazione AI per clienti.”
```

---

## Regola 11 — Usa delimitatori chiari

Per testo lungo, usa sezioni.

Esempio:

```text
<contesto>
...
</contesto>

<task>
...
</task>

<vincoli>
...
</vincoli>

<output>
...
</output>
```

Oppure markdown:

```md
## Contesto
...

## Task
...

## Vincoli
...

## Output
...
```

### Regola

> Delimitatori chiari riducono confusione.

---

## Regola 12 — Separa istruzioni da dati

Non mischiare tutto nello stesso blocco.

### Cattivo

```text
Ecco codice e devi modificarlo e anche ricordati che...
```

### Buono

```md
## Istruzioni
...

## Dati
...

## Output richiesto
...
```

---

## Regola 13 — Non chiedere chain-of-thought

Non chiedere “mostrami tutto il ragionamento interno”.

Chiedi invece:

```text
Fammi una spiegazione sintetica delle decisioni.
```

oppure:

```text
Mostrami:
- ipotesi;
- decisione;
- motivo;
- rischio.
```

### Prompt utile

```text
Non serve ragionamento esteso.
Dammi solo:
1. decisione;
2. motivazione breve;
3. rischio;
4. prossimo step.
```

---

## Regola 14 — Usa “piano breve” ma non planning infinito

Per task medio:

```text
Prima proponi un piano breve di massimo 5 punti.
Poi applica patch minima.
```

Per task complesso:

```text
Non implementare.
Fai solo piano.
```

### Regola

> Il piano deve ridurre rischio, non diventare un romanzo.

---

## Regola 15 — Specifica il livello di autonomia

### Livelli

```text
Livello 0: read-only
Livello 1: modifica un file
Livello 2: modifica più file dopo piano
Livello 3: autonomia estesa con checkpoint
```

### Prompt

```text
Livello autonomia: 1.
Puoi modificare solo il file indicato.
Fermati se serve altro.
```

---

## Regola 16 — Specifica il modello/modalità quando utile

Per te:

```text
Flash Low / Fast → micro edit
Flash Medium → default un file
Flash High → logica React moderata
Pro / Sonnet Thinking → architettura, bug complessi, multi-file
```

Prompt:

```text
Questo è un task micro. Usa approccio fast, patch minima, niente piano lungo.
```

oppure:

```text
Questo è un task complesso. Usa planning, non modificare file subito.
```

---

## Regola 17 — Prompt per Antigravity

Template base:

```text
Modifica solo @NomeFile.

Fai solo questa cosa:
[task]

Non modificare altri file.
Non fare refactor.
Non toccare logica/API/routing.
Dopo la modifica dimmi come testare.
```

### Esempio

```text
Modifica solo @CustomerJukeboxOldOrange.
Rendi il bottone invio più leggibile su mobile.
Non toccare ricerca Spotify, Supabase, App.jsx o altri file.
```

---

## Regola 18 — Prompt per Claude Code

Template base:

```text
Agisci come Coding Agent.

Task:
[task]

File target:
[file]

Vincoli:
[vincoli]

Processo:
1. leggi file;
2. piano breve;
3. patch minima;
4. test;
5. summary.

Fermati se serve modificare altri file.
```

---

## Regola 19 — Prompt per ChatGPT

Usa ChatGPT soprattutto per:

- regia;
- sintesi;
- business;
- prompt finale;
- deep dive;
- documentazione;
- strategie;
- traduzione da idea a task.

Template:

```text
Agisci come AI Business Factory Strategist.

Trasforma questa idea in:
1. obiettivo;
2. MVP;
3. cosa evitare;
4. agente da usare;
5. prompt finale per Antigravity/Claude;
6. test;
7. checkpoint.
```

---

## Regola 20 — Prompt per Research Agent

```text
Agisci come Research Agent.

Tema:
[tema]

Priorità fonti:
1. ufficiali;
2. documentazione primaria;
3. engineering blog autorevoli;
4. competitor reali;
5. video/blog solo extra.

Output:
- fonte;
- link;
- cosa dice;
- perché serve;
- regola operativa;
- file .md da aggiornare.
```

---

## Regola 21 — Prompt per Documentation Agent

```text
Agisci come Documentation Agent.

Trasforma questo materiale in:
- decisioni;
- regole operative;
- template;
- prompt riutilizzabili;
- cosa mettere in memoria attiva;
- cosa archiviare;
- prossimo step singolo.
```

---

## Regola 22 — Prompt per QA Agent

```text
Agisci come QA Agent.
Modalità read-only.

Controlla questa modifica:
[diff/piano]

Verifica:
- scope;
- file toccati;
- rischi;
- regressioni;
- build;
- mobile;
- flusso utente;
- test necessari.

Output:
safe / attenzione / bloccare.
```

---

## Regola 23 — Prompt per Token Saver Agent

```text
Agisci come Token Saver Agent.

Task:
[task]

Output:
1. livello task;
2. modello/modalità;
3. contesto minimo;
4. cosa evitare;
5. prompt finale ottimizzato;
6. rischio token.
```

---

## Regola 24 — Prompt per Sales/Pitch Agent

```text
Agisci come Sales/Pitch Agent.

Prodotto:
[prodotto]

Cliente:
[cliente]

Obiettivo:
[pitch / demo / follow-up]

Output:
1. pitch 3 righe;
2. messaggio WhatsApp;
3. valore cliente;
4. obiezioni e risposte;
5. CTA.
```

---

## Regola 25 — Prompt per Business Validator

```text
Agisci come Business Validator.

Idea:
[idea]

Valuta:
1. problema reale;
2. target;
3. valore;
4. MVP minimo;
5. cosa non fare ora;
6. rischio;
7. prossimo test.
```

---

## Regola 26 — Prompt per Context Compressor

```text
Comprimi questo contesto per una nuova sessione agentica.

Mantieni:
- obiettivo;
- stato stabile;
- decisioni;
- file critici;
- vincoli;
- bug aperti;
- prossimo step;
- test.

Rimuovi:
- ripetizioni;
- idee future non utili;
- vecchi log;
- discussioni lunghe;
- dettagli emotivi.
```

---

## Regola 27 — Prompt per creare checkpoint

```text
Crea un checkpoint operativo.

Formato:
- data;
- obiettivo completato;
- stato stabile;
- file modificati;
- test effettuati;
- cosa funziona;
- cosa non toccare;
- problemi aperti;
- decisioni prese;
- prossimo step singolo;
- prompt utile per ripartire.
```

---

## Regola 28 — Prompt per ufficializzare una fonte

```text
Analizza questa fonte ufficiale:
[link/testo]

Output:
1. cosa spiega;
2. perché serve alla AI Business Factory;
3. regole operative estratte;
4. prompt/template derivati;
5. file da creare o aggiornare;
6. completezza.
```

---

## Regola 29 — Evita prompt “emotivi” per coding

Cattivo:

```text
Ti prego fai bene, non fare casino, rendilo figo.
```

Buono:

```text
Modifica solo questo file.
Obiettivo: X.
Vincoli: Y.
Test: Z.
```

L’emozione non è un requisito tecnico.

---

## Regola 30 — Usa “cosa evitare” anche per business

Esempio pitch Walbox:

```text
Evita:
- dire profilazione;
- parlare troppo di AI;
- promettere account completo;
- dire app enorme;
- proporre troppa roadmap subito.
```

Prompt:

```text
Crea pitch per Walbox.
Includi cosa dire e cosa evitare.
```

---

## Regola 31 — Prompt per separare MVP da roadmap

```text
Dividi questa idea in:
1. MVP demo;
2. utile ma dopo;
3. roadmap futura;
4. da evitare ora;
5. prossimo step singolo.
```

### Applicazione

Loyalty completa Walbox:

```text
MVP demo: schermata finta Profilo Walrus.
Roadmap: account, punti reali, coupon, analytics.
Da evitare ora: backend loyalty completo.
```

---

## Regola 32 — Prompt per “safe refactor”

```text
Agisci come Refactor Agent.

Obiettivo:
[refactor]

Vincoli:
- comportamento invariato;
- nessuna nuova feature;
- no UI redesign;
- test prima/dopo;
- commit separato.

Prima non modificare.
Crea piano con:
- file;
- rischio;
- test;
- rollback.
```

---

## Regola 33 — Prompt per bug complesso

```text
Agisci come Debug Agent.
Modalità read-only.

Bug:
[descrizione]

Contesto:
[stato]

Output:
1. ipotesi principali;
2. file da controllare;
3. dati/log necessari;
4. patch minima proposta;
5. test;
6. rischio.
```

---

## Regola 34 — Prompt per evitare modifiche fuori scope

```text
Se trovi problemi non collegati al task:
- non correggerli;
- elencali in “note future”;
- continua solo sul task richiesto.
```

---

## Regola 35 — Prompt per output breve

Quando vuoi velocità:

```text
Risposta breve.
Massimo 10 righe.
Solo:
- decisione;
- motivo;
- prossimo step.
```

Per l’utente questa è utile quando sta lavorando in terminale.

---

## Regola 36 — Prompt per output lungo

Quando vuoi deep dive:

```text
Fai deep dive.
Struttura:
1. sintesi;
2. fonti;
3. analisi;
4. regole operative;
5. template;
6. rischi;
7. completezza;
8. prossimo file/step.
```

---

## Regola 37 — Prompt per file `.md`

```text
Crea un file .md operativo.

Deve includere:
- titolo;
- versione;
- completezza stimata;
- scopo;
- fonti usate;
- sintesi;
- regole pratiche;
- template;
- prompt riutilizzabili;
- checklist;
- esempi;
- cosa manca;
- prossimo file consigliato.
```

---

## Regola 38 — Prompt per aggiornare file `.md`

```text
Aggiorna questo file .md con il nuovo materiale.

Regole:
- non duplicare sezioni;
- aggiungi solo ciò che cambia il workflow;
- segnala decisioni nuove;
- aggiorna completezza;
- mantieni stile operativo.
```

---

## Regola 39 — Prompt per creare cartella progetto

```text
Crea struttura documentale per nuovo progetto.

Output:
- cartelle;
- file .md;
- scopo di ogni file;
- priorità;
- quali file creare subito;
- quali rimandare.
```

---

## Regola 40 — Prompt per review prompt

```text
Review questo prompt.

Controlla:
- ruolo chiaro;
- task specifico;
- contesto sufficiente;
- vincoli;
- cosa non fare;
- output atteso;
- test;
- rischio token;
- ambiguità.

Poi riscrivilo in versione migliore.
```

---

## Template universale AI Business Factory

```text
Agisci come [RUOLO].

Contesto minimo:
[CONTESTO]

Task:
[TASK SPECIFICO]

Vincoli:
- [VINCOLO 1]
- [VINCOLO 2]
- [COSA NON FARE]

Output:
1. [FORMATO]
2. [FORMATO]
3. [FORMATO]

Verifica:
[COME CONTROLLARE]

Stop condition:
Fermati se [CONDIZIONE].
```

---

## Template coding sicuro

```text
Agisci come [Frontend/Backend/Coding] Agent.

File target:
[file]

Obiettivo:
[obiettivo concreto]

Vincoli:
- modifica solo file target;
- no refactor;
- no nuove dipendenze;
- non toccare [file critici];
- preserva comportamento esistente.

Processo:
1. piano breve;
2. patch minima;
3. riepilogo;
4. test.

Stop:
fermati se servono altri file o se il task tocca API/database/routing.
```

---

## Template read-only analysis

```text
Agisci come [ruolo].
Modalità read-only.

Non modificare file.
Non eseguire comandi distruttivi.

Analizza:
[problema]

Output:
1. cosa hai capito;
2. file/aree coinvolte;
3. ipotesi;
4. rischio;
5. piano;
6. patch minima proposta;
7. test.
```

---

## Template research ufficiale

```text
Agisci come Research Agent.

Tema:
[tema]

Usa priorità:
1. fonti ufficiali;
2. docs primarie;
3. engineering blog dell’azienda;
4. fonti autorevoli;
5. fonti secondarie solo se utili.

Output:
- link;
- cosa dice;
- affidabilità;
- regola pratica;
- file da aggiornare;
- cosa resta incerto.
```

---

## Template business idea

```text
Agisci come Strategist Agent.

Idea:
[idea]

Valuta:
1. problema reale;
2. target;
3. urgenza;
4. valore;
5. MVP;
6. costo/complessità;
7. possibilità di vendita;
8. cosa evitare;
9. prossimo test.
```

---

## Template cliente/locale

```text
Agisci come Client Context Agent.

Cliente:
[appunti]

Prodotto:
[Walbox/altro]

Output:
1. cosa gli interessa;
2. problema percepito;
3. obiezioni;
4. demo da mostrare;
5. parole da usare;
6. parole da evitare;
7. proposta semplice;
8. follow-up.
```

---

## Prompt anti-token

```text
Prima di rispondere, riduci il task al minimo utile.

Dimmi:
1. qual è il vero obiettivo;
2. qual è il contesto minimo;
3. cosa non serve;
4. quale output è sufficiente;
5. prompt finale breve.
```

---

## Prompt anti-scope-creep

```text
Non espandere il task.
Se trovi idee extra, mettile in “Roadmap futura”.
Completa solo l’obiettivo richiesto.
```

---

## Prompt anti-allucinazione

```text
Se non hai informazioni sufficienti:
- dichiaralo;
- non inventare;
- indica cosa serve;
- proponi un’ipotesi solo se marcata come ipotesi.
```

Per fonti recenti:

```text
Usa solo fonti ufficiali o autorevoli.
Cita le fonti.
Distingui fatti da interpretazioni.
```

---

## Prompt per fonti e citazioni

```text
Quando usi fonti:
- preferisci documentazione ufficiale;
- cita link;
- spiega cosa supporta ogni fonte;
- non usare fonti deboli se esiste fonte primaria;
- segnala cosa è incerto o aggiornabile.
```

---

## Prompt per generare prompt Antigravity

```text
Trasforma questo obiettivo in un prompt Antigravity.

Regole:
- “Modifica solo @NomeFile”
- task singolo;
- vincoli chiari;
- cosa non toccare;
- modello/modalità consigliata;
- test finale.

Obiettivo:
[obiettivo]
```

---

## Prompt per generare prompt Claude Code

```text
Trasforma questo obiettivo in un prompt Claude Code.

Includi:
- ruolo;
- file target;
- contesto minimo;
- vincoli;
- processo;
- stop condition;
- test;
- output format.
```

---

## Prompt per scegliere Fast vs Planning

```text
Classifica questo task:
[task]

Dimmi:
- Fast o Planning;
- perché;
- modello/livello;
- contesto minimo;
- prompt finale;
- rischi.
```

---

## Errori comuni di prompting

### Errore 1 — Prompt troppo vago

```text
Migliora questo.
```

### Errore 2 — Prompt troppo grande

```text
Ecco tutta la storia del progetto, ora cambia un bottone.
```

### Errore 3 — Nessun vincolo

```text
Aggiungi questa cosa.
```

### Errore 4 — Nessun output format

Risposta disordinata.

### Errore 5 — Nessun test

Non sai se ha funzionato.

### Errore 6 — Nessuna stop condition

L’agente può espandere.

### Errore 7 — Ruolo sbagliato

Sales Agent che parla di codice.  
Frontend Agent che tocca database.

### Errore 8 — Troppa fiducia

Accettare modifiche senza review.

---

## Prompt scorecard

Usa questa checklist per valutare un prompt.

```text
[ ] Ruolo chiaro
[ ] Task specifico
[ ] Contesto minimo
[ ] File/area indicata
[ ] Vincoli
[ ] Cosa NON fare
[ ] Output format
[ ] Test/verifica
[ ] Stop condition
[ ] Livello autonomia
[ ] Rischio token basso
[ ] Nessuna ambiguità grossa
```

Punteggio:

```text
0-5: prompt debole
6-8: prompt usabile
9-12: prompt forte
```

---

## Prompt refinement loop

1. Scrivi prompt grezzo.
2. Fai review prompt.
3. Riduci contesto inutile.
4. Aggiungi vincoli.
5. Aggiungi output format.
6. Aggiungi stop condition.
7. Testa.
8. Se sbaglia, aggiungi regola alla skill/workflow.

### Regola

> Ogni errore del modello deve migliorare il prompt successivo.

---

## Prompt library minima per Walbox

### 1. UI safe edit

```text
Modifica solo @[FILE].
Fai solo questa modifica UI:
[TASK]
Non toccare logica dati, Supabase, Spotify, App.jsx, routing o altri file.
Non fare refactor.
Dopo dimmi come testare.
```

### 2. Read-only bug analysis

```text
Analizza soltanto.
Non modificare file.

Problema:
[BUG]

Controlla solo:
[FILE/AREA]

Output:
causa probabile, file coinvolti, patch minima, test.
```

### 3. Checkpoint

```text
Crea checkpoint Walbox:
- data;
- cosa funziona;
- file modificati;
- test;
- cosa non toccare;
- prossimo step singolo.
```

### 4. Pitch locale

```text
Crea pitch Walbox per [locale].
Tono semplice.
Non parlare troppo di tecnologia.
Punta su social experience, TV, contenuti, partecipazione clienti.
```

### 5. Token saver

```text
Classifica questo task e dimmi modello/modalità più economica sufficiente.
```

---

## Prompt per Walbox: esempi buoni

### Esempio 1

```text
Modifica solo @CustomerJukeboxOldOrange.

Obiettivo:
rendere più grande e chiaro il bottone “Invia richiesta” su mobile.

Vincoli:
- non toccare ricerca Spotify;
- non toccare Supabase;
- non toccare selectedSong;
- non toccare App.jsx;
- non modificare altri file;
- no refactor.

Test:
build + invio richiesta da telefono.
```

### Esempio 2

```text
Modalità read-only.

Analizza il flusso:
App.jsx → walboxDb.js → ManagerDashboard.jsx

Problema:
richiesta salvata in Supabase ma non visibile in dashboard.

Non modificare file.
Output:
causa probabile, file da controllare, patch minima, test.
```

### Esempio 3

```text
Agisci come Sales/Pitch Agent.

Crea messaggio WhatsApp per proporre una demo Walbox a un bar.
Non vendere “app enorme”.
Proponi una serata test semplice:
QR + richiesta canzoni + TV + dashboard.
Tono naturale, non commerciale aggressivo.
```

---

## Prompt per Walbox: esempi cattivi

### Cattivo 1

```text
Rendi la app più wow.
```

Problema:

- vago;
- nessun file;
- nessun vincolo;
- nessun test.

### Cattivo 2

```text
Sistema Walbox e aggiungi loyalty, account, multi-locale e migliora TV.
```

Problema:

- troppe feature;
- rischio enorme;
- nessuna priorità.

### Cattivo 3

```text
Migliora il codice.
```

Problema:

- refactor non richiesto;
- possibile rottura.

---

## Prompt standard per creare file AI Business Factory

```text
Crea il file:
[NOME_FILE.md]

Obiettivo:
[obiettivo file]

Fai deep dive usando fonti ufficiali dove possibile.

Il file deve includere:
- versione;
- completezza stimata;
- scopo;
- fonti usate;
- sintesi;
- regole operative;
- template;
- prompt riutilizzabili;
- esempi Walbox/business;
- checklist;
- errori comuni;
- cosa manca;
- prossimo file consigliato.

Stile:
operativo, concreto, non teoria.
```

---

## Mini guida: scegliere lunghezza prompt

### Prompt da 1–3 righe

Per:

- typo;
- testo;
- micro edit;
- traduzione;
- comando semplice.

### Prompt da 5–15 righe

Per:

- UI file singolo;
- QA;
- pitch;
- sintesi;
- checkpoint.

### Prompt da 20–50 righe

Per:

- bug complesso;
- feature media;
- deep dive;
- file .md;
- analisi business.

### Prompt lungo

Solo per:

- istruzioni di progetto;
- file skill;
- contesto iniziale;
- task critico.

### Regola

> La lunghezza del prompt deve seguire il rischio del task.

---

## Mini guida: cosa mettere nel prompt per tipo task

| Task | Metti nel prompt |
|---|---|
| Micro UI | file, modifica, cosa non toccare |
| Bug | sintomo, stato, file, read-only, output |
| Feature | obiettivo, MVP, vincoli, test, piano |
| Research | tema, fonti prioritarie, output |
| Business | idea, target, vincoli, output |
| Pitch | cliente, prodotto, tono, CTA |
| Checkpoint | stato, file, test, next step |
| Token saving | task, vincoli, budget, modello |

---

## Come usare XML/Markdown delimiters

Le docs Anthropic suggeriscono strutture chiare; in pratica puoi usare XML o markdown.

### XML

```xml
<context>
Walbox usa Supabase Realtime e Spotify.
</context>

<task>
Modifica solo LiveTvScreen.jsx.
</task>

<constraints>
Non toccare App.jsx o servizi.
</constraints>

<output>
Piano, patch, test.
</output>
```

### Markdown

```md
## Contesto
...

## Task
...

## Vincoli
...

## Output
...
```

Per te markdown è più leggibile.

---

## Prompt per tool use

Quando un agente usa tool/API, il prompt deve essere ancora più chiaro.

```text
Usa solo i tool necessari.
Prima spiega quale tool serve e perché.
Non chiamare tool non necessari.
Se un tool restituisce molti dati, sintetizza prima di procedere.
```

Per MCP/tool complessi:

```text
Non caricare tutti i tool.
Usa solo quelli rilevanti al task.
Filtra risultati prima di portarli nel contesto.
```

---

## Prompt per evitare costi tool/context

```text
Prima di usare tool o leggere molti file:
1. dimmi quali fonti/file servono davvero;
2. perché;
3. cosa puoi ignorare;
4. stima rischio token.
```

---

## Prompt per long-running agents

Per task lunghi, non basta “costruisci app”.

Serve istruzione di harness:

```text
Lavora in step incrementali.
A ogni step:
- scegli un obiettivo piccolo;
- modifica il minimo;
- verifica;
- scrivi artifact/checkpoint;
- indica next step.
Non procedere a feature successive se lo step corrente non è stabile.
```

---

## Prompt per multi-agent research

```text
Se usi più agenti, separa i sottotask:
- fonti ufficiali;
- competitor;
- pricing;
- esempi;
- rischi.

Ogni sub-agent deve restituire sintesi breve con link e regole operative.
Il lead agent deve unificare, deduplicare e citare.
```

---

## Prompt per “domattina trovo tutto pronto” reality check

```text
Non promettere lavoro in background.
Crea ora il massimo output possibile.
Se il lavoro è troppo grande, produci v1 completa e indica cosa resta da migliorare.
```

Questa regola serve perché gli agenti devono essere onesti sui limiti operativi.

---

## Prompt per trasformare video/screenshot in regole

```text
Analizza questo video/screenshot.

Output:
1. cosa mostra;
2. concetto utile;
3. regola operativa;
4. possibile file .md da aggiornare;
5. prompt/workflow derivato;
6. cosa è solo curiosità e non serve ora.
```

---

## Prompt per “non farmi studiare tutto”

```text
Trasforma questa documentazione in manuale operativo.

Non farmi studiare teoria.
Per ogni sezione dammi:
- cosa significa;
- perché serve a me;
- regola pratica;
- esempio;
- prompt/template;
- priorità.
```

---

## Decisione operativa per te

Ogni prompt importante deve passare da questa mini formula:

```text
RUOLO → TASK → VINCOLI → OUTPUT → TEST
```

Se manca uno di questi, il prompt è debole.

### Formula estesa

```text
RUOLO
CONTESTO MINIMO
TASK
FILE/AREA
VINCOLI
COSA NON FARE
OUTPUT FORMAT
TEST
STOP CONDITION
```

---

## File generati da questo documento

Questo file porta alla creazione futura di:

```text
18_PROMPT_LIBRARY.md
PROMPT_REVIEW_CHECKLIST.md
ANTIGRAVITY_PROMPT_TEMPLATES.md
CLAUDE_CODE_PROMPT_TEMPLATES.md
WALBOX_PROMPT_LIBRARY.md
TOKEN_SAVER_PROMPTS.md
RESEARCH_PROMPTS.md
SALES_PROMPTS.md
QA_PROMPTS.md
```

---

## Completezza stimata

Completezza attuale: 90%

### Coperto bene

- struttura dei prompt;
- success criteria;
- ruoli;
- contesto minimo;
- vincoli;
- output format;
- stop conditions;
- read-only;
- prompt per agenti;
- prompt per Antigravity;
- prompt per Claude Code;
- prompt per ChatGPT;
- prompt per ricerca;
- prompt per business;
- prompt per Walbox;
- anti-token;
- anti-scope-creep;
- esempi buoni/cattivi;
- template universali;
- prompting per tool use;
- long-running agents;
- multi-agent research;
- scorecard.

### Da approfondire nei file dedicati

- prompt caching;
- prompt evaluation automatica;
- prompt generator console;
- XML avanzato;
- tool description prompting;
- system prompt design;
- prompt per multimodal/screenshot;
- prompt per Claude Opus/Sonnet/Haiku specifici;
- prompt per GitHub Actions;
- prompt per MCP/code execution;
- libreria prompt completa divisa per cartelle.

---

## Prossimo file consigliato

```text
08_MODEL_SELECTION_AND_TOKEN_SAVING.md
```

Perché dopo aver definito come scrivere prompt, serve decidere quale modello/modalità usare e come controllare costi/token in modo operativo.

<!-- END_SOURCE_FILE: 07_PROMPTING_RULES.md -->


<!-- BEGIN_SOURCE_FILE: 08_MODEL_SELECTION_AND_TOKEN_SAVING.md -->
<!-- SOURCE_SHA256_UTF8: 2512179dbfcb563de280b8432fa147405daa6f1c12ad568b59417fb64344094c -->
<!-- SOURCE_CHAR_COUNT: 27909 -->

# 08_MODEL_SELECTION_AND_TOKEN_SAVING.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Prompting & Tokens  
Completezza stimata: 91%

---

## Scopo del file

Questo file definisce come scegliere modello, modalità e livello di profondità nella tua **AI Business Factory**, con l’obiettivo di:

- non sprecare token;
- non bruciare crediti;
- non usare modelli potenti per task banali;
- non usare modelli deboli per task critici;
- ridurre contesto inutile;
- ridurre retry;
- ridurre sessioni lunghe;
- scegliere quando usare Fast, Planning, High, Pro, Thinking;
- costruire un metodo pratico per Walbox, Claude, Antigravity, ChatGPT e altri tool agentici.

La regola centrale:

> Prima scegli il livello del task. Solo dopo scegli il modello.

---

## Fonti ufficiali usate

Fonti principali:

1. Choosing the right model — Claude API Docs  
   https://docs.anthropic.com/en/docs/about-claude/models/choosing-a-model

2. Models overview — Claude API Docs  
   https://docs.anthropic.com/en/docs/about-claude/models

3. Claude Pricing — Claude API Docs  
   https://docs.anthropic.com/en/docs/about-claude/pricing

4. Manage costs effectively — Claude Code Docs  
   https://docs.anthropic.com/en/docs/claude-code/costs

5. Model configuration — Claude Code Docs  
   https://docs.anthropic.com/en/docs/claude-code/model-config

6. Context windows — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/context-windows

7. Prompt caching — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

8. Building with extended thinking — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking

9. Claude Code Best Practices  
   https://www.anthropic.com/engineering/claude-code-best-practices

10. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

11. Code Execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp

12. Advanced Tool Use  
    https://www.anthropic.com/engineering/advanced-tool-use

13. Token-saving updates on the Anthropic API  
    https://www.anthropic.com/news/token-saving-updates

14. Prompt caching with Claude  
    https://www.anthropic.com/news/prompt-caching

15. Claude Apps Release Notes  
    https://docs.anthropic.com/en/release-notes/claude-apps

16. Claude Code Quality Reports / Postmortem  
    https://www.anthropic.com/engineering/april-23-postmortem

---

## Sintesi brutale

La scelta del modello non è una questione di “migliore modello”.

È una questione di:

```text
task giusto → modello giusto → contesto giusto → workflow giusto
```

Le fonti ufficiali Anthropic indicano tre criteri principali per scegliere modello:

```text
capacità + velocità + costo
```

Per te, nella pratica, diventano:

```text
rischio + complessità + budget token + urgenza + reversibilità
```

---

## Regola madre

```text
Non usare il modello più potente se il task non lo richiede.
```

Esempio:

- cambiare testo bottone → modello economico/fast;
- analizzare architettura Supabase/Spotify → modello forte/planning;
- creare pitch → modello medio;
- fare deep dive fonti → modello forte se serve web e sintesi complessa;
- refactor multi-file → modello forte + read-only + piano;
- micro UI → Fast/Low.

---

## I 5 livelli di task

### Livello 1 — Micro

Esempi:

- cambiare testo;
- correggere typo;
- cambiare label;
- spacing piccolo;
- colore;
- classe CSS semplice;
- traduzione breve;
- prompt breve.

Modello/modalità:

```text
Fast / Low / modello economico
```

Contesto:

```text
solo file/elemento necessario
```

Prompt:

```text
Modifica solo [file].
Cambia [x] in [y].
Non toccare altro.
```

---

### Livello 2 — Semplice

Esempi:

- piccola modifica UI;
- componente singolo;
- messaggio WhatsApp;
- mini pitch;
- checkpoint breve;
- piccola documentazione;
- refuso in markdown.

Modello/modalità:

```text
Fast Medium / modello medio leggero
```

Contesto:

```text
file target + vincoli
```

Prompt:

```text
Agisci come [ruolo].
Modifica solo [file].
Obiettivo: [x].
Vincoli: [y].
Output: summary + test.
```

---

### Livello 3 — Medio

Esempi:

- layout responsive;
- bug React moderato;
- componente nuovo;
- prompt library;
- file `.md` operativo;
- QA su patch;
- business validation;
- pitch articolato;
- ricerca fonti limitata.

Modello/modalità:

```text
Medium / High leggero / modello medio-forte
```

Contesto:

```text
contesto minimo + file rilevanti + success criteria
```

Workflow:

```text
piano breve → patch → test
```

---

### Livello 4 — Complesso

Esempi:

- Supabase;
- Spotify;
- API;
- routing;
- useEffect complessi;
- bug multi-file;
- nuovo servizio;
- nuova feature media;
- architettura di una demo;
- deep dive fonti ufficiali;
- multi-agent planning.

Modello/modalità:

```text
Planning + modello forte
```

Contesto:

```text
checkpoint + file rilevanti + vincoli + test + rollback
```

Workflow:

```text
read-only → piano → conferma → patch minima → QA
```

---

### Livello 5 — Critico

Esempi:

- architettura multi-locale;
- auth;
- pagamenti;
- GDPR/privacy;
- produzione cliente;
- schema database reale;
- integrazione API con segreti;
- refactor grande;
- Agent SDK/MCP;
- automazioni hooks;
- prodotto definitivo;
- decisioni di pricing business importanti.

Modello/modalità:

```text
modello più forte disponibile + planning + review + checkpoint
```

Workflow:

```text
read-only obbligatorio → piano in fasi → rischio → costo → rollback → implementazione spezzata
```

Regola:

```text
Mai implementare subito un task livello 5.
```

---

## Matrice decisionale rapida

| Task | Livello | Modello/modalità | Note |
|---|---:|---|---|
| Cambiare testo bottone | 1 | Fast/Low | Prompt diretto |
| Sistemare spacing mobile | 1-2 | Fast/Medium | Un file |
| Migliorare card React | 2-3 | Medium | No backend |
| Debug useEffect | 3-4 | High/Planning | Prima analisi |
| Bug Supabase | 4 | Planning + forte | Read-only prima |
| Bug Spotify | 4 | Planning + forte | Attenzione auth/env |
| Nuova feature demo | 3-4 | Medium/High | Spezzare |
| Multi-locale | 5 | Forte + planning | Non implementare subito |
| Pitch commerciale | 2-3 | Medio | Non serve coding model forte |
| Deep dive docs | 3-4 | Forte se fonti tante | Citazioni |
| Checkpoint | 2 | Economico/medio | Output strutturato |
| QA patch | 2-3 | Medio | Read-only |
| Security review | 4-5 | Forte | Prudenza |
| Refactor grande | 5 | Forte + piano | Commit separati |

---

## Regola “Ferrari e pane”

Non usare una Ferrari per comprare il pane.

Traduzione:

```text
Non usare Opus/Sonnet Thinking/Pro per cambiare testo o spacing.
```

Ma anche:

```text
Non usare modello economico per architettura, auth, database o sicurezza.
```

Il risparmio non è usare sempre il modello economico.  
Il risparmio è usare il modello adeguato.

---

## Formula di scelta modello

Prima di scegliere modello, rispondi:

```text
1. Il task è reversibile?
2. Tocca codice stabile?
3. Tocca dati/API/auth?
4. Richiede ragionamento?
5. Richiede creatività?
6. Richiede fonti aggiornate?
7. Richiede molti file?
8. Richiede precisione alta?
9. Se sbaglia, quanto costa?
10. Posso spezzarlo?
```

Se molte risposte sono “sì”, serve modello più forte o workflow più controllato.

---

## Token saving non significa solo modello economico

I token si sprecano in 7 modi:

1. Contesto troppo lungo.
2. Modello troppo potente.
3. Prompt vago.
4. Tool inutili.
5. File letti inutilmente.
6. Output troppo lunghi.
7. Retry perché il task era mal preparato.

Quindi il token saving vero è:

```text
meno confusione → meno retry → meno contesto → meno costo
```

---

## Regola 1 — Riduci contesto prima di ridurre modello

Non partire sempre dal modello più economico.

Prima chiediti:

```text
Sto dando troppa roba al modello?
```

Esempio:

Task:

```text
Cambia bottone.
```

Contesto sbagliato:

```text
Tutta la storia Walbox.
```

Contesto giusto:

```text
File target + obiettivo + vincoli.
```

### Regola

> Un modello medio con contesto pulito batte spesso un modello forte con contesto sporco.

---

## Regola 2 — Usa read-only per evitare retry costosi

Per task incerti:

```text
Non modificare file.
Analizza e proponi.
```

Questo costa meno di:

```text
modifica sbagliata → debug → rollback → nuova modifica
```

### Prompt

```text
Modalità read-only.
Non modificare file.

Classifica il problema, indica file coinvolti, rischio e patch minima.
```

---

## Regola 3 — Spezza prima di aumentare modello

Se un task sembra enorme, non sempre serve modello più forte.  
Spesso serve dividerlo.

### Cattivo

```text
Crea loyalty system completo.
```

### Buono

```text
Step 1: crea schermata demo statica Profilo Walrus con dati finti.
Step 2: solo dopo valutiamo backend.
```

---

## Regola 4 — Usa cache/memoria per contesto ripetitivo

Prompt caching è pensato per riutilizzare contesto frequentemente usato e può ridurre costi e latenza su prompt lunghi. Anthropic ha pubblicato indicazioni e aggiornamenti sul prompt caching, inclusi risparmi rilevanti per contesti lunghi.

Per te, versione pratica:

```text
Non riscrivere sempre le stesse istruzioni.
Metti contesto stabile in file:
- CLAUDE.md
- PROJECT_CONTEXT.md
- SKILL.md
- PROMPT_LIBRARY.md
```

Anche quando non usi API caching diretto, il principio è lo stesso:

```text
riusare contesto stabile → meno token → meno errori
```

---

## Regola 5 — Usa `/clear` o nuova sessione quando cambi task

Claude Code Best Practices consiglia di gestire il contesto in modo aggressivo e ripulire tra task non collegati.

Per te:

```text
Non fare business, debug, pitch, UI, Supabase nella stessa sessione infinita.
```

Quando cambi completamente attività:

```text
crea checkpoint → nuova sessione → contesto minimo
```

---

## Regola 6 — Non allegare screenshot se non serve

Screenshot utile quando:

- problema visuale;
- layout;
- UI;
- TV screen;
- mobile;
- errore visibile;
- confronto design.

Screenshot inutile quando:

- devi cambiare testo;
- devi aggiornare docs;
- devi fare pitch;
- devi controllare log testuale;
- devi creare prompt;
- devi fare research.

### Regola

> Screenshot solo se il problema è visivo.

---

## Regola 7 — Non far leggere tutto il progetto

Per coding agent:

```text
Leggi solo i file necessari.
```

Prompt:

```text
Prima dimmi quali file devi leggere e perché.
Non esplorare l’intero progetto se non serve.
```

Per Walbox:

- UI task → file UI;
- Supabase bug → `walboxDb.js`, `App.jsx`, componente interessato;
- Spotify bug → `spotifyApi.js`, `api/search.js`, panel/test;
- routing bug → `App.jsx`, router config.

---

## Regola 8 — Usa output breve quando basta

Non chiedere deep dive per ogni cosa.

### Output breve

```text
Risposta breve:
- decisione;
- motivo;
- prompt finale.
```

### Output lungo

Solo per:

- file `.md`;
- deep dive;
- business strategy;
- architecture planning;
- source index.

---

## Regola 9 — Tool use costa contesto

La documentazione Anthropic pricing/tool use segnala che l’uso dei tool può aggiungere token di sistema e che risultati intermedi possono aumentare il contesto.

Per te:

```text
Non usare tool se basta ragionare.
Non leggere file se basta il nome.
Non fare web se il dato è già noto/stabile.
Non aprire 10 fonti se servono 3 ufficiali.
```

Però:

```text
usa web se il dato può essere cambiato o serve fonte aggiornata.
```

---

## Regola 10 — Thinking/Reasoning solo dove serve

Extended thinking o modelli Thinking sono utili per:

- architettura;
- bug complessi;
- sicurezza;
- pianificazione multi-step;
- analisi trade-off;
- Agent SDK/MCP;
- refactor difficili.

Sono spreco per:

- typo;
- traduzione breve;
- copy semplice;
- micro UI;
- checklist;
- messaggio WhatsApp semplice.

### Prompt

```text
Questo task non richiede ragionamento esteso.
Risposta breve e operativa.
```

oppure:

```text
Questo è un task complesso.
Usa planning approfondito, ma non implementare subito.
```

---

## Regola 11 — Il costo vero include retry

Un modello economico che sbaglia 4 volte costa più di un modello forte che risolve una volta.

Quindi:

```text
Per task critici, pagare modello forte può essere risparmio.
```

Esempio:

- bug env/Supabase in demo cliente → modello forte;
- testo bottone → modello economico.

---

## Regola 12 — Calcola costo task, non costo singola risposta

Ogni task ha costo totale:

```text
costo = ricerca + prompt + tool + output + retry + test + correzioni
```

Se usi prompt cattivo:

```text
risposta economica → errore → fix → altro errore → costo alto
```

Se usi workflow buono:

```text
read-only → patch minima → QA → costo minore
```

---

## Regola 13 — Usa il modello forte per creare template, poi riusa template con modelli economici

Esempio:

1. Modello forte crea `frontend-safe-edit`.
2. Poi usi quella skill con modello economico per micro UI.

Questo è molto efficiente.

### Formula

```text
investi su sistema → risparmi su ripetizione
```

---

## Regola 14 — Deep dive: pochi, buoni, riutilizzabili

Non fare deep dive ogni giorno sulla stessa cosa.

Deep dive buono produce:

- file `.md`;
- regole;
- template;
- prompt;
- checklist;
- decisioni.

Deep dive cattivo produce:

- chat lunga;
- nessun file;
- nessuna regola;
- nessun riuso.

---

## Regola 15 — Scegli modello anche in base al rischio umano

Se un errore ti fa perdere:

- demo cliente;
- codice stabile;
- soldi;
- dati;
- reputazione;
- tempo enorme;

usa modello forte + workflow controllato.

Se un errore è reversibile:

- typo;
- copy;
- layout piccolo;
- brainstorm;

usa modello economico.

---

## Mappa operativa per Antigravity

Regola salvata per te:

```text
Gemini 3 Flash Low = micro ritocchi/testi/colori/spacing
Gemini 3 Flash Medium = default per lavoro normale su un file
Gemini 3 Flash High = logica React/useEffect/bug moderati
Gemini 3.1 Pro = architettura, multi-file, feature grandi, bug seri
Claude Sonnet Thinking = bug difficili, debug multi-file, struttura/refactor
Claude Opus Thinking = emergenza/ragionamento molto complesso
GPT-OSS 120B Medium = backup
```

Nota:

- questa mappa è pratica per il tuo setup;
- va aggiornata quando cambiano modelli o quote;
- non è verità assoluta;
- il criterio resta: task → rischio → modello.

---

## Mappa operativa per Claude

In modo concettuale:

```text
Haiku / modello economico → velocità, task semplici, copy breve, micro
Sonnet / modello medio-forte → coding, analisi, workflow standard
Opus / modello forte → architettura, ragionamento complesso, planning critico
```

La documentazione modelli cambia nel tempo, quindi:

```text
controllare sempre Models Overview / Choosing Model / Pricing prima di decisioni economiche importanti.
```

---

## Mappa operativa per ChatGPT

Per questa Factory:

```text
ChatGPT Thinking → regia, deep dive, documentazione, strategia, ricerca, business
ChatGPT normale/veloce → traduzioni, copy breve, prompt veloci, micro task
```

Regola:

```text
Usa ChatGPT per preparare task e comprimere contesto.
Usa coding agent per modificare file.
```

---

## Token Saver Agent

Ruolo:

```text
scegliere modello, contesto e workflow minimi sufficienti.
```

### Prompt

```text
Agisci come Token Saver Agent.

Task:
[task]

Output:
1. livello task 1-5;
2. modello/modalità consigliata;
3. contesto minimo;
4. cosa evitare;
5. prompt finale;
6. rischio token;
7. se serve read-only prima.
```

### Esempio output

```text
Livello: 2.
Modalità: Fast Medium.
Contesto: solo CustomerJukeboxOldOrange.jsx.
Evita: screenshot, project history, Supabase docs.
Prompt: modifica solo file...
```

---

## Token budget checklist

Prima di task costoso:

```text
[ ] Il task è davvero necessario?
[ ] È MVP o roadmap?
[ ] Posso spezzarlo?
[ ] Posso fare read-only prima?
[ ] Ho contesto minimo?
[ ] Ho evitato screenshot inutili?
[ ] Ho scelto modello proporzionato?
[ ] Ho output format?
[ ] Ho test?
[ ] Ho stop condition?
[ ] Ho checkpoint precedente?
```

---

## Model selection checklist

```text
[ ] Task semplice o complesso?
[ ] Tocca codice?
[ ] Tocca dati/API?
[ ] Richiede fonti aggiornate?
[ ] Richiede creatività?
[ ] Richiede precisione?
[ ] Ha rischio business?
[ ] È reversibile?
[ ] Serve velocità?
[ ] Serve massima qualità?
[ ] Budget token limitato?
```

---

## Tabella: modello per agente

| Agente | Modello consigliato |
|---|---|
| Strategist Agent | Medio-forte |
| Research Agent | Medio-forte + web se serve |
| Product Manager Agent | Medio |
| Frontend Agent micro | Economico/Fast |
| Frontend Agent medio | Medio |
| Backend Agent | Forte se API/database |
| QA Agent | Medio, forte se critico |
| Sales Agent | Medio |
| Token Saver Agent | Economico/medio |
| Documentation Agent | Medio-forte se file grande |
| Security Agent | Forte |
| Walbox Specialist | Medio-forte |

---

## Tabella: contesto minimo per task Walbox

| Task Walbox | Contesto minimo |
|---|---|
| UI Customer | file CustomerJukeboxOldOrange + vincoli |
| UI TV | file LiveTvScreen + obiettivo visuale |
| Dashboard | ManagerDashboard + stato flusso |
| Supabase bug | walboxDb + App + componente coinvolto |
| Spotify search bug | spotifyApi + api/search |
| Spotify playback bug | spotifyApi + SpotifyTestPanel |
| Pitch | valore Walbox + cliente + obiezioni |
| Clone locale | brand cliente + cosa riusare + cosa cambiare |
| Checkpoint | stato + file + test |
| Deep dive docs | link ufficiali + obiettivo |

---

## Regola “MVP vs Roadmap” per token saving

Molti token si sprecano costruendo feature non urgenti.

Prima chiedi:

```text
Questa cosa serve alla demo imminente?
```

Se no:

```text
mettila in roadmap.
```

Esempio:

- Profilo Walrus fake → MVP demo utile;
- loyalty backend completo → roadmap;
- multi-locale vero → roadmap;
- TV screen stabile → MVP;
- social media pitch → MVP;
- analytics avanzata → roadmap.

---

## Prompt per decidere se vale spendere token

```text
Valuta se vale spendere token su questo task ora.

Task:
[task]

Rispondi:
1. è MVP o roadmap?
2. valore immediato;
3. rischio;
4. costo stimato basso/medio/alto;
5. modello consigliato;
6. alternativa più economica;
7. decisione: fare ora / rimandare.
```

---

## Prompt per ridurre contesto

```text
Riduci questo contesto al minimo utile per il prossimo agente.

Task:
[task]

Contesto lungo:
[contesto]

Output:
1. contesto minimo;
2. file necessari;
3. cosa rimuovere;
4. vincoli;
5. prompt finale.
```

---

## Prompt per scegliere modello

```text
Scegli modello/modalità per questo task.

Task:
[task]

Vincoli:
- budget token basso/medio/alto;
- rischio;
- urgenza;
- tool disponibili.

Output:
1. livello task;
2. modello/modalità;
3. perché;
4. contesto minimo;
5. workflow;
6. prompt.
```

---

## Prompt per spezzare task costoso

```text
Spezza questo task costoso in step più piccoli.

Task:
[task]

Output:
1. step 1 più piccolo e utile;
2. step 2;
3. step 3;
4. cosa rimandare;
5. quali step richiedono modello forte;
6. quali step possono usare modello economico.
```

---

## Prompt per prevenire retry

```text
Prima di eseguire questo task, identifica le 5 cause più probabili di errore e modifica il prompt/workflow per evitarle.
```

---

## Prompt per stimare costo operativo cliente

```text
Stima qualitativa costo operativo AI per questo progetto cliente.

Considera:
- setup iniziale;
- numero task agentici;
- deep dive;
- coding;
- QA;
- documentazione;
- manutenzione mensile;
- rischio retry.

Output:
basso/medio/alto + come ridurlo.
```

---

## Token saving per business

Quando vendi un servizio creato con AI, devi considerare:

```text
margine = prezzo cliente - tempo umano - costo tool - costo hosting - costo AI - manutenzione
```

Costo AI include:

- ChatGPT/Claude/Gemini subscriptions;
- API token se usi API;
- coding agent credits;
- tool usage;
- retry;
- deep research;
- supporto cliente.

### Regola

> Se non controlli token e tempo, il business sembra profittevole ma non lo è.

---

## Pricing interno per task

Classifica costo interno:

### Basso

- copy;
- micro UI;
- checkpoint;
- pitch;
- prompt.

### Medio

- componente;
- docs grandi;
- QA;
- ricerca;
- demo clone.

### Alto

- API/database;
- multi-file;
- bug complesso;
- architettura;
- integrazione esterna.

### Molto alto

- auth;
- pagamenti;
- multi-tenant;
- prodotto definitivo;
- automazioni agentiche;
- sicurezza.

---

## Regola per preventivi

Non vendere solo “tempo”.

Vendi valore, ma internamente stima:

```text
setup + AI/tool cost + hosting + manutenzione + margine
```

Esempio:

- demo personalizzata semplice → basso/medio costo interno;
- prodotto con loyalty e account → alto;
- multi-locale SaaS → molto alto.

---

## Context windows e 1M context

Le fonti Anthropic su context window indicano che contesti molto grandi sono possibili su alcuni modelli/configurazioni, ma più contesto non significa sempre migliore risultato.

Per te:

```text
Non usare finestra enorme come scusa per buttare dentro tutto.
```

### Regola

> Anche se hai 1M context, usa context engineering.

---

## Prompt caching: uso pratico per te

Se un domani usi API o sistemi agentici veri:

Prompt caching è utile per:

- istruzioni lunghe ripetute;
- project context;
- documentazione stabile;
- esempi;
- skill;
- tool specs.

Non è utile per:

- task sempre diversi;
- contesto piccolo;
- prompt brevi;
- materiale che cambia ogni volta.

### Regola

> Cache ciò che è stabile. Non cache ciò che è rumore.

---

## Tool token cost

L’uso di tool può aumentare token perché:

- tool definitions entrano nel contesto;
- risultati tool entrano nella conversazione;
- molti tool creano rumore;
- output intermedi possono essere lunghi.

### Regola

> Dai all’agente solo i tool necessari per il task.

Esempio:

- Sales Agent non ha bisogno di Edit/Bash.
- Frontend Agent non ha bisogno di database.
- Research Agent non ha bisogno di modificare file.
- QA Agent può essere read-only.

---

## MCP e token efficiency

Anthropic ha pubblicato materiale su MCP e code execution come modo per ridurre token in scenari con molti tool, perché alcune operazioni possono restare fuori dal contesto del modello.

Per te:

```text
MCP è roadmap.
```

Serve quando:

- hai molti tool;
- molti dati intermedi;
- automazioni ripetibili;
- agenti custom;
- workflow maturi.

Non serve ora per:

- demo Walbox;
- prompt manuali;
- piccoli task Antigravity;
- file `.md`.

---

## Extended thinking e budget

Extended thinking aumenta capacità per task complessi ma può aumentare costo/latency.

Usalo per:

- architettura;
- trade-off;
- debug difficile;
- sicurezza;
- multi-agent planning;
- business strategy importante.

Evitalo per:

- copy breve;
- micro UI;
- checklist;
- traduzioni;
- task già chiari.

### Prompt

```text
Usa reasoning approfondito solo per decidere il piano.
Output finale sintetico.
```

---

## Regola di verifica costo/qualità

Dopo task agentico, valuta:

```text
1. Ha risolto al primo colpo?
2. Ha usato troppo contesto?
3. Ha prodotto output troppo lungo?
4. Ha toccato file inutili?
5. Serviva modello più forte?
6. Bastava modello più economico?
7. Serve aggiornare skill/prompt?
```

---

## Token Saving Scorecard

```md
# Token Saving Scorecard

## Task
...

## Livello stimato
1-5

## Modello usato
...

## Era adeguato?
Sì/No

## Contesto fornito
...

## Contesto inutile
...

## Retry
0/1/2+

## Output troppo lungo?
Sì/No

## Errore evitabile?
...

## Regola nuova
...
```

---

## Esempi pratici Walbox

### Caso 1 — cambiare copy popup

Livello:

```text
1
```

Modalità:

```text
Fast/Low
```

Prompt:

```text
Modifica solo CustomerJukeboxOldOrange.jsx.
Cambia il testo del popup in: [...]
Non toccare altro.
```

---

### Caso 2 — migliorare mobile spacing

Livello:

```text
2
```

Modalità:

```text
Flash Medium / modello medio
```

Prompt:

```text
Modifica solo CustomerJukeboxOldOrange.jsx.
Migliora spacing mobile del blocco ricerca.
Non toccare logica, searchTrack, createSongRequest o Supabase.
```

---

### Caso 3 — richiesta non arriva in dashboard

Livello:

```text
4
```

Modalità:

```text
Planning + forte
```

Prompt:

```text
Modalità read-only.
Analizza flusso App.jsx → walboxDb.js → ManagerDashboard.jsx.
Non modificare file.
Output: causa probabile, patch minima, test.
```

---

### Caso 4 — nuovo locale

Livello:

```text
3-4
```

Modalità:

```text
Strategist/Product Manager + Frontend medio
```

Prima:

```text
business-validator + walbox-clone-adapter
```

Poi:

```text
frontend-safe-edit
```

Non:

```text
backend multi-tenant subito
```

---

### Caso 5 — loyalty completa

Livello:

```text
5
```

Modalità:

```text
Planning forte, non implementare
```

Decisione economica:

```text
roadmap, non demo immediata
```

---

## Sequenza ottimale per task costoso

```text
1. Token Saver Agent
2. Strategist/Product Manager
3. Read-only technical analysis
4. Piano in step
5. Implementazione step 1
6. QA
7. Checkpoint
8. Solo dopo step 2
```

---

## Sequenza ottimale per task semplice

```text
1. Prompt diretto
2. Patch
3. Test
4. Commit
```

---

## Anti-pattern principali

### 1. Modello forte sempre

Problema:

```text
bruci crediti.
```

### 2. Modello debole sempre

Problema:

```text
retry e bug.
```

### 3. Contesto infinito

Problema:

```text
costo alto + prestazioni peggiori.
```

### 4. Nessun checkpoint

Problema:

```text
ripeti contesto.
```

### 5. Deep dive senza artifact

Problema:

```text
spesa senza riuso.
```

### 6. Multi-agent per task micro

Problema:

```text
overhead > valore.
```

### 7. Tool ovunque

Problema:

```text
tool tokens + rumore.
```

---

## Regole operative finali

1. Classifica task da 1 a 5.
2. Scegli modello proporzionato.
3. Riduci contesto prima di partire.
4. Usa read-only per incertezza.
5. Spezza task costosi.
6. Usa memoria/skill per istruzioni ripetute.
7. Non allegare screenshot inutili.
8. Non caricare tutto il progetto.
9. Usa output breve quando basta.
10. Usa modello forte dove l’errore costa caro.
11. Crea checkpoint dopo step buoni.
12. Aggiorna skill se il modello sbaglia.
13. Misura costo totale, non singola risposta.
14. Separare MVP da roadmap.
15. Valuta se il task crea valore cliente.

---

## Prompt master finale

```text
Agisci come Token Saver Agent per la AI Business Factory.

Task:
[task]

Contesto:
[contesto opzionale]

Rispondi con:
1. livello task 1-5;
2. rischio;
3. modello/modalità consigliata;
4. contesto minimo;
5. cosa evitare;
6. workflow consigliato;
7. prompt finale ottimizzato;
8. se serve read-only prima;
9. se è MVP o roadmap.
```

---

## File generati da questo documento

Questo file porta alla creazione futura di:

```text
TOKEN_SAVER_AGENT.md
MODEL_SELECTION_MATRIX.md
TOKEN_SAVING_CHECKLIST.md
TASK_LEVELS.md
COST_ESTIMATION_NOTES.md
AI_TOOL_COST_MODEL.md
WALBOX_TOKEN_RULES.md
```

---

## Completezza stimata

Completezza attuale: 91%

### Coperto bene

- scelta modello;
- livelli task;
- token saving;
- contesto minimo;
- prompt caching concettuale;
- context window;
- tool token cost;
- extended thinking;
- Antigravity model strategy;
- Claude model strategy;
- ChatGPT usage;
- business cost;
- Walbox examples;
- scorecard;
- checklist;
- prompt master;
- MVP vs roadmap.

### Da approfondire nei file dedicati

- prezzi numerici aggiornati per modello;
- calcolo API reale per progetto;
- subscription vs API credits;
- Claude Code plan limits;
- Google AI Pro/Antigravity quote reali;
- pricing Gemini;
- pricing OpenAI;
- hosting cost Vercel/Supabase;
- cost model per clienti;
- prompt caching implementazione API;
- MCP/code execution implementazione;
- monitoring cost dashboard.

---

## Prossimo file consigliato

```text
09_CONTEXT_ENGINEERING.md
```

Perché dopo modello e token, il tema più importante è decidere cosa entra nel contesto, cosa resta fuori, cosa diventa memoria e cosa va archiviato.

<!-- END_SOURCE_FILE: 08_MODEL_SELECTION_AND_TOKEN_SAVING.md -->


<!-- BEGIN_SOURCE_FILE: 09_CONTEXT_ENGINEERING.md -->
<!-- SOURCE_SHA256_UTF8: 68ebb7403059ca68a71d2e0e7eeeb732ddb18e2fbc631e61b8f7228e3c67c605 -->
<!-- SOURCE_CHAR_COUNT: 31608 -->

# 09_CONTEXT_ENGINEERING.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Context & Memory  
Completezza stimata: 92%

---

## Scopo del file

Questo file definisce come gestire il **contesto** nella tua AI Business Factory.

L’obiettivo è evitare che ChatGPT, Claude, Antigravity o altri agenti AI lavorino con:

- troppo contesto;
- contesto sbagliato;
- contesto vecchio;
- contesto duplicato;
- chat infinite;
- file enormi;
- documentazione grezza;
- screenshot inutili;
- roadmap mischiate;
- idee future confuse;
- memoria sporca;
- tool inutili.

La regola centrale:

> La qualità dell’agente dipende dalla qualità del contesto che gli dai.

---

## Fonti ufficiali usate

Fonti principali:

1. Effective Context Engineering for AI Agents — Anthropic Engineering  
   https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

2. Context windows — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/context-windows

3. Claude Code Best Practices — Manage context aggressively  
   https://www.anthropic.com/engineering/claude-code-best-practices

4. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

5. Claude Code Costs / Manage costs effectively  
   https://docs.anthropic.com/en/docs/claude-code/costs

6. Prompt caching — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching

7. Code Execution with MCP  
   https://www.anthropic.com/engineering/code-execution-with-mcp

8. Effective Harnesses for Long-running Agents  
   https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

9. Harness Design for Long-running Apps  
   https://www.anthropic.com/engineering/harness-design-long-running-apps

10. Building Agents with the Claude Agent SDK  
    https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

11. Create custom subagents — Claude Code Docs  
    https://docs.anthropic.com/en/docs/claude-code/sub-agents

12. Claude Code Skills  
    https://docs.anthropic.com/en/docs/claude-code/skills

13. Equipping agents for the real world with Agent Skills  
    https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

14. Multi-agent Research System  
    https://www.anthropic.com/engineering/multi-agent-research-system

15. Contextual Retrieval in AI Systems  
    https://www.anthropic.com/engineering/contextual-retrieval

16. Prompting Best Practices  
    https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/multishot-prompting

17. How we contain Claude across products  
    https://www.anthropic.com/engineering/how-we-contain-claude

18. Demystifying evals for AI agents  
    https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

---

## Sintesi brutale

Context engineering significa:

```text
scegliere, organizzare, mantenere e aggiornare l’informazione giusta nel momento giusto.
```

Non è solo “riassumere”.

È decidere:

- cosa entra nel prompt;
- cosa sta nella memoria;
- cosa sta nei file progetto;
- cosa diventa skill;
- cosa diventa checkpoint;
- cosa resta archivio;
- cosa va escluso;
- cosa va recuperato solo quando serve;
- cosa non deve essere portato nel contesto.

La domanda chiave è:

> Questa informazione aiuta il prossimo task?

Se sì, entra nel contesto giusto.  
Se no, resta fuori.

---

## Perché il contesto è il vero problema

Tu hai già visto il problema:

- chat lunghissime;
- mille idee Walbox;
- codice;
- screenshot;
- fonti;
- roadmap;
- business;
- prompt;
- Antigravity;
- Claude;
- Supabase;
- Spotify;
- Vercel;
- AI agents;
- documentazione;
- token;
- meeting con locali.

Se butti tutto insieme nel modello, succede questo:

```text
Il modello capisce troppo e male.
```

Il risultato:

- output troppo lungo;
- task espanso;
- token sprecati;
- modifica file sbagliati;
- perde priorità;
- confonde MVP e roadmap;
- ripete cose già decise;
- porta vecchi bug nel presente;
- non sa cosa è stabile.

Context engineering serve a trasformare tutto questo in un sistema.

---

## Regola madre

```text
Non dare più contesto. Dai contesto migliore.
```

---

## Il modello mentale: 5 livelli di contesto

### Livello 1 — Prompt immediato

Quello che scrivi nel messaggio corrente.

Deve contenere:

- ruolo;
- task;
- contesto minimo;
- vincoli;
- output;
- test.

Esempio:

```text
Modifica solo LiveTvScreen.jsx.
Obiettivo: migliorare box IN CODA.
Non toccare Spotify/Supabase/App.jsx.
```

---

### Livello 2 — Memoria attiva

Contesto stabile caricato spesso.

Esempi:

```text
CLAUDE.md
PROJECT_CONTEXT.md
AI_BUSINESS_FACTORY_MEMORY.md
```

Deve contenere:

- stato stabile;
- stack;
- file critici;
- regole di lavoro;
- cosa non toccare;
- priorità corrente.

---

### Livello 3 — Skill / Workflow

Procedura riutilizzabile.

Esempi:

```text
frontend-safe-edit
token-saver
qa-review
safe-backend-change
```

Contiene:

- come fare quel tipo di task;
- cosa evitare;
- output atteso;
- checklist.

---

### Livello 4 — Reference selezionabile

Documenti che non servono sempre, ma sono utili quando richiesti.

Esempi:

```text
OFFICIAL_SOURCES_INDEX.md
ARCHITECTURE.md
ROADMAP.md
BUSINESS_NOTES.md
SPOTIFY_NOTES.md
SUPABASE_NOTES.md
```

---

### Livello 5 — Archivio

Materiale grezzo o storico.

Esempi:

```text
chat complete
screenshot vecchi
transcript video
vecchi output
log terminali
ricerche non sintetizzate
idee future non selezionate
```

Non deve entrare nel contesto attivo se non serve.

---

## Tabella: dove mettere cosa

| Informazione | Dove va |
|---|---|
| Stato stabile progetto | `CLAUDE.md` / `PROJECT_CONTEXT.md` |
| File critici | `CLAUDE.md` |
| Roadmap futura | `ROADMAP.md` |
| Bug risolto | Checkpoint / changelog |
| Bug aperto | `PROJECT_CONTEXT.md` + checkpoint |
| Prompt utile | `PROMPT_LIBRARY.md` |
| Procedura ripetibile | Skill / Workflow |
| Fonte ufficiale | `OFFICIAL_SOURCES_INDEX.md` + file dedicato |
| Screenshot vecchio | Archivio |
| Video appunti grezzi | Archivio → compressione |
| Meeting cliente | `CLIENT_CONTEXT.md` |
| Idee future | Roadmap, non memoria attiva |
| Log terminale | solo estratto rilevante |
| Codice intero | solo se serve al task |

---

## Context engineering vs memoria

### Context engineering

È la strategia generale:

```text
cosa dare al modello e quando.
```

### Memoria

È una parte del contesto:

```text
cosa deve restare disponibile tra sessioni.
```

Quindi:

```text
Memoria ⊂ Context Engineering
```

---

## Context engineering vs prompt engineering

### Prompt engineering

Lavora sulla richiesta immediata.

### Context engineering

Lavora sull’ambiente informativo complessivo.

Esempio:

Prompt buono ma contesto cattivo:

```text
Modifica solo file X
```

ma nel contesto ci sono 20 vecchie istruzioni contraddittorie.

Risultato: confusione.

### Regola

> Prompt buono + contesto sporco = risultato incerto.

---

## Context engineering vs retrieval

Retrieval significa recuperare informazioni da file/fonti.

Context engineering decide:

- quali informazioni recuperare;
- quando;
- quante;
- in che formato;
- cosa scartare;
- cosa mantenere.

### Regola

> Retrieval prende materiale. Context engineering decide cosa è utile.

---

## Le 4 operazioni del context engineering

### 1. Select

Scegli cosa serve.

### 2. Compress

Riassumi senza perdere decisioni.

### 3. Structure

Organizza in sezioni utili.

### 4. Refresh

Aggiorna quando cambia lo stato.

---

## Operazione 1 — Select

Prima domanda:

```text
Qual è il task?
```

Poi:

```text
Quale contesto serve davvero per questo task?
```

### Esempio Walbox UI

Task:

```text
Migliorare bottone mobile.
```

Contesto utile:

- file `CustomerJukeboxOldOrange.jsx`;
- palette brand;
- vincolo non toccare logica.

Contesto inutile:

- storia completa Supabase;
- pitch business;
- roadmap loyalty;
- meeting SMM;
- MCP;
- Agent SDK.

---

## Operazione 2 — Compress

Compressione buona non è “fare corto”.

È mantenere:

- decisioni;
- stato stabile;
- vincoli;
- bug aperti;
- file critici;
- prossimo step.

E rimuovere:

- ripetizioni;
- conversazioni;
- emozioni;
- vecchi tentativi;
- dettagli irrilevanti;
- output lunghi.

### Prompt

```text
Comprimi questo contesto per un agente coding.

Mantieni:
- obiettivo;
- stato stabile;
- file target;
- vincoli;
- cosa non toccare;
- test.

Rimuovi:
- roadmap futura;
- discussioni lunghe;
- vecchi bug risolti;
- dettagli non collegati.
```

---

## Operazione 3 — Structure

Il contesto deve essere leggibile.

Formato consigliato:

```md
## Project
...

## Current stable state
...

## Task
...

## Files involved
...

## Constraints
...

## Do not touch
...

## Verification
...

## Next step
...
```

### Regola

> Contesto non strutturato = rumore.

---

## Operazione 4 — Refresh

Il contesto scade.

Esempio:

Vecchio:

```text
Queue salvata in localStorage.
```

Nuovo:

```text
Queue salvata in Supabase Realtime.
```

Se non aggiorni, l’agente lavora sul passato.

### Quando aggiornare

- dopo deploy;
- dopo bugfix;
- dopo cambio architettura;
- dopo presentazione cliente;
- dopo nuova decisione;
- dopo cambio stack;
- dopo errore importante.

---

## Il problema del contesto vecchio

Contesto vecchio è più pericoloso di nessun contesto.

Perché il modello lo tratta come vero.

### Esempio

Se `PROJECT_CONTEXT.md` dice:

```text
ManagerDashboard va migliorata.
```

ma tu hai deciso:

```text
ManagerDashboard non va più toccata perché funziona.
```

l’agente può rompere uno stato stabile.

### Regola

> Aggiorna memoria dopo ogni “non toccare più”.

---

## Active context vs archive

### Active context

Serve per lavorare ora.

Deve essere:

- breve;
- aggiornato;
- operativo;
- selezionato;
- testabile.

### Archive

Serve per consultare storia.

Può essere:

- lungo;
- grezzo;
- storico;
- non sempre aggiornato.

### Regola

> Non portare archivio nel contesto attivo.

---

## I 3 documenti centrali

### 1. `CLAUDE.md`

Per agenti/coding.

Contiene:

- istruzioni tecniche;
- file critici;
- workflow;
- stato stabile;
- do not touch.

### 2. `PROJECT_CONTEXT.md`

Per quadro generale.

Contiene:

- visione;
- business;
- roadmap;
- stato progetto;
- decisioni.

### 3. `CHECKPOINT.md`

Per ripartire.

Contiene:

- stato specifico dopo uno step;
- file modificati;
- cosa funziona;
- test;
- prossimo step.

---

## Template contesto task

```md
# Task Context

## Project
[progetto]

## Current stable state
[cosa funziona]

## Task
[cosa fare]

## File target
[file]

## Constraints
[vincoli]

## Do not touch
[file/aree]

## Verification
[test]

## Stop condition
[quando fermarsi]
```

---

## Esempio contesto task Walbox

```md
# Task Context

## Project
Walbox / Walrus Social Jukebox.

## Current stable state
Supabase Realtime funziona tra telefono, dashboard e TV.
Spotify search funziona via endpoint Vercel.
ManagerDashboard è stabile e non va modificata.

## Task
Migliorare leggibilità bottone invio su mobile.

## File target
src/pages/CustomerJukeboxOldOrange.jsx

## Constraints
UI only.
Preservare logica di invio richiesta.

## Do not touch
App.jsx
walboxDb.js
spotifyApi.js
api/search.js
ManagerDashboard.jsx
LiveTvScreen.jsx
Supabase schema
Spotify auth flow

## Verification
npm run build
test da telefono: ricerca, seleziona canzone, invia richiesta.
```

---

## Context budget

Per ogni task, decidi budget contesto:

### Budget piccolo

Micro task:

- file;
- riga/sezione;
- vincolo.

### Budget medio

Task UI/logica leggera:

- file;
- stato stabile;
- vincoli;
- test.

### Budget grande

Task complesso:

- checkpoint;
- file multipli;
- architettura;
- bug;
- log rilevanti;
- piano;
- rollback.

### Budget enorme

Solo per:

- deep dive;
- architettura;
- source index;
- documentazione grande;
- migration planning.

---

## La regola “meno ma meglio”

Non dire:

```text
Ti do tutto così capisci meglio.
```

Di’:

```text
Ti do solo ciò che serve per questo task.
```

### Perché

Contesto enorme può:

- aumentare costo;
- aumentare latenza;
- distrarre;
- generare conflitti;
- far emergere vecchie priorità;
- aumentare output non richiesti.

---

## Context poisoning operativo

Context poisoning non è solo sicurezza.  
È anche quando informazioni sbagliate o vecchie contaminano il task.

Esempi:

- vecchio bug risolto;
- roadmap non prioritaria;
- istruzioni contraddittorie;
- file da non toccare che invece sembrano target;
- screenshot vecchio;
- appunti cliente non verificati;
- fonte non ufficiale trattata come ufficiale.

### Regola

> Ogni contesto deve avere data, stato e validità.

---

## Date e validità

Ogni checkpoint deve avere data.

Ogni fonte dovrebbe avere:

- link;
- data se disponibile;
- quando è stata controllata;
- se può cambiare.

Esempio:

```md
Fonte: Claude Code Best Practices
Controllata: 2026-06-02
Tipo: ufficiale Anthropic
Stabilità: media, può cambiare con nuove release.
```

---

## Context engineering per fonti ufficiali

Non incollare fonti intere.

Processo:

```text
Fonte ufficiale → sintesi → regole → file dedicato → prompt/template
```

### Output corretto

```md
## Fonte
Claude Code Memory

## Cosa dice
CLAUDE.md fornisce contesto progettuale.

## Regola estratta
CLAUDE.md guida l’agente ma non blocca azioni; per blocchi servono hooks/permissions/review.

## File collegato
04_CLAUDE_MEMORY_AND_CONTEXT.md
```

---

## Context engineering per video/screenshot

Video/screenshot sono materiale grezzo.

Processo:

```text
screenshot/video → concetto utile → regola → workflow/file
```

### Prompt

```text
Analizza questo screenshot/video.
Estrai solo:
1. concetto utile;
2. regola operativa;
3. file .md da aggiornare;
4. cosa ignorare.
```

---

## Context engineering per codice

Non far leggere tutto il repo.

Processo:

```text
task → file probabili → read-only → patch minima
```

Prompt:

```text
Prima dimmi quali file devi leggere e perché.
Non esplorare file non collegati.
```

### Per Walbox

| Task | File |
|---|---|
| UI cliente | `CustomerJukeboxOldOrange.jsx` |
| UI TV | `LiveTvScreen.jsx` |
| Dashboard | `ManagerDashboard.jsx` |
| Queue | `App.jsx`, `walboxDb.js` |
| Spotify search | `spotifyApi.js`, `api/search.js` |
| Routing | `App.jsx` |
| Brand/copy | componente UI target |

---

## Context engineering per agenti

Ogni agente deve ricevere contesto diverso.

### Strategist Agent

Serve:

- idea;
- target;
- vincoli;
- obiettivo business.

Non serve:

- codice.

### Frontend Agent

Serve:

- file UI;
- brand;
- vincoli;
- test.

Non serve:

- pricing;
- roadmap futura;
- meeting cliente.

### Backend Agent

Serve:

- flusso dati;
- file servizi;
- env/schema;
- errori/log.

Non serve:

- UI copy;
- pitch.

### QA Agent

Serve:

- diff;
- task originale;
- stato stabile;
- test.

Non serve:

- tutta codebase.

### Sales Agent

Serve:

- cliente;
- valore;
- obiezioni;
- demo.

Non serve:

- codice.

---

## Context engineering per multi-agent

La ricerca multi-agent funziona meglio quando ogni agente ha un sotto-task distinto.

Esempio:

```text
Agent A: fonti ufficiali Claude.
Agent B: competitor.
Agent C: pricing.
Agent D: rischi.
Lead Agent: sintesi.
```

Ma ogni agente non deve ricevere tutto.

### Regola

> Ogni sub-agent riceve solo il contesto del suo sotto-task.

---

## Lead agent context

Se usi più agenti, il lead agent deve ricevere:

- obiettivo generale;
- output sintetici dei sub-agents;
- fonti;
- conflitti;
- decisione finale.

Non deve ricevere:

- tutti i raw dump dei sub-agents;
- pagine intere;
- log completi;
- duplicati.

---

## Context engineering per long-running agents

Le fonti su long-running agents indicano che gli agenti devono lavorare su più finestre di contesto e usare harness/checkpoint/artifact.

Per te:

```text
Nessun task lungo senza checkpoint intermedi.
```

Workflow:

```text
Goal → Step 1 → Verify → Checkpoint → Step 2 → Verify → Checkpoint
```

### Regola

> Un agente lungo senza checkpoint diventa cieco.

---

## Artifact come memoria esterna

I file `.md` sono memoria esterna.

Esempi:

- `03_CLAUDE_CODE_BEST_PRACTICES.md`;
- `04_CLAUDE_MEMORY_AND_CONTEXT.md`;
- `05_AGENT_ROLES_AND_SUBAGENTS.md`.

Questi file servono perché:

```text
non devi tenere tutto nella chat.
```

---

## Context engineering e filesystem

Agenti con filesystem possono leggere file quando servono.

Questo cambia la strategia:

```text
Non tutto deve stare nel prompt.
Può stare in file ben organizzati.
```

Ma attenzione:

```text
Se i file sono troppi e disordinati, il problema si sposta dal prompt al filesystem.
```

### Regola

> File organizzati = contesto scalabile.  
> File disordinati = rumore persistente.

---

## Cartella consigliata per AI Business Factory

```text
AI_BUSINESS_FACTORY/
│
├── 00_START_HERE.md
├── 01_OFFICIAL_SOURCES_INDEX.md
│
├── CORE/
│   ├── MEMORY.md
│   ├── CONTEXT_ENGINEERING.md
│   ├── TOKEN_RULES.md
│   └── PROMPT_RULES.md
│
├── AGENTS/
│   ├── STRATEGIST.md
│   ├── FRONTEND.md
│   ├── QA.md
│   └── TOKEN_SAVER.md
│
├── SKILLS/
│   ├── frontend-safe-edit/
│   ├── walbox-dev/
│   └── pitch-builder/
│
├── PROJECTS/
│   └── WALBOX/
│       ├── PROJECT_CONTEXT.md
│       ├── CLAUDE.md
│       ├── CHECKPOINTS.md
│       └── CLIENT_CONTEXT.md
│
└── ARCHIVE/
    ├── raw_notes/
    ├── transcripts/
    ├── screenshots/
    └── old_outputs/
```

---

## Context refresh routine

Ogni volta che finisci una sessione:

```text
1. Cosa è cambiato?
2. Cosa funziona ora?
3. Quali file sono stati toccati?
4. Cosa non va più toccato?
5. Quali bug restano?
6. Qual è il prossimo step?
7. Quale memoria va aggiornata?
8. Cosa va in archivio?
```

### Prompt

```text
Fai context refresh.

Materiale:
[sessione]

Output:
1. update per memoria attiva;
2. checkpoint;
3. elementi da archiviare;
4. elementi da eliminare dal contesto;
5. prossimo step.
```

---

## Context compression template

```md
# Compressed Context

## Project
...

## Current stable state
...

## Last completed step
...

## Critical decisions
...

## Files changed
...

## Do not touch
...

## Open issues
...

## Next step
...

## Useful restart prompt
...
```

---

## Restart prompt template

```text
Riparti da questo contesto compresso.

Prima:
1. conferma cosa è stabile;
2. indica cosa non va toccato;
3. proponi un solo prossimo step;
4. genera prompt sicuro per l’agente giusto.

Non proporre roadmap extra.
```

---

## Walbox compressed context esempio

```md
# Compressed Context — Walbox

## Project
Walbox / Walrus Social Jukebox per locali.

## Current stable state
Vercel deploy funzionante.
Supabase Realtime sincronizza richieste tra telefono, dashboard e TV.
Spotify search/playback testati.
Live TV mostra now playing reale.
ManagerDashboard stabile.

## Critical decisions
Non toccare ManagerDashboard/App.jsx/walboxDb.js/spotifyApi.js senza motivo.
Walbox è demo/pilota, non prodotto definitivo.
Social experience è il posizionamento.

## Next step
Polish UI specifico su un file o preparazione pitch/demo.

## Useful prompt
Modifica solo [file]. Non toccare Supabase/Spotify/App.jsx. Patch minima e test.
```

---

## Context engineering per Walbox roadmap

Dividi:

### Active

- demo stabile;
- prossima modifica;
- file critici;
- pitch imminente.

### Near roadmap

- Profilo Walrus fake;
- polish TV;
- demo altro locale;
- one-page.

### Future

- loyalty vera;
- tourist mode;
- meme generator;
- conti aperti;
- multi-tenant;
- analytics;
- payments.

### Archive

- vecchie varianti non usate;
- discussioni lunghe;
- screenshot storici;
- prove fallite.

---

## Context engineering e “idea overload”

Quando hai troppe idee:

```text
non metterle tutte nel prompt coding.
```

Metti in:

```text
ROADMAP_IDEAS.md
```

Con categorie:

```md
## Now
...

## Next
...

## Later
...

## Maybe
...

## Not now
...
```

### Regola

> Le idee future devono essere parcheggiate, non mescolate al task tecnico.

---

## Context engineering per business

Per vendere a un cliente servono contesti diversi:

### Pitch context

- problema cliente;
- valore;
- demo;
- CTA;
- obiezioni.

### Pricing context

- setup;
- canone;
- costi;
- margine;
- complessità.

### Product context

- feature;
- stack;
- roadmap;
- limiti.

Non mischiare tutto.

---

## Context engineering per cliente

Template `CLIENT_CONTEXT.md`:

```md
# CLIENT_CONTEXT.md

## Cliente

## Tipo attività

## Problema percepito

## Cosa gli piace

## Obiezioni

## Linguaggio da usare

## Linguaggio da evitare

## Feature demo

## Feature future

## Prezzo ipotetico

## Prossimo messaggio
```

### Regola

> Il Sales Agent non deve leggere tutto il codice. Deve leggere `CLIENT_CONTEXT.md`.

---

## Context engineering per research

Deep dive buono:

```text
fonti → sintesi → regole → file
```

Deep dive cattivo:

```text
fonti → chat lunga → niente riuso
```

### Research output template

```md
## Fonte
...

## Affidabilità
...

## Cosa dice
...

## Utilità
...

## Regola
...

## File da aggiornare
...

## Cosa resta incerto
...
```

---

## Context engineering per prompt library

Non salvare ogni prompt.

Salva solo:

- prompt che funzionano;
- prompt riutilizzabili;
- prompt che evitano errori;
- prompt per task ricorrenti;
- prompt per agenti.

Archivia o elimina:

- prompt falliti;
- prompt duplicati;
- prompt troppo specifici;
- prompt lunghi non riusabili.

---

## Context engineering per errors

Ogni errore va trasformato in regola.

Esempio:

Errore:

```text
Agente ha modificato App.jsx durante polish UI.
```

Regola:

```text
Durante frontend-safe-edit non modificare App.jsx. Fermati se pensi serva.
```

Dove va:

```text
frontend-safe-edit/SKILL.md
CLAUDE.md
SAFE_WORKFLOWS.md
```

Non serve conservare tutta la chat dell’errore.

---

## Context engineering per logs

Log terminale spesso è enorme.

Non incollare tutto se non serve.

Processo:

```text
errore principale → stack trace rilevante → comando eseguito → contesto file
```

Prompt:

```text
Analizza questo errore.
Uso solo log rilevante.
Non modificare file.
Dimmi causa e patch minima.
```

---

## Context engineering per screenshots

Screenshot utile se:

- UI;
- layout;
- errore visuale;
- confronto design;
- mobile/TV.

Screenshot inutile se:

- task è testuale;
- hai già il codice;
- serve solo cambiare copy;
- serve research;
- serve pitch.

Se usi screenshot:

```text
aggiungi sempre cosa vuoi che l’agente guardi.
```

Esempio:

```text
Guarda solo il box IN CODA e la leggibilità da TV.
Ignora il resto.
```

---

## Context engineering per tool definitions

Con molti tool, le definizioni occupano contesto.

Regola:

```text
Dai all’agente solo i tool necessari.
```

Esempi:

- Research Agent: web/search, no edit.
- QA Agent: read-only.
- Frontend Agent: read/edit file target.
- Backend Agent: read/edit servizi, eventualmente terminale.
- Sales Agent: nessun tool code.

---

## Context engineering per MCP

MCP può dare accesso a molti tool/server.  
Il rischio è caricare troppe tool definitions.

Le fonti Anthropic su code execution con MCP evidenziano che molti tool nel contesto possono rallentare e aumentare costi.

Per te:

```text
MCP è utile più avanti, ma solo con tool ben organizzati.
```

Regola:

```text
Non collegare 20 tool se l’agente ne usa 2.
```

---

## Context engineering e skills

Skills possono usare “progressive disclosure”: non tutto il contenuto deve entrare subito nel contesto.

Principio operativo:

```text
La skill deve dare istruzioni immediate e riferire a materiale più dettagliato solo se serve.
```

Esempio:

`walbox-dev/SKILL.md`:

- subito: file critici, regole;
- references: architettura, roadmap, pitch.

---

## Context engineering e sub-agents

Sub-agents migliorano context management perché isolano compiti.

Esempio:

- Research Agent legge fonti.
- Frontend Agent legge solo file UI.
- QA Agent legge diff.
- Sales Agent legge client context.

### Regola

> Sub-agent = contesto isolato per ruolo.

---

## Context engineering e evals

Per sapere se il contesto è buono, devi valutare outcome.

Domande:

```text
L’agente ha seguito scope?
Ha toccato file giusti?
Ha ignorato rumore?
Ha chiesto chiarimento inutile?
Ha prodotto output utile?
Ha richiesto retry?
```

Se fallisce, problema possibile:

- prompt;
- modello;
- skill;
- contesto;
- tool;
- task troppo largo.

---

## Context Quality Scorecard

```md
# Context Quality Scorecard

## Task
...

## Contesto dato
...

## Era sufficiente?
Sì/No

## Era troppo?
Sì/No

## Informazioni mancanti
...

## Informazioni inutili
...

## Vecchie info presenti
...

## Output dell’agente
...

## Retry necessari
...

## Regola da aggiornare
...
```

---

## Context diet

Ogni tanto fai dieta del contesto.

### Domande

```text
Quali file .md sono troppo lunghi?
Quali sezioni sono duplicate?
Quali regole non servono più?
Quali roadmap sono finite in memoria attiva?
Quali note vanno archiviate?
```

### Prompt

```text
Fai context diet di questo file.

Output:
1. sezioni da tenere;
2. sezioni da accorciare;
3. sezioni da spostare in archivio;
4. duplicati;
5. versione più operativa.
```

---

## Context versioning

Ogni file importante deve avere:

```text
Versione
Data
Completezza
Fonti
Cosa manca
```

Perché?

- sai se è fresco;
- sai se va aggiornato;
- sai cosa è coperto;
- eviti fiducia falsa.

---

## Context freshness

Alcune informazioni cambiano:

- pricing;
- modelli;
- docs tool;
- API;
- limiti piani;
- normative;
- servizi;
- product release notes.

Per queste:

```text
serve web check periodico.
```

Informazioni più stabili:

- workflow interno;
- regole Walbox;
- pitch;
- file critici;
- checkpoint passato.

---

## Context engineering per documenti ufficiali mutevoli

Per docs che cambiano:

```md
## Fonte
...

## Controllata il
2026-06-02

## Stabilità
Bassa/media/alta

## Va ricontrollata quando
- cambia modello;
- cambia pricing;
- cambio piano;
- nuova release.
```

---

## Prompt master context engineering

```text
Agisci come Context Engineer.

Task:
[task]

Materiale disponibile:
[materiale]

Output:
1. contesto minimo da dare all’agente;
2. contesto da NON dare;
3. file/memoria da usare;
4. skill/agente consigliato;
5. prompt finale;
6. cosa archiviare;
7. checkpoint da aggiornare.
```

---

## Prompt master per nuova sessione

```text
Prepara contesto per nuova sessione.

Progetto:
[progetto]

Obiettivo prossimo:
[obiettivo]

Materiale:
[checkpoint/appunti]

Output:
1. contesto attivo breve;
2. file critici;
3. do not touch;
4. prompt iniziale;
5. cosa ignorare.
```

---

## Prompt master per fine sessione

```text
Chiudi questa sessione.

Output:
1. cosa è stato fatto;
2. stato stabile;
3. file modificati;
4. test;
5. decisioni;
6. cosa non toccare;
7. prossimo step;
8. update memoria;
9. archivio.
```

---

## Regola “one next step”

Ogni contesto attivo deve chiudere con un prossimo step singolo.

Non:

```text
Poi facciamo loyalty, pitch, turist mode, refactor, dashboard, multi-locale.
```

Sì:

```text
Prossimo step: creare prompt per polish mobile CustomerJukeboxOldOrange.
```

### Perché

Gli agenti lavorano meglio quando la direzione è una.

---

## Regola “se non serve ora, archivio”

Ogni informazione deve essere classificata:

```text
serve ora
serve presto
serve forse
serve mai
```

Solo “serve ora” entra nel contesto attivo.

---

## Applicazione alla AI Business Factory

La Factory stessa ha bisogno di context engineering.

### Active now

- creare file `.md`;
- fonti ufficiali Claude;
- percentuale completezza;
- deep dive;
- struttura V1.

### Near

- Antigravity docs;
- Gemini docs;
- Supabase/Vercel;
- template reali skills;
- agent files.

### Later

- MCP;
- Agent SDK;
- hooks avanzati;
- pricing SaaS;
- multi-client.

### Archive

- vecchie chat;
- output intermedi;
- screenshot non usati;
- fonti secondarie.

---

## Applicazione a Walbox

### Active context Walbox

```text
Demo Vercel stabile.
Supabase Realtime funziona.
Spotify search/playback funziona.
ManagerDashboard stabile.
LiveTvScreen funziona.
CustomerJukeboxOldOrange è area mobile.
Non toccare core senza motivo.
```

### Near context Walbox

```text
Polish mobile.
Pitch.
Demo altro locale.
Profilo Walrus fake.
TV screen wow ma stabile.
```

### Future context Walbox

```text
loyalty backend;
tourist mode;
meme generator;
conti aperti;
multi-tenant;
analytics;
payments.
```

---

## Checklist prima di dare contesto a un agente

```text
[ ] Qual è il task?
[ ] Quale agente lo farà?
[ ] Quale skill serve?
[ ] Quali file servono?
[ ] Quali file non servono?
[ ] Qual è lo stato stabile?
[ ] Cosa non deve toccare?
[ ] Quale test verifica?
[ ] C’è contesto vecchio da rimuovere?
[ ] C’è una sola prossima azione?
```

---

## Checklist dopo output agente

```text
[ ] Ha usato il contesto giusto?
[ ] Ha ignorato contesto irrilevante?
[ ] Ha seguito vincoli?
[ ] Ha chiesto info che erano già nel contesto?
[ ] Ha usato info vecchie?
[ ] Ha prodotto output troppo lungo?
[ ] Serve aggiornare memoria?
[ ] Serve archiviare materiale?
```

---

## Anti-pattern principali

### 1. “Ti do tutto”

Troppo contesto.

### 2. “Te lo spiego da capo ogni volta”

Spreco token.

### 3. “Tengo tutto in una chat”

Contesto sporco.

### 4. “Metto tutta la roadmap in CLAUDE.md”

Agente distratto.

### 5. “Non aggiorno dopo cambio architettura”

Agente lavora sul passato.

### 6. “Ogni fonte intera nel prompt”

Costi alti.

### 7. “Screenshot senza istruzioni”

Visione dispersiva.

### 8. “Nessun checkpoint”

Ripartenza difficile.

---

## Regole operative finali

1. Non dare più contesto: dai contesto migliore.
2. Ogni task ha contesto minimo diverso.
3. Se non serve ora, resta fuori.
4. Memoria attiva breve; archivio lungo.
5. Aggiorna contesto dopo ogni decisione stabile.
6. Checkpoint dopo ogni step importante.
7. Fonti ufficiali diventano regole, non dump.
8. Screenshot solo se il problema è visuale.
9. Log solo nella parte rilevante.
10. Ogni agente riceve contesto del suo ruolo.
11. Ogni sessione lunga richiede compressione.
12. Ogni contesto attivo ha next step singolo.
13. Vecchio contesto sbagliato è pericoloso.
14. Skills riducono contesto ripetuto.
15. MCP/tool vanno usati con parsimonia.

---

## File generati da questo documento

Questo file porta alla creazione futura di:

```text
CONTEXT_ENGINEER_AGENT.md
CONTEXT_COMPRESSION_TEMPLATE.md
CONTEXT_QUALITY_SCORECARD.md
CONTEXT_DIET_WORKFLOW.md
PROJECT_CONTEXT_TEMPLATE.md
CLIENT_CONTEXT_TEMPLATE.md
WALBOX_COMPRESSED_CONTEXT.md
SESSION_CLOSE_WORKFLOW.md
SESSION_START_WORKFLOW.md
```

---

## Completezza stimata

Completezza attuale: 92%

### Coperto bene

- definizione context engineering;
- livelli di contesto;
- active vs archive;
- memoria;
- checkpoint;
- compression;
- refresh;
- source digestion;
- video/screenshot;
- codice;
- logs;
- tool definitions;
- MCP;
- skills/sub-agents;
- multi-agent;
- long-running agents;
- Walbox examples;
- AI Business Factory examples;
- scorecard;
- checklist;
- prompt master.

### Da approfondire nei file dedicati

- prompt caching implementazione API;
- contextual retrieval/RAG pratico;
- MCP code execution implementazione;
- vector database;
- filesystem indexing;
- auto-memory Claude Code;
- context compaction internals;
- agent harness avanzati;
- context evaluation automatica;
- knowledge base per clienti;
- document lifecycle/versioning completo.

---

## Prossimo file consigliato

```text
10_SAFE_WORKFLOWS.md
```

Perché dopo aver definito contesto, prompt, agenti e skills, serve trasformare tutto in workflow sicuri: UI edit, bugfix, research, feature, deploy, checkpoint e pitch.

<!-- END_SOURCE_FILE: 09_CONTEXT_ENGINEERING.md -->


<!-- BEGIN_SOURCE_FILE: 10_SAFE_WORKFLOWS.md -->
<!-- SOURCE_SHA256_UTF8: 57df58650570141ad04bc160bee448973d5baa2d77371805595d78839dde5377 -->
<!-- SOURCE_CHAR_COUNT: 28772 -->

# 10_SAFE_WORKFLOWS.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Workflows  
Completezza stimata: 91%

---

## Scopo del file

Questo file trasforma agenti, skills, prompt, memoria e context engineering in **workflow operativi sicuri**.

L’obiettivo è avere procedure chiare per:

- modifiche UI;
- bugfix;
- nuove feature;
- refactor;
- research;
- documentazione;
- QA;
- deploy;
- checkpoint;
- pitch;
- cloning Walbox per altri locali;
- task backend/API;
- deep dive fonti ufficiali;
- session start / session close.

La regola centrale:

> Un workflow sicuro non dice solo cosa fare. Dice anche quando fermarsi.

---

## Fonti ufficiali usate

Fonti principali:

1. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

2. Claude Code Best Practices  
   https://www.anthropic.com/engineering/claude-code-best-practices

3. Best practices for Claude Code  
   https://code.claude.com/docs/en/best-practices

4. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

5. Claude Code Quickstart  
   https://docs.anthropic.com/en/docs/claude-code/quickstart

6. Claude Code Memory / CLAUDE.md  
   https://docs.anthropic.com/en/docs/claude-code/memory

7. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

8. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

9. Claude Code Hooks Guide  
   https://docs.anthropic.com/en/docs/claude-code/hooks-guide

10. Claude Code Hooks Reference  
    https://docs.anthropic.com/en/docs/claude-code/hooks

11. Claude Code GitHub Actions  
    https://docs.anthropic.com/en/docs/claude-code/github-actions

12. Claude Code IDE Integrations  
    https://docs.anthropic.com/en/docs/claude-code/ide-integrations

13. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

14. Effective Harnesses for Long-running Agents  
    https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

15. Claude Code Auto Mode  
    https://www.anthropic.com/engineering/claude-code-auto-mode

16. Agent SDK Overview  
    https://docs.anthropic.com/en/docs/claude-code/sdk

---

## Sintesi brutale

Un workflow è una sequenza di lavoro.

Non basta dire:

```text
usa Claude per sistemare il bug.
```

Devi dire:

```text
1. parti da repo pulito;
2. fai read-only analysis;
3. identifica file;
4. proponi patch minima;
5. modifica solo file necessari;
6. testa;
7. fai QA;
8. commit;
9. checkpoint.
```

Il valore della AI Business Factory è proprio questo:

> trasformare richieste confuse in procedure ripetibili.

---

## Regola madre

```text
Ogni workflow deve avere:
- quando usarlo;
- input minimi;
- agente/skill;
- step;
- prompt;
- test;
- rollback;
- stop conditions;
- output finale.
```

Se manca uno di questi, il workflow è fragile.

---

## Workflow zero — Task Router

### Quando usarlo

Sempre, quando non è chiaro che tipo di task hai davanti.

### Obiettivo

Decidere:

- agente giusto;
- skill giusta;
- modello/modalità;
- livello rischio;
- contesto minimo;
- workflow successivo.

### Input minimo

```text
Task grezzo
Contesto progetto
Vincoli
```

### Prompt

```text
Agisci come AI Business Factory Router.

Task:
[TASK]

Contesto:
[CONTESTO]

Rispondi con:
1. categoria task;
2. livello rischio 1-5;
3. agente da usare;
4. skill da usare;
5. modello/modalità consigliata;
6. workflow consigliato;
7. contesto minimo;
8. cosa evitare;
9. prompt finale per il prossimo agente.
```

### Output atteso

```text
Categoria: UI / bug / feature / research / business / docs / deploy.
Workflow: safe-ui-edit / read-only-bugfix / feature-planning / ecc.
```

### Stop condition

Se il task è troppo vago, non passare al coding agent.  
Prima usa Strategist/Product Manager.

---

# 1. Safe UI Edit Workflow

## Quando usarlo

- modifiche UI;
- spacing;
- testi;
- bottoni;
- card;
- palette;
- responsive;
- layout;
- componenti visivi;
- polish schermate.

## Non usarlo per

- backend;
- Supabase;
- Spotify;
- API;
- auth;
- routing;
- database;
- refactor;
- feature logiche.

## Agente

```text
Frontend Agent
```

## Skill

```text
frontend-safe-edit
walbox-dev, se progetto Walbox
token-saver, se serve
```

## Input minimo

```text
file target
obiettivo UI
vincoli
test
```

## Step

```text
1. Verifica repo pulito.
2. Definisci file target.
3. Scrivi vincoli "non toccare".
4. Prompt con modifica singola.
5. Review diff.
6. Test UI.
7. Build se serve.
8. Commit.
9. Checkpoint se modifica importante.
```

## Prompt template

```text
Agisci come Frontend Agent e usa skill frontend-safe-edit.

Modifica solo:
[FILE]

Obiettivo:
[OBIETTIVO UI]

Vincoli:
- non modificare logica dati;
- non toccare backend/API;
- non modificare routing;
- non aggiungere dipendenze;
- non fare refactor;
- non modificare altri file.

Output:
1. piano breve;
2. patch minima;
3. file modificati;
4. cosa non hai toccato;
5. come testare.

Stop:
fermati se pensi di dover modificare più file o logica dati.
```

## Test

```text
npm run build
controllo browser
controllo mobile/TV se rilevante
flusso utente se file coinvolto
```

## Rollback

```bash
git restore [file]
```

## Esempio Walbox

```text
Modifica solo @CustomerJukeboxOldOrange.
Rendi più leggibile il bottone “Invia richiesta” su mobile.
Non toccare searchTrack, createSongRequest, selectedSong, Supabase, Spotify, App.jsx o altri file.
```

## Errori da evitare

- “migliora tutta la UI”;
- toccare App.jsx;
- modificare useEffect;
- cambiare API;
- aggiungere dipendenze animation;
- refactorare componenti.

---

# 2. Read-only Bug Analysis Workflow

## Quando usarlo

- bug non chiaro;
- errore build;
- sync dati;
- useEffect;
- Supabase;
- Spotify;
- routing;
- auth;
- deployment;
- regressione dopo patch.

## Obiettivo

Capire causa e patch minima **senza modificare subito file**.

## Agente

```text
Debug Agent / Backend Agent / QA Agent
```

## Skill

```text
qa-review
safe-backend-change
context-engineering
```

## Input minimo

```text
sintomo
cosa funzionava prima
file sospetti
log/errore rilevante
ultimo cambiamento
```

## Step

```text
1. Descrivi bug.
2. Dai solo log rilevante.
3. Modalità read-only.
4. Chiedi ipotesi.
5. Chiedi file coinvolti.
6. Chiedi patch minima.
7. Solo dopo decidi se implementare.
```

## Prompt template

```text
Agisci come Debug Agent.
Modalità read-only.

Non modificare file.
Non eseguire comandi distruttivi.

Bug:
[BUG]

Stato stabile precedente:
[STATO]

Contesto minimo:
[CONTESTO]

Output:
1. cosa hai capito;
2. ipotesi principali;
3. file coinvolti;
4. patch minima proposta;
5. rischi;
6. test;
7. se serve altro contesto.
```

## Stop condition

Se propone modifica multi-file, chiedere piano e rischio prima.

## Esempio Walbox

```text
Modalità read-only.
Problema: richiesta salvata in Supabase ma non visibile in dashboard.
Analizza solo flusso App.jsx → walboxDb.js → ManagerDashboard.jsx.
Non modificare file.
```

---

# 3. Safe Bugfix Workflow

## Quando usarlo

Dopo una read-only analysis con causa probabile.

## Obiettivo

Applicare patch minima e verificabile.

## Agente

```text
Coding Agent / Backend Agent / Frontend Agent
```

## Skill

```text
safe-backend-change, se backend
frontend-safe-edit, se UI
qa-review, dopo
```

## Step

```text
1. Parti da analisi read-only.
2. Conferma file da modificare.
3. Applica patch minima.
4. No refactor.
5. Test.
6. QA read-only.
7. Commit.
8. Checkpoint.
```

## Prompt

```text
Applica solo la patch minima per risolvere questo bug:

[BUG]

File autorizzati:
[FILE]

Vincoli:
- non fare refactor;
- non modificare file non autorizzati;
- non aggiungere dipendenze;
- non cambiare comportamento non collegato.

Output:
- file modificati;
- cosa hai cambiato;
- come testare;
- rischi residui.
```

## Test

```text
npm run build
test flusso bug specifico
test regressione minima
```

## Rollback

```bash
git restore [file]
```

---

# 4. Feature Planning Workflow

## Quando usarlo

Prima di implementare una nuova feature.

## Obiettivo

Capire se la feature è:

- MVP o roadmap;
- piccola o grande;
- UI only o backend;
- rischiosa o sicura;
- da spezzare.

## Agente

```text
Strategist Agent
Product Manager Agent
Token Saver Agent
```

## Skill

```text
business-validator
token-saver
project-context-builder
```

## Step

```text
1. Descrivi idea.
2. Valuta valore business.
3. Classifica MVP/roadmap.
4. Spezza in step.
5. Definisci file.
6. Definisci rischi.
7. Definisci test.
8. Genera prompt tecnico.
```

## Prompt

```text
Agisci come Product Manager Agent.

Feature:
[FEATURE]

Contesto:
[PROGETTO]

Output:
1. è MVP o roadmap?
2. valore per utente/cliente;
3. versione minima;
4. cosa NON implementare ora;
5. file/aree coinvolti;
6. rischi;
7. step piccoli;
8. primo task tecnico;
9. prompt per agente tecnico.
```

## Stop condition

Non implementare nulla durante planning.

---

# 5. Safe Feature Implementation Workflow

## Quando usarlo

Dopo Feature Planning.

## Obiettivo

Implementare solo il primo step minimo.

## Step

```text
1. Prendere primo task dal piano.
2. Verificare repo pulito.
3. Definire file autorizzati.
4. Implementare patch minima.
5. Test.
6. QA.
7. Commit.
8. Checkpoint.
9. Valutare step successivo.
```

## Prompt

```text
Implementa solo Step 1 della feature:

[STEP 1]

File autorizzati:
[FILE]

Vincoli:
- non implementare step futuri;
- non fare refactor;
- non aggiungere dipendenze senza conferma;
- non toccare backend se non previsto;
- mantieni comportamento esistente.

Output:
- file modificati;
- cosa è stato implementato;
- cosa è stato lasciato fuori;
- test;
- rischi.
```

## Esempio Walbox

Feature:

```text
Profilo Walrus Coming Soon
```

Step 1:

```text
creare schermata statica con dati finti.
```

Non fare:

```text
auth, database utenti, punti reali, coupon reali.
```

---

# 6. Safe Refactor Workflow

## Quando usarlo

Solo quando serve davvero.

## Non usarlo

- insieme a nuova feature;
- durante demo urgente;
- su codice stabile senza motivo;
- senza test;
- senza commit prima.

## Obiettivo

Migliorare struttura senza cambiare comportamento.

## Step

```text
1. Commit stato prima del refactor.
2. Read-only analysis.
3. Piano refactor.
4. Definizione comportamento invariato.
5. Modifica piccola.
6. Test.
7. QA.
8. Commit separato.
```

## Prompt

```text
Agisci come Refactor Agent.
Modalità read-only iniziale.

Obiettivo refactor:
[OBIETTIVO]

Vincoli:
- comportamento invariato;
- nessuna nuova feature;
- no UI redesign;
- no nuove dipendenze;
- commit separato.

Output iniziale:
1. perché serve;
2. file coinvolti;
3. rischio;
4. piano in step;
5. test per verificare comportamento invariato.
```

## Stop condition

Se non puoi definire test comportamento invariato, non fare refactor.

---

# 7. Research Workflow

## Quando usarlo

- documentazione ufficiale;
- competitor;
- pricing;
- tool;
- best practice;
- fonti recenti;
- legal/security high level;
- decisioni tecniche.

## Agente

```text
Research Agent
```

## Skill

```text
official-source-digester
documentation-compressor
```

## Step

```text
1. Definisci domanda.
2. Priorità fonti ufficiali.
3. Cerca fonti.
4. Filtra qualità.
5. Estrai regole operative.
6. Cita fonti.
7. Indica incertezza.
8. Aggiorna file .md.
```

## Prompt

```text
Agisci come Research Agent.

Tema:
[TEMA]

Priorità:
1. fonti ufficiali;
2. documentazione primaria;
3. engineering blog autorevole;
4. competitor reali;
5. fonti secondarie solo come extra.

Output:
- fonte;
- link;
- cosa dice;
- affidabilità;
- regola operativa;
- file da aggiornare;
- cosa resta incerto.
```

## Stop condition

Se non trovi fonti ufficiali, dichiaralo.

---

# 8. Official Source Digestion Workflow

## Quando usarlo

Dopo aver trovato documentazione ufficiale.

## Obiettivo

Trasformare fonte in regola/workflow.

## Step

```text
1. Leggi fonte.
2. Identifica concetto utile.
3. Traduci in italiano pratico.
4. Estrai regole.
5. Crea template/prompt.
6. Collega a file .md.
7. Segna completezza.
```

## Prompt

```text
Usa skill official-source-digester.

Fonte:
[FONTE]

Output:
1. cosa spiega;
2. perché serve a noi;
3. regole operative;
4. prompt/template derivati;
5. workflow collegato;
6. file da aggiornare;
7. completezza.
```

## Esempio

Fonte:

```text
Claude Code Memory
```

Regola:

```text
CLAUDE.md guida l’agente ma non blocca azioni. Per blocchi reali servono hooks/permissions/review.
```

---

# 9. Documentation Workflow

## Quando usarlo

- dopo deep dive;
- dopo feature;
- dopo bugfix;
- dopo demo;
- dopo decisione;
- dopo errore;
- dopo sessione lunga.

## Agente

```text
Documentation Agent
```

## Skill

```text
documentation-compressor
checkpoint-writer
```

## Step

```text
1. Raccogli materiale.
2. Estrai decisioni.
3. Estrai regole.
4. Aggiorna file giusto.
5. Archivia raw.
6. Crea next step.
7. Aggiorna completezza.
```

## Prompt

```text
Agisci come Documentation Agent.

Materiale:
[MATERIALE]

Output:
1. decisioni prese;
2. regole operative;
3. file da aggiornare;
4. update memoria attiva;
5. cosa archiviare;
6. prossimo step singolo.
```

---

# 10. Checkpoint Workflow

## Quando usarlo

- dopo deploy riuscito;
- dopo bugfix;
- dopo feature funzionante;
- prima di chiudere sessione;
- prima di nuova chat;
- prima di far lavorare altro agente;
- dopo presentazione cliente.

## Step

```text
1. Data.
2. Obiettivo completato.
3. Stato stabile.
4. File modificati.
5. Test.
6. Cosa funziona.
7. Cosa non toccare.
8. Problemi aperti.
9. Decisioni.
10. Prossimo step singolo.
11. Prompt per ripartire.
```

## Template

```md
# CHECKPOINT — [Project]

## Date
YYYY-MM-DD

## Goal completed

## Stable state

## Files changed

## Tests done

## What works

## Do not touch

## Open issues

## Decisions

## Next step

## Restart prompt
```

## Prompt

```text
Crea un checkpoint operativo.

Materiale:
[MATERIALE]

Mantieni:
- stato stabile;
- file modificati;
- test;
- cosa funziona;
- cosa non toccare;
- problemi aperti;
- prossimo step singolo.
```

---

# 11. QA Review Workflow

## Quando usarlo

- dopo patch;
- prima di commit;
- prima di deploy;
- dopo modifica multi-file;
- dopo API/database;
- prima di demo.

## Agente

```text
QA Agent
```

## Skill

```text
qa-review
```

## Step

```text
1. Prendi task originale.
2. Prendi diff/modifica.
3. Controlla scope.
4. Controlla file toccati.
5. Controlla rischi.
6. Definisci test.
7. Verdict.
```

## Prompt

```text
Agisci come QA Agent.
Modalità read-only.

Task originale:
[TASK]

Modifica/diff:
[DIFF]

Controlla:
- rispetto scope;
- file non richiesti;
- regressioni;
- mobile;
- build;
- flusso utente;
- Supabase/Spotify se coinvolti;
- test necessari.

Output:
1. verdict: safe / attenzione / bloccare;
2. problemi;
3. gravità;
4. test;
5. fix minimi.
```

---

# 12. Deploy Workflow

## Quando usarlo

- prima di Vercel deploy;
- dopo commit;
- prima di demo;
- dopo modifiche importanti.

## Step

```text
1. git status pulito.
2. npm run build.
3. test locale.
4. commit.
5. push.
6. controlla Vercel Ready.
7. test URL pubblico.
8. checkpoint.
```

## Comandi tipici

```bash
git status
npm run build
npm run dev
git add .
git commit -m "message"
git push
```

## Prompt per agente

```text
Prepara checklist deploy per questa modifica.

Output:
1. comandi;
2. test locale;
3. test Vercel;
4. cosa controllare su mobile;
5. rollback se deploy fallisce.
```

## Rollback

```bash
git revert [commit]
```

oppure usare rollback Vercel se configurato.

---

# 13. Git Safety Workflow

## Quando usarlo

Sempre prima/dopo modifiche codice.

## Step

```text
1. git status prima.
2. Se sporco, capire perché.
3. Modifica singola.
4. git diff.
5. Test.
6. git add file specifici.
7. commit.
8. push se serve.
```

## Regola

> Git è il checkpoint tecnico. Il `.md` è il checkpoint narrativo.

## Prompt

```text
Crea istruzioni Git sicure per salvare questa modifica.
Non suggerire commit se build/test non sono stati fatti.
```

---

# 14. Session Start Workflow

## Quando usarlo

- nuova chat;
- nuova sessione Antigravity;
- nuova sessione Claude Code;
- ripresa dopo pausa;
- nuovo agente.

## Step

```text
1. Carica checkpoint.
2. Conferma stato stabile.
3. Conferma cosa non toccare.
4. Scegli un solo prossimo step.
5. Genera prompt agente.
```

## Prompt

```text
Riparti da questo checkpoint:

[CHECKPOINT]

Prima:
1. conferma stato stabile;
2. elenca cosa non toccare;
3. proponi un solo prossimo step;
4. genera prompt sicuro per agente/tool;
5. non proporre roadmap extra.
```

---

# 15. Session Close Workflow

## Quando usarlo

- fine giornata;
- dopo lavoro lungo;
- prima di dormire;
- prima di cambiare progetto;
- dopo demo.

## Step

```text
1. Riassumi cosa fatto.
2. Stato stabile.
3. File modificati.
4. Test.
5. Decisioni.
6. Cosa non toccare.
7. Problemi aperti.
8. Prossimo step.
9. Aggiorna checkpoint.
10. Archivia raw.
```

## Prompt

```text
Chiudi questa sessione.

Output:
1. cosa è stato fatto;
2. stato stabile;
3. file modificati;
4. test effettuati;
5. decisioni;
6. cosa non toccare;
7. problemi aperti;
8. prossimo step singolo;
9. update memoria/checkpoint.
```

---

# 16. Walbox UI Workflow

## Quando usarlo

Per modifiche a:

- CustomerJukeboxOldOrange;
- LiveTvScreen;
- varianti entry;
- dashboard visuale;
- copy UI.

## Regole

```text
- Modifica un file alla volta.
- Non toccare App.jsx.
- Non toccare walboxDb.js.
- Non toccare spotifyApi.js.
- Non toccare routing.
- Non toccare ManagerDashboard se non richiesto.
- Mantieni palette Walrus.
- Test mobile/TV.
```

## Prompt

```text
Usa skill walbox-dev + frontend-safe-edit.

Modifica solo:
[FILE]

Obiettivo:
[UI TASK]

Non toccare:
- App.jsx
- walboxDb.js
- spotifyApi.js
- api/search.js
- routing
- Supabase
- Spotify
- altri file

Output:
piano breve, patch minima, test.
```

---

# 17. Walbox Backend Workflow

## Quando usarlo

Per:

- Supabase;
- Spotify;
- Vercel API;
- queue;
- realtime;
- env;
- auth.

## Regole

```text
- Read-only prima.
- Nessuna modifica schema senza piano.
- Nessun segreto in codice.
- Test end-to-end.
- Rollback chiaro.
```

## Prompt

```text
Usa skill safe-backend-change.
Modalità read-only iniziale.

Problema/task:
[TASK]

Controlla solo:
[FILE]

Output:
1. flusso dati;
2. file coinvolti;
3. rischio;
4. patch minima;
5. test end-to-end;
6. rollback.
```

---

# 18. Walbox Demo Preparation Workflow

## Quando usarlo

Prima di incontro locale/demo.

## Step

```text
1. Test URL pubblico.
2. Test telefono cliente.
3. Test dashboard Mac.
4. Test Live TV.
5. Test Spotify.
6. Prepara script demo.
7. Prepara fallback.
8. Prepara messaggio valore.
```

## Prompt

```text
Prepara checklist demo Walbox per incontro locale.

Output:
1. test tecnici;
2. flusso demo;
3. cosa dire;
4. cosa non dire;
5. fallback se Spotify non funziona;
6. obiezioni e risposte;
7. CTA finale.
```

---

# 19. Walbox Clone Workflow

## Quando usarlo

Per creare versione per altro bar/locale.

## Obiettivo

Personalizzare senza riscrivere core.

## Step

```text
1. Client Context.
2. Brand/copy.
3. Feature demo minima.
4. Cosa riusare da Walbox.
5. Cosa non toccare.
6. UI clone.
7. Test.
8. Pitch.
9. Checkpoint cliente.
```

## Prompt

```text
Usa skill walbox-clone-adapter.

Nuovo locale:
[INFO]

Output:
1. cosa riusare da Walbox;
2. cosa personalizzare;
3. file probabili;
4. cosa non toccare;
5. demo minima;
6. pitch;
7. rischi.
```

## Stop condition

Non implementare multi-tenant o backend separato se non serve alla demo.

---

# 20. Business Validation Workflow

## Quando usarlo

Prima di costruire una nuova idea.

## Step

```text
1. Problema reale.
2. Target.
3. Valore.
4. Urgenza.
5. MVP minimo.
6. Prezzo potenziale.
7. Costo/complessità.
8. Prossimo test.
```

## Prompt

```text
Usa skill business-validator.

Idea:
[IDEA]

Valuta:
1. problema reale;
2. target;
3. valore percepito;
4. MVP minimo;
5. cosa non fare ora;
6. rischio;
7. costo/complessità;
8. test rapido;
9. decisione: costruire / parcheggiare.
```

---

# 21. Pitch Workflow

## Quando usarlo

- prima messaggio a cliente;
- dopo demo;
- preventivo;
- follow-up;
- risposta obiezioni.

## Step

```text
1. Client context.
2. Problema.
3. Valore.
4. Demo semplice.
5. Obiezioni.
6. CTA.
7. Prezzo se richiesto.
```

## Prompt

```text
Usa skill pitch-builder.

Cliente:
[CLIENTE]

Prodotto:
[PRODOTTO]

Obiettivo:
[demo / follow-up / vendita]

Output:
1. pitch 3 righe;
2. messaggio WhatsApp;
3. valore cliente;
4. obiezioni e risposte;
5. proposta semplice;
6. CTA.
```

---

# 22. Pricing Workflow

## Quando usarlo

Quando vuoi capire quanto chiedere.

## Step

```text
1. Valore cliente.
2. Complessità setup.
3. Costi tool.
4. Tempo umano.
5. Manutenzione.
6. Rischio supporto.
7. Prezzo setup.
8. Canone.
9. Pacchetti.
```

## Prompt

```text
Stima pricing per questo servizio.

Servizio:
[SERVIZIO]

Cliente:
[CLIENTE]

Considera:
- valore percepito;
- tempo setup;
- costo AI/tool;
- hosting;
- manutenzione;
- supporto;
- rischio;
- mercato piccolo locale.

Output:
1. fascia setup;
2. fascia canone;
3. pacchetti;
4. cosa includere;
5. cosa vendere come extra.
```

---

# 23. Prompt Optimization Workflow

## Quando usarlo

Prima di mandare prompt a Claude/Antigravity se il task è importante.

## Step

```text
1. Task grezzo.
2. Ruolo.
3. Contesto minimo.
4. Vincoli.
5. Output.
6. Test.
7. Stop condition.
8. Prompt finale.
```

## Prompt

```text
Usa skill prompt-optimizer.

Richiesta grezza:
[RICHIESTA]

Output:
1. ruolo corretto;
2. contesto minimo;
3. vincoli;
4. cosa non fare;
5. output atteso;
6. test;
7. prompt finale ottimizzato.
```

---

# 24. Token Saver Workflow

## Quando usarlo

Prima di task costoso.

## Step

```text
1. Classifica task 1-5.
2. Decide modello/modalità.
3. Riduce contesto.
4. Decide read-only.
5. Spezza se necessario.
6. Produce prompt finale.
```

## Prompt

```text
Agisci come Token Saver Agent.

Task:
[TASK]

Output:
1. livello 1-5;
2. rischio;
3. modello/modalità consigliata;
4. contesto minimo;
5. cosa evitare;
6. se serve read-only;
7. prompt finale.
```

---

# 25. Hooks Roadmap Workflow

## Quando usarlo

Più avanti, per automatizzare controlli.

## Obiettivo

Decidere quali azioni devono diventare automatiche/deterministiche.

Fonti ufficiali distinguono memoria/istruzioni da hooks: `CLAUDE.md` è contesto, mentre hooks possono eseguire comandi in momenti specifici del ciclo Claude Code.

## Possibili hooks futuri

```text
- run npm run build after edit;
- block edits to migrations/schema;
- block env file writes;
- warn when App.jsx touched during UI workflow;
- generate checkpoint at session end;
- run lint/format;
- require confirmation for destructive commands.
```

## Prompt

```text
Progetta hooks per questo workflow.

Workflow:
[WORKFLOW]

Output:
1. quali rischi automatizzare;
2. hook candidate;
3. trigger;
4. cosa bloccare;
5. cosa lasciare manuale;
6. rischio falso positivo.
```

## Regola

> Prima workflow manuale stabile. Poi hook.

---

# 26. Auto Mode / Approval Workflow

## Quando usarlo

Quando valuti quanta autonomia dare all’agente.

## Regola

```text
Più rischio = più approvazione manuale.
```

## Tabella

| Task | Approvazione |
|---|---|
| typo | bassa |
| UI file singolo | media-bassa |
| bug React | media |
| API/database | alta |
| env/segreti | altissima |
| delete files | manuale |
| schema DB | manuale |
| deploy produzione | manuale |

## Prompt

```text
Valuta livello di autonomia per questo task.

Output:
1. rischio;
2. cosa può essere automatico;
3. cosa richiede conferma;
4. cosa bloccare;
5. rollback.
```

---

# 27. Multi-Agent Workflow

## Quando usarlo

Per task grandi ma separabili.

## Buoni casi

- research + pitch + QA;
- competitor + pricing + best practice;
- documentazione + sintesi;
- idee UI + business + checklist.

## Cattivi casi

- più agenti sullo stesso file;
- più agenti sullo stesso refactor;
- più agenti su database;
- task piccolo.

## Step

```text
1. Lead agent definisce sottotask.
2. Ogni sub-agent riceve contesto specifico.
3. Output sintetico.
4. Lead deduplica.
5. Decisione finale.
6. Un solo agente implementa.
```

## Prompt

```text
Progetta workflow multi-agent per questo task.

Task:
[TASK]

Output:
1. subtask;
2. agente per subtask;
3. contesto per ogni agente;
4. output atteso;
5. cosa può andare in parallelo;
6. cosa deve essere seriale;
7. rischi.
```

---

# 28. Long-running Agent Workflow

## Quando usarlo

Solo per task grandi, con checkpoint.

## Step

```text
1. Goal.
2. Piano in milestone.
3. Step 1.
4. Verify.
5. Checkpoint.
6. Step 2.
7. Verify.
8. Checkpoint.
```

## Prompt

```text
Lavora come long-running agent ma in step controllati.

Regole:
- non fare tutto in una volta;
- ogni step deve avere output verificabile;
- dopo ogni step crea checkpoint;
- non passare allo step successivo se il precedente non è stabile;
- segnala rischi.
```

## Regola

> Long-running senza checkpoint = rischio alto.

---

# 29. Human Review Workflow

## Quando usarlo

Sempre prima di accettare patch agentiche.

## Step

```text
1. Controlla file modificati.
2. Controlla diff.
3. Verifica se scope rispettato.
4. Verifica file non richiesti.
5. Test.
6. Accetta/rigetta.
7. Commit.
```

## Checklist

```text
[ ] File giusti?
[ ] Nessun file critico toccato?
[ ] No refactor extra?
[ ] No dipendenze?
[ ] Test passa?
[ ] Output coerente?
[ ] Rollback possibile?
```

---

# 30. Error-to-Rule Workflow

## Quando usarlo

Ogni volta che un agente sbaglia.

## Step

```text
1. Descrivi errore.
2. Identifica causa.
3. Trasforma in regola.
4. Aggiorna skill/prompt/workflow.
5. Testa nuova regola.
```

## Prompt

```text
Trasforma questo errore agentico in una regola.

Errore:
[ERRORE]

Output:
1. causa;
2. nuova regola;
3. file da aggiornare;
4. prompt migliorato;
5. test per evitare recidiva.
```

---

## Workflow Matrix

| Situazione | Workflow |
|---|---|
| Task confuso | Task Router |
| UI piccola | Safe UI Edit |
| Bug non chiaro | Read-only Bug Analysis |
| Bug chiaro | Safe Bugfix |
| Nuova feature | Feature Planning |
| Implementazione feature | Safe Feature Implementation |
| Refactor | Safe Refactor |
| Ricerca | Research |
| Fonte ufficiale | Official Source Digestion |
| File .md | Documentation |
| Fine sessione | Session Close |
| Inizio sessione | Session Start |
| Dopo patch | QA Review |
| Deploy | Deploy |
| Prezzo | Pricing |
| Pitch | Pitch |
| Nuova idea | Business Validation |
| Ridurre token | Token Saver |
| Multi-agent | Multi-Agent |
| Errore agente | Error-to-Rule |

---

## Workflow minimo quotidiano

Per lavorare su Walbox o progetto simile:

```text
1. Session Start
2. Task Router
3. Token Saver
4. Workflow specifico
5. QA Review
6. Git Safety
7. Checkpoint
```

---

## Workflow minimo per micro edit

```text
1. git status
2. prompt “modifica solo file”
3. review diff
4. test veloce
5. commit
```

---

## Workflow minimo per feature

```text
1. Feature Planning
2. Token Saver
3. Step 1 implementation
4. QA
5. Test
6. Commit
7. Checkpoint
8. Step successivo solo dopo
```

---

## Workflow minimo per business idea

```text
1. Business Validation
2. Research se serve
3. MVP definition
4. Demo Builder
5. Pitch
6. Cliente feedback
7. Product Manager
8. Build task
```

---

## Prompt master workflow generator

```text
Crea workflow sicuro per questo task:

[TASK]

Il workflow deve includere:
1. quando usarlo;
2. quando non usarlo;
3. agente;
4. skill;
5. input minimi;
6. step;
7. prompt;
8. test;
9. rollback;
10. stop conditions;
11. errori da evitare.
```

---

## Completezza stimata

Completezza attuale: 91%

### Coperto bene

- task router;
- UI safe edit;
- bug analysis;
- bugfix;
- feature planning;
- implementation;
- refactor;
- research;
- documentation;
- checkpoint;
- QA;
- deploy;
- Git;
- session start/close;
- Walbox UI/backend/demo/clone;
- business validation;
- pitch;
- pricing;
- prompt optimization;
- token saver;
- hooks roadmap;
- auto mode;
- multi-agent;
- long-running agents;
- human review;
- error-to-rule.

### Da approfondire nei file dedicati

- workflow specifici GitHub Actions;
- hook JSON reali;
- Claude Code CLI workflows;
- Antigravity UI step-by-step;
- Vercel rollback dettagliato;
- Supabase migration workflow;
- Spotify API testing workflow;
- security checklist avanzata;
- production release workflow;
- customer onboarding workflow;
- support workflow post-vendita.

---

## Prossimo file consigliato

```text
11_HOOKS_AND_AUTOMATION.md
```

Perché dopo i workflow manuali, il passo successivo è capire quali controlli possono diventare automatici: hooks, CI, blocchi file critici, test post-edit e checkpoint automatici.

<!-- END_SOURCE_FILE: 10_SAFE_WORKFLOWS.md -->


<!-- BEGIN_SOURCE_FILE: 11_HOOKS_AND_AUTOMATION.md -->
<!-- SOURCE_SHA256_UTF8: 1fea70a4f111124b53ef5b5027af736f42fed8ff5c3d60a76c1f0184a82084d4 -->
<!-- SOURCE_CHAR_COUNT: 22813 -->

# 11_HOOKS_AND_AUTOMATION.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Tools & Automation  
Completezza stimata: 86%

---

## Scopo del file

Questo file spiega come usare **hooks, automazioni, approval, sandbox, CI e controlli automatici** nella tua AI Business Factory.

Obiettivo:

- capire cosa sono gli hooks;
- capire quando usarli;
- capire quando NON usarli;
- distinguere istruzioni da controlli reali;
- progettare automazioni sicure;
- evitare approval fatigue;
- evitare agenti troppo liberi;
- creare una roadmap per automatizzare i workflow ripetitivi;
- proteggere file critici, segreti, database e deploy.

La regola centrale:

> Prima stabilizzi il workflow manuale. Poi automatizzi solo ciò che è ripetibile e sicuro.

---

## Fonti ufficiali usate

Fonti principali:

1. Automate workflows with hooks — Claude Code Docs  
   https://docs.anthropic.com/en/docs/claude-code/hooks-guide

2. Hooks reference — Claude Code Docs  
   https://docs.anthropic.com/en/docs/claude-code/hooks

3. Claude Code Settings  
   https://docs.anthropic.com/en/docs/claude-code/settings

4. Claude Code Overview  
   https://docs.anthropic.com/en/docs/claude-code/overview

5. Claude Code Common Workflows  
   https://docs.anthropic.com/en/docs/claude-code/common-workflows

6. Claude Code Best Practices  
   https://www.anthropic.com/engineering/claude-code-best-practices

7. Claude Code Auto Mode  
   https://www.anthropic.com/engineering/claude-code-auto-mode

8. Claude Code Sandboxing  
   https://www.anthropic.com/engineering/claude-code-sandboxing

9. Claude Code GitHub Actions  
   https://docs.anthropic.com/en/docs/claude-code/github-actions

10. Claude Code IDE integrations  
    https://docs.anthropic.com/en/docs/claude-code/ide-integrations

11. Effective Harnesses for Long-running Agents  
    https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

12. Harness design for long-running application development  
    https://www.anthropic.com/engineering/harness-design-long-running-apps

13. Code Execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp

14. Writing Effective Tools for Agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

15. How we contain Claude across products  
    https://www.anthropic.com/engineering/how-we-contain-claude

16. Claude Code Skills  
    https://docs.anthropic.com/en/docs/claude-code/skills

17. Claude Code Sub-agents  
    https://docs.anthropic.com/en/docs/claude-code/sub-agents

---

## Sintesi brutale

Gli hooks sono azioni automatiche che partono in momenti specifici del ciclo di Claude Code.

La documentazione ufficiale li descrive come shell commands, HTTP endpoints o LLM prompts che vengono eseguiti automaticamente quando accadono eventi specifici nella sessione.

Tradotto:

```text
Quando Claude sta per fare X → esegui controllo Y.
Quando Claude finisce edit → esegui test Z.
Quando Claude chiede input → notifica.
Quando Claude prova a toccare file critico → blocca o chiedi conferma.
```

---

## Perché servono

Le istruzioni nei prompt e in `CLAUDE.md` aiutano, ma non sono blocchi rigidi.

Se scrivi:

```text
Non toccare App.jsx
```

l’agente dovrebbe rispettarlo, ma tecnicamente potrebbe comunque proporre o fare quella modifica.

Un hook o un controllo automatico può invece:

- intercettare eventi;
- eseguire verifiche;
- bloccare azioni;
- notificare;
- eseguire test;
- automatizzare passaggi ripetitivi.

### Regola

```text
Prompt e memory guidano.
Hooks e permissions proteggono.
```

---

## Non partire dagli hooks

Per te, gli hooks sono **fase 2 o 3**, non fase 1.

Prima devi avere:

- workflow manuali chiari;
- file critici definiti;
- prompt stabili;
- skill testate;
- Git pulito;
- test/build noti;
- checklist QA;
- errori ricorrenti identificati.

Solo dopo ha senso automatizzare.

### Perché

Se automatizzi un processo confuso, crei solo caos automatico.

---

## Quando usare hooks

Usa hooks quando un controllo è:

- ripetitivo;
- chiaro;
- deterministico;
- importante;
- facile da testare;
- non ambiguo;
- utile a ridurre errori;
- collegato a un rischio reale.

### Esempi buoni

```text
Dopo edit React → npm run build.
Prima di modificare .env → blocca.
Prima di modificare Supabase schema → chiedi conferma.
Quando Claude aspetta input → notifica desktop.
Dopo sessione lunga → crea checkpoint.
Prima di comando distruttivo → blocca.
```

---

## Quando NON usare hooks

Non usare hooks per:

- decisioni creative;
- scelte di business;
- feature non mature;
- workflow non testati;
- regole ambigue;
- tutto ciò che richiede giudizio umano;
- task ancora in brainstorming;
- progetti piccoli dove il costo di automazione supera valore.

### Esempio cattivo

```text
Hook che decide automaticamente se una feature è buona.
```

Meglio:

```text
Strategist Agent / Product Manager Agent.
```

---

## Differenza tra hook, skill, agente, workflow

### Hook

Automazione tecnica.

Domanda:

```text
Cosa deve succedere automaticamente?
```

### Skill

Competenza operativa.

Domanda:

```text
Come si fa bene questo tipo di task?
```

### Agente

Ruolo.

Domanda:

```text
Chi deve fare il task?
```

### Workflow

Sequenza.

Domanda:

```text
In che ordine si lavora?
```

### Esempio

Task:

```text
modifica UI Walbox
```

Sistema:

```text
Agente: Frontend Agent
Skill: frontend-safe-edit
Workflow: Safe UI Edit
Hook: dopo edit, esegui npm run build
```

---

## Hook lifecycle: concetto operativo

Gli hooks si collegano a eventi del ciclo Claude Code.

Esempi concettuali:

```text
PreToolUse → prima che Claude usi un tool
PostToolUse → dopo che Claude usa un tool
Notification → quando Claude aspetta input/permesso
Stop → quando Claude finisce
SubagentStop → quando finisce un subagent
```

Nota: nomi/eventi effettivi vanno verificati nella reference ufficiale quando si implementa davvero.

---

## Tipi di hooks

### 1. Command hooks

Eseguono shell commands.

Esempio concettuale:

```text
npm run build
```

### 2. HTTP hooks

Chiamano endpoint esterni.

Esempio:

```text
POST a webhook interno
```

### 3. Prompt/LLM hooks

Usano prompt LLM per decidere o trasformare.

Esempio:

```text
classifica rischio del comando
```

### 4. Async hooks

Eseguono in modo asincrono.

Esempio:

```text
notifica / log non bloccante
```

### 5. MCP tool hooks

Intercettano strumenti MCP.

Roadmap avanzata.

---

## Primo hook utile: Notification

La guida ufficiale parte da un esempio semplice: notifica quando Claude aspetta input/permesso.

Per te è utile perché evita di fissare il terminale.

### Caso d’uso

```text
Claude sta lavorando.
Quando ha finito o chiede conferma, ricevi notifica.
```

### Valore

- meno tempo perso;
- puoi lavorare su altro;
- riduce attrito;
- basso rischio.

### Priorità

```text
Alta, ma non urgente.
```

---

## Hook utile: Post-edit build

Dopo modifica codice React:

```text
npm run build
```

### Valore

Scopri subito se l’agente ha rotto build.

### Rischio

- build può essere lenta;
- se parte troppo spesso consuma tempo;
- se il progetto è grande può diventare fastidioso.

### Regola

```text
Usarlo per modifiche importanti, non per ogni micro typo.
```

---

## Hook utile: blocco file critici

Per Walbox:

```text
Se workflow = safe-ui-edit
e file modificato è App.jsx / walboxDb.js / spotifyApi.js
allora blocca o chiedi conferma.
```

### Valore

Protegge demo stabile.

### File critici Walbox

```text
src/App.jsx
src/services/walboxDb.js
src/services/spotifyApi.js
api/search.js
vercel.json
.env
Supabase schema
Spotify auth flow
```

### Regola

> I file critici non devono essere bloccati sempre, ma devono richiedere intenzione esplicita.

---

## Hook utile: blocco segreti

Se l’agente prova a leggere/scrivere:

```text
.env
.env.local
secret keys
tokens
credentials
private keys
```

deve chiedere conferma o essere bloccato.

### Regola

> Nessun segreto deve finire nel prompt, nel codice o in output.

---

## Hook utile: no destructive commands

Bloccare comandi tipo:

```bash
rm -rf
git reset --hard
git clean -fd
drop table
delete from
truncate
```

### Regola

> I comandi distruttivi richiedono sempre conferma umana.

---

## Hook utile: git status pre-task

Prima di modificare:

```bash
git status --short
```

Se working tree è sporco, avvisare.

### Valore

Evita di mischiare modifiche.

### Regola

> Se repo è sporco, capire prima perché.

---

## Hook utile: checkpoint a fine sessione

Quando sessione termina:

```text
chiedi o genera checkpoint
```

Non necessariamente automatico completo, ma reminder.

### Output

```md
- cosa fatto;
- file modificati;
- test;
- cosa funziona;
- cosa non toccare;
- prossimo step.
```

---

## Hook utile: QA reminder dopo multi-file edit

Se l’agente modifica più di 1 file:

```text
trigger QA review
```

Output:

```text
Hai modificato più file. Esegui QA read-only prima di commit.
```

---

## Hook utile: dependency guard

Se `package.json` cambia:

```text
chiedi conferma.
```

### Perché

Nuove dipendenze aumentano:

- bundle;
- manutenzione;
- vulnerabilità;
- rischio deploy.

### Regola

> Nessuna dipendenza nuova senza motivo scritto.

---

## Hook utile: migration guard

Se vengono toccate migration/database schema:

```text
richiedi conferma manuale.
```

Per Supabase:

```text
schema/migrations/sql
```

### Regola

> Database schema non si modifica in automatico.

---

## Hook utile: command allowlist

Autorizza automaticamente solo comandi sicuri.

Esempi:

```bash
npm run build
npm run lint
npm test
git status
git diff
```

Chiedi conferma per:

```bash
git push
deploy
rm
reset
install
migration
```

---

## Auto mode e approval fatigue

Anthropic evidenzia un problema: se un agente chiede troppe approvazioni, l’utente smette di leggere bene e approva tutto.

Questo si chiama approval fatigue.

Soluzione:

```text
approvazioni intelligenti, non infinite.
```

### Regola pratica

- micro operazioni sicure → meno conferme;
- azioni rischiose → conferma obbligatoria;
- file critici → conferma;
- comandi distruttivi → blocco;
- API/database/env → conferma forte.

---

## Matrice approvazioni

| Azione | Autonomia |
|---|---|
| leggere file UI | auto |
| modificare file UI target | auto/confirm leggero |
| npm run build | auto |
| git status/diff | auto |
| modificare App.jsx | conferma |
| modificare walboxDb.js | conferma |
| modificare spotifyApi.js | conferma |
| modificare .env | blocco/conferma forte |
| aggiungere dipendenza | conferma |
| schema DB | conferma forte |
| comando distruttivo | blocco |
| git push | manuale |
| deploy produzione | manuale |

---

## Sandbox

Sandboxing serve a limitare cosa può fare l’agente, soprattutto su filesystem e rete.

Le fonti Anthropic sul sandboxing parlano di isolamento del filesystem e della rete per evitare che un agente compromesso possa leggere file sensibili o connettersi a domini non autorizzati.

### Per te

Ora:

```text
Review manuale + Git + prompt + Antigravity Strict.
```

Più avanti:

```text
sandbox/permissions/hook allowlist.
```

### Regola

> L’agente deve avere accesso minimo necessario.

---

## Security model base

Pensa sempre in termini di blast radius.

Domanda:

```text
Se l’agente sbaglia, quanto danno può fare?
```

Se il danno è alto:

- meno autonomia;
- più review;
- sandbox;
- hooks;
- permessi;
- no segreti;
- test.

---

## Hooks per Walbox: roadmap

### Fase 1 — Manuale

Già ora:

```text
git status
Review Changes
npm run build
git diff
commit
checkpoint
```

### Fase 2 — Reminder

Automazioni leggere:

```text
notifica quando agent aspetta input
reminder checkpoint
reminder QA dopo multi-file
```

### Fase 3 — Guard rail

```text
blocca/avvisa su App.jsx durante UI edit
blocca .env
avvisa package.json
avvisa Supabase/Spotify core
```

### Fase 4 — Test automatici

```text
post-edit build
lint/test
smoke test se possibile
```

### Fase 5 — CI/GitHub Actions

```text
PR review
build on PR
Claude review
Vercel preview
```

---

## Hooks per AI Business Factory

Automazioni utili:

```text
Dopo creazione file .md → aggiorna indice.
Dopo nuovo checkpoint → aggiorna PROJECT_CONTEXT.
Dopo fonte ufficiale → aggiorna OFFICIAL_SOURCES_INDEX.
Dopo nuovo workflow → aggiorna SAFE_WORKFLOWS.
Dopo errore agente → aggiorna ERROR_TO_RULES.
```

Per ora manuale.

---

## GitHub Actions

Claude Code può integrarsi con GitHub Actions e PR/issue, ma questa è fase avanzata.

Utile per:

- review automatica PR;
- issue-to-PR;
- test automatici;
- documentazione;
- CI;
- workflow team.

Non urgente per te ora.

### Regola

> Prima fai funzionare manualmente. Poi porta su GitHub Actions.

---

## CI minima futura per Walbox

Quando il progetto cresce:

```yaml
on:
  pull_request:
  push:

jobs:
  build:
    steps:
      - checkout
      - install
      - npm run build
```

Poi eventualmente:

```text
lint
tests
typecheck
Claude review
Vercel preview
```

---

## Hooks vs GitHub Actions

### Hooks

Locali/sessione Claude.

Utili per:

- pre/post tool use;
- blocco file;
- notifiche;
- build locale;
- prompt automation.

### GitHub Actions

CI su repository.

Utili per:

- PR;
- build;
- test;
- deploy;
- review;
- team collaboration.

### Regola

> Hooks proteggono durante il lavoro. CI protegge prima di integrare/deployare.

---

## Automazione non significa autonomia totale

Automatizzare non vuol dire:

```text
l’agente fa tutto da solo.
```

Significa:

```text
le parti ripetitive e controllabili diventano automatiche.
```

Decisioni umane restano:

- business;
- pricing;
- cosa mostrare al cliente;
- accettare feature;
- toccare database;
- deploy importante;
- cambiare architettura;
- vendere/promettere.

---

## Hook design template

```md
# Hook Design

## Name
[nome]

## Trigger
[evento]

## Goal
[cosa protegge/automatizza]

## When to run
[condizioni]

## Action
[comando/endpoint/prompt]

## Blocking?
sì/no

## False positive risk
basso/medio/alto

## Files affected
...

## Rollback
...

## Owner
umano/agente
```

---

## Esempio hook design: Walbox critical file guard

```md
# Hook Design — Walbox Critical File Guard

## Trigger
PreToolUse / before edit

## Goal
Evitare modifiche accidentali a file core durante UI polish.

## When to run
Quando il workflow dichiarato è safe-ui-edit.

## Action
Se file target è:
- src/App.jsx
- src/services/walboxDb.js
- src/services/spotifyApi.js
- api/search.js
- vercel.json
allora blocca e chiedi conferma.

## Blocking?
Sì.

## False positive risk
Medio: a volte bisogna davvero modificare questi file.

## Rollback
N/A, blocca prima.
```

---

## Esempio hook design: post-edit build

```md
# Hook Design — Post Edit Build

## Trigger
PostToolUse / after file edit

## Goal
Scoprire build break subito.

## When to run
Dopo modifiche a `.jsx`, `.js`, `.ts`, `.tsx`.

## Action
Esegui:
npm run build

## Blocking?
Dipende: può bloccare avanzamento se fallisce.

## False positive risk
Medio: build può fallire per motivi già esistenti.

## Notes
Non usare su ogni micro edit se rallenta troppo.
```

---

## Esempio hook design: env guard

```md
# Hook Design — Env Guard

## Trigger
PreToolUse / before edit/read

## Goal
Proteggere segreti.

## Files
.env
.env.local
*.pem
*secret*
*token*

## Action
Blocca o chiedi conferma forte.

## Blocking?
Sì.

## False positive risk
Basso.

## Rule
Mai stampare contenuto segreti in output.
```

---

## Hook implementation caution

Questo file non fornisce configurazioni definitive da copiare alla cieca.

Perché?

- gli eventi e lo schema vanno verificati nella reference;
- i comandi dipendono da OS/progetto;
- hook sbagliati possono bloccare lavoro;
- path e matcher vanno testati;
- false positive possono diventare fastidiosi.

### Regola

> Progetta hook in markdown. Implementa solo dopo test manuale.

---

## Workflow per implementare un hook

```text
1. Identifica errore ricorrente.
2. Scrivi hook design.
3. Verifica se è deterministico.
4. Test manuale.
5. Implementa in progetto test.
6. Prova con caso positivo.
7. Prova con falso positivo.
8. Documenta.
9. Solo dopo usa nel progetto reale.
```

## Prompt

```text
Progetta un hook per prevenire questo errore:

[ERRORE]

Output:
1. trigger;
2. matcher;
3. azione;
4. blocking/non-blocking;
5. falso positivo;
6. test;
7. perché non basta un prompt.
```

---

## Workflow per decidere se automatizzare

```text
1. Quanto spesso succede?
2. Quanto costa l’errore?
3. È rilevabile automaticamente?
4. Il controllo è chiaro?
5. Rischia di bloccare lavoro buono?
6. Serve hook o basta checklist?
7. Serve CI o basta hook locale?
8. Serve umano?
```

### Prompt

```text
Valuta se questa regola deve diventare:
- prompt;
- skill;
- checklist;
- hook;
- CI;
- decisione umana.

Regola:
[REGOLA]

Output:
scelta + motivo.
```

---

## Automazioni leggere da fare prima

Prima di hooks complessi, puoi creare automazioni “soft”:

- checklist;
- prompt template;
- skills;
- review manuale;
- Git alias;
- npm scripts;
- Vercel checks;
- reminder checkpoint.

### Esempio

Invece di hook subito:

```json
"scripts": {
  "check": "npm run build"
}
```

Poi prompt:

```text
Dopo la patch esegui npm run check.
```

---

## Automazioni per file `.md`

Per AI Business Factory:

```text
Dopo ogni file creato:
- completezza;
- fonti;
- prossimo file;
- aggiornare ZIP;
- aggiornare index.
```

Questo al momento è manuale con Python/tool.

Più avanti:

```text
script generate_index.py
script zip_factory.py
script validate_md.py
```

---

## Automation roadmap per AI Business Factory

### Livello 1 — Manuale

- creare file `.md`;
- aggiornare ZIP;
- link finali;
- percentuale completezza.

### Livello 2 — Script

- generare indice file;
- contare righe/dimensione;
- creare ZIP;
- verificare sezioni obbligatorie.

### Livello 3 — Agent assistito

- Documentation Agent aggiorna indice;
- QA Agent controlla completezza;
- Token Saver Agent segnala file troppo lunghi.

### Livello 4 — CI

- validazione markdown;
- link checker;
- spell/style;
- build docs.

---

## Automation roadmap per Walbox

### Livello 1 — Manuale attuale

```text
git status
npm run build
Vercel deploy
test telefono/dashboard/TV
checkpoint
```

### Livello 2 — npm scripts

```text
npm run check
npm run build
npm run lint, se aggiunto
```

### Livello 3 — hooks locali

```text
build after edits
critical file guard
env guard
dependency guard
```

### Livello 4 — GitHub Actions

```text
build on push/PR
Vercel preview
maybe Claude review
```

### Livello 5 — product monitoring

```text
error logging
Supabase health
Spotify token status
usage analytics
```

---

## Safety checklist prima di automazione

```text
[ ] Il workflow manuale funziona?
[ ] L’errore è ricorrente?
[ ] È rilevabile automaticamente?
[ ] Il controllo non è ambiguo?
[ ] False positive accettabili?
[ ] Esiste rollback?
[ ] Non espone segreti?
[ ] Non blocca task legittimi?
[ ] È documentato?
[ ] È testato su caso finto?
```

---

## Approval checklist

```text
[ ] Azione reversibile?
[ ] Tocca file critici?
[ ] Tocca dati reali?
[ ] Tocca segreti?
[ ] Tocca deploy?
[ ] Tocca database?
[ ] Tocca routing?
[ ] Può rompere demo?
[ ] Può costare soldi?
[ ] Può esporre dati?
```

Più “sì” ci sono, più serve approvazione umana.

---

## Prompt master: hook planner

```text
Agisci come Hook Planner per Claude Code/AI Business Factory.

Workflow:
[WORKFLOW]

Problema da prevenire:
[PROBLEMA]

Output:
1. serve hook o no?
2. se no, cosa basta?
3. trigger ideale;
4. azione;
5. blocking/non-blocking;
6. file coinvolti;
7. falso positivo;
8. test;
9. implementazione roadmap;
10. rischio.
```

---

## Prompt master: automation planner

```text
Agisci come Automation Planner.

Processo:
[PROCESSO]

Valuta:
1. cosa automatizzare;
2. cosa lasciare manuale;
3. ordine di implementazione;
4. rischio;
5. effort;
6. valore;
7. prerequisiti;
8. fallback.
```

---

## Prompt master: approval policy

```text
Crea approval policy per questo progetto.

Progetto:
[PROGETTO]

Output:
1. azioni auto-approve;
2. azioni confirm;
3. azioni block;
4. file critici;
5. comandi sicuri;
6. comandi vietati;
7. note sicurezza.
```

---

## Policy base per Walbox

```md
# Walbox Approval Policy

## Auto
- leggere file UI;
- git status;
- git diff;
- npm run build;
- modificare file UI target se task lo richiede.

## Confirm
- App.jsx;
- walboxDb.js;
- spotifyApi.js;
- api/search.js;
- package.json;
- vercel.json;
- routing;
- git push.

## Block / strong confirm
- .env;
- segreti;
- Supabase schema;
- database destructive commands;
- delete files;
- git reset --hard;
- rm -rf;
- Spotify auth changes;
- deploy production.
```

---

## Hooks e Antigravity

Tu stai usando Antigravity, che ha proprie impostazioni di sicurezza, Review Policy e Strict mode.

Per ora, in Antigravity:

```text
Strict mode
Review Changes
Terminal command review
Non-workspace access bloccato
Overages OFF
Prompt “modifica solo file”
Git checkpoint
```

Questi sono già equivalenti manuali/ambientali di molti guardrail.

### Regola

> Non cercare di ricreare subito tutto con hooks Claude se Antigravity Strict + review già protegge.

---

## Hooks e Claude Code web/CLI

Quando userai Claude Code:

- prima test su progetto non critico;
- usare read-only;
- non attivare auto mode totale;
- definire settings;
- provare notification hook;
- poi guard rails leggeri;
- solo dopo hooks bloccanti.

---

## Dangerous shortcuts

Evita:

```text
--dangerously-skip-permissions
```

salvo contesto isolato/test/sandbox molto chiaro.

La comodità può diventare rischio.

### Regola

> Se non capisci il rischio di un flag, non usarlo.

---

## Completezza stimata

Completezza attuale: 86%

### Coperto bene

- cosa sono hooks;
- perché servono;
- differenza hooks/skills/agents/workflow;
- lifecycle concettuale;
- tipi di hooks;
- notification;
- post-edit build;
- critical file guard;
- env guard;
- destructive commands;
- git status;
- checkpoint reminder;
- dependency guard;
- migration guard;
- auto mode/approval fatigue;
- sandbox;
- GitHub Actions;
- roadmap Walbox;
- roadmap AI Business Factory;
- policy base;
- prompt planner;
- automation planning.

### Da approfondire nei file dedicati

- JSON esatto hooks Claude Code;
- eventi/matcher ufficiali completi;
- esempi funzionanti macOS/Linux/Windows;
- implementazione reale su progetto test;
- HTTP hooks;
- prompt hooks;
- MCP tool hooks;
- CI GitHub Actions completa;
- Vercel integration;
- Supabase migration hooks;
- secret scanning;
- policy enterprise;
- sandbox setup pratico.

---

## Prossimo file consigliato

```text
12_MCP_AND_AGENT_SDK_ROADMAP.md
```

Perché dopo hooks/automation serve capire la roadmap avanzata: MCP, Agent SDK, tool orchestration, agenti custom, e quando questa roba serve davvero rispetto al MVP.

<!-- END_SOURCE_FILE: 11_HOOKS_AND_AUTOMATION.md -->


<!-- BEGIN_SOURCE_FILE: 12_MCP_AND_AGENT_SDK_ROADMAP.md -->
<!-- SOURCE_SHA256_UTF8: 3dbd4a3e53a7027361a65443dcf09f65813b9786be4ff48f0a277ebe5beda4c2 -->
<!-- SOURCE_CHAR_COUNT: 26178 -->

# 12_MCP_AND_AGENT_SDK_ROADMAP.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Advanced Agents & Tools  
Completezza stimata: 88%

---

## Scopo del file

Questo file spiega **MCP** e **Claude Agent SDK** come roadmap avanzata per la tua AI Business Factory.

L’obiettivo non è implementare subito agenti custom complessi.

L’obiettivo è capire:

- cos’è MCP;
- cos’è Agent SDK;
- quando servono davvero;
- quando sono overkill;
- come si collegano a Claude Code, skills, sub-agents, hooks e tools;
- quali problemi risolvono;
- quali nuovi problemi creano;
- come potrebbero servire un domani per Walbox e per business con clienti;
- quale roadmap seguire senza complicare l’MVP.

La regola centrale:

> Prima crea workflow manuali ripetibili. Solo dopo trasformali in agenti custom o integrazioni MCP.

---

## Fonti ufficiali usate

Fonti principali:

1. Connect Claude Code to tools via MCP  
   https://docs.anthropic.com/en/docs/claude-code/mcp

2. What is the Model Context Protocol  
   https://docs.anthropic.com/en/docs/agents-and-tools/mcp

3. MCP connector — Claude API Docs  
   https://docs.anthropic.com/en/docs/agents-and-tools/mcp-connector

4. Remote MCP servers  
   https://docs.anthropic.com/en/docs/agents-and-tools/remote-mcp-servers

5. Agent SDK overview — Claude Code Docs  
   https://docs.anthropic.com/en/docs/claude-code/sdk

6. Agent SDK TypeScript reference  
   https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript

7. Agent SDK Python reference  
   https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-python

8. Client SDKs — Claude API Docs  
   https://docs.anthropic.com/en/api/client-sdks

9. Tool use overview  
   https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview

10. Define tools / implement tool use  
    https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use

11. Code execution tool  
    https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool

12. Writing effective tools for AI agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

13. Code execution with MCP  
    https://www.anthropic.com/engineering/code-execution-with-mcp

14. Advanced tool use  
    https://www.anthropic.com/engineering/advanced-tool-use

15. Building Agents with the Claude Agent SDK  
    https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk

16. Create custom subagents  
    https://docs.anthropic.com/en/docs/claude-code/sub-agents

17. Claude Code Skills  
    https://docs.anthropic.com/en/docs/claude-code/skills

18. Claude Code Hooks Reference  
    https://docs.anthropic.com/en/docs/claude-code/hooks

19. Effective Context Engineering for AI Agents  
    https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

20. Context windows  
    https://docs.anthropic.com/en/docs/build-with-claude/context-windows

21. Claude Code release notes / changelog  
    https://docs.anthropic.com/en/release-notes/claude-code

---

## Sintesi brutale

MCP e Agent SDK sono roba potente, ma non sono il primo step.

### MCP

MCP è uno standard aperto per collegare applicazioni AI a strumenti, dati e workflow esterni.

Tradotto:

```text
L'agente può collegarsi a database, file, GitHub, monitoring, issue tracker, servizi, API e tool attraverso un'interfaccia standard.
```

Anthropic lo descrive spesso come una specie di “USB-C per applicazioni AI”.

### Agent SDK

Agent SDK permette di costruire agenti custom con le capacità che rendono potente Claude Code:

- built-in tools;
- hooks;
- sub-agents;
- MCP;
- permissions;
- sessions;
- file reading;
- command execution;
- codebase search.

Tradotto:

```text
Invece di usare Claude Code manualmente, puoi costruire un tuo agente programmabile.
```

---

## Regola madre

```text
MCP e Agent SDK servono quando hai già un workflow chiaro, ripetibile e di valore.
```

Non servono quando:

- stai ancora capendo l’idea;
- stai facendo MVP;
- il task è manuale e raro;
- non hai clienti;
- non hai processi ripetuti;
- non sai quali tool servono;
- non hai controllo su costi/token;
- non hai safety/permissions.

---

## Dove si collocano nella AI Business Factory

La tua Factory ha livelli.

### Livello 1 — Chat/manuale

```text
ChatGPT + Claude/Antigravity manuale
```

Uso:

- brainstorming;
- prompt;
- file `.md`;
- Walbox MVP;
- demo;
- pitch;
- workflow manuali.

### Livello 2 — Project memory + skills

```text
CLAUDE.md
PROJECT_CONTEXT.md
SKILL.md
SAFE_WORKFLOWS.md
```

Uso:

- ridurre ripetizione;
- standardizzare lavoro.

### Livello 3 — Sub-agents + hooks

```text
Frontend Agent
QA Agent
Token Saver
Hooks build/guard
```

Uso:

- task specializzati;
- controlli automatici.

### Livello 4 — MCP

```text
collegare agenti a tool esterni
```

Uso:

- database;
- GitHub;
- issue tracker;
- monitoring;
- CRM;
- analytics;
- docs.

### Livello 5 — Agent SDK

```text
costruire agenti custom tuoi
```

Uso:

- prodotto agentico;
- automazione cliente;
- workflow ripetibile;
- orchestrazione strumenti.

---

## Cos’è MCP in pratica

MCP, Model Context Protocol, standardizza il modo in cui un’app AI riceve contesto e usa strumenti esterni.

Un MCP server può esporre:

- risorse;
- tool;
- prompt;
- accesso a sistemi;
- funzioni;
- dati;
- workflow.

Esempio:

```text
Claude Code ↔ MCP Server GitHub ↔ issue/PR/repo
Claude Code ↔ MCP Server database ↔ query dati
Claude Code ↔ MCP Server monitoring ↔ errori produzione
Claude Code ↔ MCP Server Supabase ↔ tabella/edge functions
```

---

## Quando MCP è utile

Usa MCP quando ti trovi spesso a fare questo:

```text
copio dati da uno strumento → li incollo in chat → chiedo all’agente → ricopio risultato nello strumento
```

Esempi:

- copi issue GitHub in chat;
- copi errori Sentry/log in chat;
- copi righe Supabase;
- copi dati CRM;
- copi analytics;
- copi documentazione interna;
- copi status deploy;
- copi dashboard.

MCP può permettere all’agente di leggere/agire direttamente.

---

## Quando MCP è overkill

MCP è eccessivo se:

- hai pochi dati;
- copi/incolli raramente;
- il workflow non è stabile;
- non sai cosa automatizzare;
- non hai permessi/sicurezza chiari;
- stai ancora facendo demo;
- lavori da solo su MVP;
- un semplice file `.md` basta;
- un tool web/manuale basta.

### Per Walbox ora

MCP non è priorità.

Walbox ora ha bisogno di:

- demo stabile;
- pitch;
- test locale;
- polishing mirato;
- eventuale clonazione per altro locale.

MCP può aspettare.

---

## MCP e token: attenzione

MCP non è automaticamente risparmio.

Le fonti Anthropic su MCP/code execution e advanced tool use evidenziano un problema:

```text
troppe tool definitions possono riempire la context window
```

e:

```text
i risultati intermedi dei tool consumano token.
```

Quindi MCP può aumentare costi se colleghi troppi server/tool.

### Regola

> MCP migliora efficienza solo se i tool sono pochi, mirati e context-efficient.

---

## Regole per MCP efficiente

1. Non collegare tool inutili.
2. Usa tool piccoli.
3. Filtra risultati.
4. Paginazione sempre.
5. Range selection.
6. Risposte compatte.
7. Default limit sensati.
8. Niente dump enormi.
9. Ogni tool deve avere descrizione chiara.
10. Ogni tool deve avere caso d’uso preciso.

---

## Tool design per agenti

Le fonti Anthropic su “Writing effective tools for agents” spiegano un concetto fondamentale:

> un tool progettato per umani non è sempre buono per agenti.

Gli agenti hanno bisogno di tool:

- con descrizioni chiare;
- input semplici;
- output compatti;
- filtri;
- limiti;
- errori leggibili;
- azioni atomic;
- nomi chiari.

### Cattivo tool

```text
getEverything()
```

### Buon tool

```text
searchSongRequests(status, limit, dateRange)
getPendingRequests(limit)
updateRequestStatus(id, status)
```

---

## MCP per Walbox: possibili casi futuri

### 1. Supabase MCP

Permettere agente di leggere:

- richieste recenti;
- errori;
- stato queue;
- statistiche;
- tavoli attivi;
- richieste pending/approved/played.

Uso futuro:

```text
Analizza la serata e crea report per il locale.
```

### 2. GitHub MCP

Permettere agente di:

- leggere issue;
- creare branch;
- aprire PR;
- commentare;
- fare review.

Uso futuro:

```text
Crea PR per fix UI mobile.
```

### 3. Vercel MCP / deploy monitoring

Permettere agente di:

- controllare deploy;
- leggere log;
- segnalare errori;
- diagnosticare fallimenti.

Uso futuro:

```text
Perché deploy Vercel è fallito?
```

### 4. Spotify/internal tool

Permettere agente/app di:

- controllare playback;
- leggere device;
- analizzare coda;
- gestire fallback.

Attenzione: questo potrebbe non richiedere MCP; può bastare API diretta.

### 5. Client CRM / spreadsheet MCP

Per business:

- lista locali;
- stato contatti;
- follow-up;
- offerte;
- note obiezioni;
- prezzi.

Uso futuro:

```text
Prepara follow-up per i 5 locali contattati questa settimana.
```

---

## MCP per AI Business Factory

Possibili server/tool futuri:

```text
docs index reader
project memory reader
checkpoint search
prompt library search
client context database
pricing calculator
github issue reader
vercel deploy reader
supabase analytics reader
```

Ma prima crea i file `.md`.

---

## Cos’è Agent SDK in pratica

Agent SDK permette di costruire agenti applicativi con capacità simili a Claude Code.

La documentazione indica capacità come:

- built-in tools;
- hooks;
- subagents;
- MCP;
- permissions;
- sessions;
- read files;
- run commands;
- search codebases.

Tradotto:

```text
Claude Code è un prodotto.
Agent SDK ti permette di costruire un tuo “mini Claude Code” per workflow specifici.
```

---

## Quando Agent SDK è utile

Serve quando vuoi:

- creare un agente dentro un tuo prodotto;
- automatizzare workflow ripetibili;
- orchestrare tool;
- gestire sessioni;
- costruire agenti per clienti;
- collegare sub-agents;
- usare permessi;
- creare un servizio agentico;
- far lavorare AI su file/tool in modo programmato;
- creare dashboard agentica.

---

## Quando Agent SDK è overkill

Non serve per:

- creare file `.md`;
- fare prompt manuali;
- MVP Walbox;
- polish UI;
- pitch;
- documentazione;
- ricerca semplice;
- business validation manuale;
- task occasionali.

### Regola

> Agent SDK serve quando stai costruendo prodotto agentico, non solo usando agenti.

---

## Differenza tra Claude Code e Agent SDK

### Claude Code

Usi tu direttamente.

```text
tu → Claude Code → repo/files/terminal
```

Ottimo per:

- sviluppo;
- debug;
- refactor;
- codebase;
- task manuali assistiti.

### Agent SDK

Lo usi per costruire un tuo agente.

```text
utente/prodotto → tuo agente SDK → tools/files/MCP/API
```

Ottimo per:

- automazioni;
- SaaS agentico;
- workflow cliente;
- agenti custom;
- prodotto scalabile.

---

## Differenza tra API SDK e Agent SDK

### Client SDK / API SDK

Serve a chiamare Claude da codice.

Esempi:

```text
Python SDK
TypeScript SDK
Java SDK
Go SDK
Ruby SDK
```

### Agent SDK

Aggiunge logiche agentiche:

- tools;
- sessions;
- permissions;
- hooks;
- subagents;
- MCP;
- file/command capabilities.

### Regola

> API SDK = chiamare modello.  
> Agent SDK = costruire agente.

---

## Possibili prodotti futuri con Agent SDK

### 1. Walbox Manager Assistant

Agente che:

- legge richieste;
- suggerisce approvazione;
- crea recap serata;
- genera post social;
- segnala tavolo più attivo;
- prepara promo.

### 2. Local Business AI Operator

Per bar/locali:

- genera post;
- prepara eventi;
- analizza feedback;
- gestisce follow-up;
- crea promo;
- produce report.

### 3. Expedia-style Support Agent

Per knowledge base:

- legge policy;
- analizza ticket;
- propone risposta;
- crea internal comments;
- non inventa policy.

### 4. AI Business Factory Assistant

Agente interno tuo:

- crea project context;
- sceglie workflow;
- crea prompt;
- aggiorna checkpoint;
- aggiorna file `.md`;
- prepara pitch.

### 5. Client Onboarding Agent

Per nuovi locali:

- raccoglie info;
- crea brand context;
- genera demo plan;
- produce proposta;
- aggiorna CRM.

---

## Agent SDK per Walbox: roadmap realistica

### Ora

Non serve.

Fai:

```text
React/Vite + Supabase + Spotify + Vercel + manual agent workflow
```

### Dopo demo stabile e primi clienti

Potrebbe servire per:

```text
report automatici serata
social content generator
client dashboard assistant
setup wizard per nuovo locale
```

### Molto dopo

Potrebbe servire per:

```text
multi-tenant AI assistant
analytics agent
support agent
campaign agent
loyalty recommendation agent
```

---

## MCP vs API diretta

Non tutto deve passare da MCP.

Esempio Walbox:

Spotify playback:

```text
Meglio API diretta Spotify già integrata.
```

Supabase app data:

```text
Meglio Supabase client/API diretta per frontend/backend.
```

MCP:

```text
utile se vuoi far usare quei dati a un agente general-purpose.
```

### Regola

> Se è logica prodotto, usa API diretta.  
> Se è accesso agentico flessibile a tool/dati, valuta MCP.

---

## Agent SDK vs semplice script

Non tutto richiede Agent SDK.

Per automatizzare:

```text
zip file
generare indice
contare righe
validare markdown
```

basta script Python/Node.

Agent SDK serve quando:

```text
serve ragionamento + tool + iterazione + decisioni.
```

### Regola

> Script per procedure deterministiche.  
> Agent SDK per workflow agentici.

---

## Agent loop

Dalle fonti Anthropic sugli agenti emerge un loop tipico:

```text
gather context → act → verify → repeat
```

Per te:

```text
Context → Action → Verify → Checkpoint
```

Ogni agente custom deve avere questo ciclo.

### Anti-pattern

```text
Prompt → output enorme → nessuna verifica
```

---

## Permissions

Agent SDK e Claude Code includono concetti di permissions.

Per un agente serio devi definire:

- cosa può leggere;
- cosa può modificare;
- quali tool può usare;
- quali comandi può eseguire;
- cosa richiede conferma;
- cosa è vietato.

### Esempio Walbox Manager Assistant

Può:

- leggere richieste;
- generare recap;
- suggerire contenuti.

Non può:

- cancellare database;
- leggere segreti;
- modificare schema;
- pubblicare social automaticamente senza conferma;
- cambiare pagamento/coupon reali.

---

## Sessions

Agent SDK può gestire sessioni.

Le sessioni servono per:

- conversazioni multi-turn;
- mantenere stato;
- riprendere workflow;
- tracciare task;
- separare clienti/progetti.

Per business:

```text
una sessione per cliente/progetto/task.
```

Non:

```text
un’unica sessione infinita per tutto.
```

---

## Built-in tools

Agent SDK offre strumenti integrati simili a Claude Code.

Potenziali capacità:

- leggere file;
- eseguire comandi;
- cercare codebase;
- lavorare su repo;
- usare hooks;
- usare MCP.

### Regola

> Ogni tool va dato solo se serve al ruolo.

Sales Agent non deve avere terminale.  
Frontend Agent non deve avere database admin.  
Research Agent non deve poter modificare file critici.

---

## Code execution tool

Claude API offre anche code execution sandboxed per analisi, file, calcoli e operazioni in ambiente sicuro.

Per te:

- utile per generare artifact;
- analizzare dati;
- creare file;
- processare CSV;
- generare report.

Non confonderlo con:

- Agent SDK completo;
- MCP;
- Claude Code su repo locale.

### Regola

> Code execution = ambiente computazionale sandbox.  
> Agent SDK = orchestrazione agentica.  
> MCP = connessione standard a tool esterni.

---

## Roadmap pratica: cosa fare prima

### Fase 1 — Manuale

Hai già iniziato:

```text
file .md
workflow
prompt
skills
agents
checkpoint
```

### Fase 2 — Antigravity/Claude Code disciplinato

```text
usare prompt/template
safe workflows
review changes
git
```

### Fase 3 — Skills reali

```text
frontend-safe-edit
walbox-dev
qa-review
token-saver
pitch-builder
```

### Fase 4 — Sub-agents reali

```text
Frontend Agent
QA Agent
Research Agent
Sales Agent
Token Saver
```

### Fase 5 — Hooks

```text
build
critical file guard
env guard
checkpoint reminder
```

### Fase 6 — MCP

Solo se:

```text
copi dati spesso da tool esterni
```

### Fase 7 — Agent SDK

Solo se:

```text
vuoi costruire un prodotto/servizio agentico custom
```

---

## Decision tree: serve MCP?

```text
Devo collegare un agente a un sistema esterno?
  no → niente MCP
  sì →
    Lo faccio raramente?
      sì → copia/incolla o API manuale
      no →
        Esiste API diretta semplice?
          sì → valuta API diretta
          no/serve standard tool → valuta MCP
```

---

## Decision tree: serve Agent SDK?

```text
Devo solo usare Claude/Antigravity?
  sì → niente Agent SDK

Devo costruire un agente dentro un prodotto?
  no → niente Agent SDK
  sì →
    Workflow è chiaro e ripetibile?
      no → prima workflow manuale
      sì →
        Serve tool/permissions/sessions?
          sì → Agent SDK può servire
          no → API SDK semplice può bastare
```

---

## Decision tree: serve API SDK semplice?

```text
Devo chiamare Claude da codice?
  no → niente API SDK
  sì →
    Serve solo input/output?
      sì → Client SDK
    Serve agente con tool/sessioni?
      sì → Agent SDK
```

---

## Decision tree: serve script?

```text
Task deterministico?
  sì → script
Task richiede ragionamento?
  sì → agente
```

Esempi script:

- zip cartella;
- contare righe;
- validare file;
- generare indice.

Esempi agente:

- scegliere workflow;
- analizzare cliente;
- sintetizzare fonti;
- creare pitch;
- diagnosticare bug.

---

## MCP Tool Design Template

```md
# MCP Tool Design

## Tool name
[nome]

## Purpose
[cosa fa]

## Use when
[quando usarlo]

## Inputs
[parametri]

## Output
[formato compatto]

## Limits
- pagination
- max results
- filters

## Permissions
[read/write/admin]

## Risks
[segreti, dati, cancellazioni]

## Example call

## Example output

## Failure modes

## Human confirmation required?
```

---

## Agent SDK Agent Design Template

```md
# Agent Design

## Agent name

## Goal

## Users

## Tools

## Permissions

## Memory

## Skills

## Workflow

## Stop conditions

## Verification

## Logs/artifacts

## Human approval points

## Cost controls

## Failure modes

## Rollback
```

---

## Esempio: Walbox Night Recap Agent

```md
# Agent Design — Walbox Night Recap Agent

## Goal
Creare recap della serata per il locale e social media manager.

## Inputs
- song_requests della serata;
- mood/reaction;
- tavoli;
- canzoni più richieste;
- dediche migliori;
- eventuali momenti live.

## Tools
- Supabase read-only;
- template social;
- optional image/text generator.

## Permissions
Read-only su database.
Nessuna cancellazione.
Nessuna pubblicazione automatica.

## Output
- recap in italiano;
- top 5 canzoni;
- tavolo più attivo;
- frasi social;
- story ideas;
- post caption;
- dati per dashboard.

## Human approval
Prima di pubblicare qualsiasi contenuto.

## Risk
Dati personali/nickname/dediche inappropriate.
Serve filtro.
```

---

## Esempio: AI Business Factory Documentation Agent

```md
# Agent Design — Factory Documentation Agent

## Goal
Aggiornare file .md della AI Business Factory.

## Tools
- read/write file docs;
- source index;
- optional web research;
- zip generator script.

## Permissions
Può modificare solo cartella docs.
Non può toccare codice cliente.

## Workflow
1. legge task;
2. identifica file;
3. aggiorna sezioni;
4. cita fonti;
5. aggiorna completezza;
6. aggiorna zip.

## Stop conditions
Se serve fonte aggiornata e non disponibile, segnala.
Se file target non chiaro, propone piano.
```

---

## Esempio: Client Setup Agent

```md
# Agent Design — Client Setup Agent

## Goal
Preparare demo personalizzata per nuovo locale.

## Inputs
- nome locale;
- brand;
- target;
- obiezioni;
- feature demo;
- template Walbox.

## Tools
- file docs;
- maybe code repo;
- prompt library.

## Output
- CLIENT_CONTEXT.md;
- PROJECT_CONTEXT.md;
- pitch;
- task list UI;
- prompt per Frontend Agent.

## Permissions
Non modifica backend core.
Non cambia database.
Non deploya senza conferma.
```

---

## Rischi MCP/Agent SDK

### 1. Complessità prematura

Costruire agenti custom prima di avere utenti.

### 2. Tool overload

Troppi tool nel contesto.

### 3. Costi nascosti

Tool results, retry, sessioni lunghe.

### 4. Permessi troppo larghi

Agente può fare danni.

### 5. Dati sensibili

Clienti, API keys, segreti, messaggi.

### 6. Debug difficile

Agenti custom possono essere più difficili da capire.

### 7. Manutenzione

API/tool/server cambiano.

### 8. Vendor lock-in

Workflow troppo legato a un solo ecosistema.

---

## Regole sicurezza

1. Principle of least privilege.
2. Read-only prima di write.
3. No secrets in prompt.
4. No destructive actions automatiche.
5. Human approval per publish/deploy/delete.
6. Tool output limitato.
7. Logs controllati.
8. Sessioni separate per cliente.
9. Audit trail.
10. Rollback.

---

## Agent SDK cost control

Ogni agente custom deve avere:

- max steps;
- max tool calls;
- max output;
- timeout;
- stop conditions;
- logging;
- human approval;
- retry limit;
- context compression;
- tool filtering.

### Prompt/Policy

```text
L'agente deve fermarsi se:
- servono più di N tool calls;
- non trova dati;
- vuole modificare file critici;
- supera lo scope;
- richiede segreti;
- deve pubblicare/deployare.
```

---

## MCP cost control

Per ogni MCP server:

```text
1. Quanti tool espone?
2. Quanto pesano le tool definitions?
3. I risultati sono filtrabili?
4. C’è pagination?
5. C’è limit default?
6. Può restituire dati sensibili?
7. Serve davvero sempre?
8. Può essere collegato solo on-demand?
```

---

## Tool response rules

Buon output tool:

```json
{
  "items": [
    {"id": "...", "status": "pending", "song": "..."}
  ],
  "count": 10,
  "nextPage": null
}
```

Cattivo output tool:

```text
Dump completo database con 10.000 righe.
```

---

## Walbox MCP roadmap

### Non ora

- niente MCP per MVP demo;
- niente Agent SDK per queue;
- niente multi-tool orchestration.

### Prima possibile ma non urgente

- Supabase read-only reporting;
- GitHub issue/PR se progetto cresce;
- Vercel deploy logs;
- simple analytics.

### Dopo primi clienti

- client context database;
- report serata automatico;
- social content assistant;
- setup nuovo locale.

### Prodotto avanzato

- multi-tenant agent assistant;
- loyalty recommendation;
- campaign automation;
- support assistant;
- CRM follow-up.

---

## AI Business Factory MCP roadmap

### Fase 1

File `.md` manuali.

### Fase 2

Script locali:

- zip;
- index;
- validate;
- count.

### Fase 3

Tool interni:

- search docs;
- retrieve checkpoint;
- update index.

### Fase 4

MCP server locale:

- espone docs;
- espone prompts;
- espone templates;
- espone project contexts.

### Fase 5

Agent SDK assistant:

- Factory Assistant;
- crea progetto;
- sceglie workflow;
- aggiorna files;
- genera prompt;
- prepara pitch.

---

## Cosa NON fare ora

Non fare ora:

- Agent SDK per Walbox MVP;
- MCP multi-server;
- automazioni database write;
- social posting automatico;
- multi-tenant agent;
- billing automatico;
- agenti che modificano produzione;
- server custom complessi;
- tool senza permessi.

### Regola

> Se non hai workflow manuale validato, non automatizzarlo.

---

## Cosa fare ora

Fai ora:

1. Completare file AI Business Factory.
2. Creare skill reali principali.
3. Usare prompt in Antigravity/Claude.
4. Testare workflow su Walbox.
5. Creare checklist cliente.
6. Creare pitch.
7. Creare checkpoint.
8. Solo dopo valutare automazioni.

---

## Prompt master: MCP evaluator

```text
Agisci come MCP Evaluator.

Workflow:
[workflow]

Valuta:
1. stiamo copiando dati spesso da tool esterni?
2. quali tool/sistemi servirebbero?
3. MCP è necessario o basta API/script/manuale?
4. quali permessi minimi?
5. rischio token/tool overload;
6. dati sensibili;
7. MVP ora o roadmap;
8. decisione finale.
```

---

## Prompt master: Agent SDK evaluator

```text
Agisci come Agent SDK Evaluator.

Idea agente:
[idea]

Valuta:
1. è un prodotto agentico o solo un task manuale?
2. workflow è ripetibile?
3. utenti reali?
4. tool necessari;
5. permissions;
6. sessioni;
7. cost controls;
8. cosa fare prima senza SDK;
9. decisione: ora / più avanti / no.
```

---

## Prompt master: tool designer

```text
Progetta un tool per agente.

Use case:
[use case]

Output:
1. nome tool;
2. purpose;
3. input schema;
4. output compatto;
5. filtri/pagination;
6. permessi;
7. errori;
8. esempi;
9. rischio token;
10. human confirmation.
```

---

## Prompt master: agent design

```text
Progetta un agente custom.

Obiettivo:
[obiettivo]

Output:
1. nome;
2. utenti;
3. goal;
4. tools;
5. MCP necessari;
6. skills;
7. memory;
8. permissions;
9. workflow;
10. stop conditions;
11. cost controls;
12. human approval;
13. MVP agent v1.
```

---

## Decisione operativa finale

Per te, oggi:

```text
MCP = sapere cosa è e tenerlo in roadmap.
Agent SDK = sapere cosa può diventare, non implementarlo ora.
```

Il percorso corretto:

```text
Manuale → workflow → skills → sub-agents → hooks → MCP → Agent SDK
```

Non:

```text
idea → Agent SDK → caos
```

---

## Completezza stimata

Completezza attuale: 88%

### Coperto bene

- MCP spiegato;
- Agent SDK spiegato;
- differenza MCP/API/script/SDK;
- quando usarli;
- quando evitarli;
- token/tool overload;
- tool design;
- permissions;
- sessions;
- Walbox roadmap;
- AI Business Factory roadmap;
- cost controls;
- safety;
- decision trees;
- templates;
- prompt master;
- agent design examples.

### Da approfondire nei file dedicati

- implementazione MCP server reale;
- configurazione Claude Code MCP;
- remote MCP server specifici;
- MCP connector API con beta header;
- Agent SDK TypeScript esempi reali;
- Agent SDK Python esempi reali;
- sessions persistenti;
- permissions config reale;
- built-in tools reali;
- deploy agent custom;
- monitoring/cost dashboard;
- integration con Supabase/GitHub/Vercel reali;
- confronto con OpenAI Agents SDK / Google ADK;
- security review avanzata.

---

## Prossimo file consigliato

```text
13_TOOL_USE_AND_TOOL_DESIGN.md
```

Perché dopo MCP/Agent SDK serve definire bene come progettare tool per agenti: tool piccoli, input chiari, output compatti, permessi minimi e anti-token-overload.

<!-- END_SOURCE_FILE: 12_MCP_AND_AGENT_SDK_ROADMAP.md -->


<!-- BEGIN_SOURCE_FILE: 13_TOOL_USE_AND_TOOL_DESIGN.md -->
<!-- SOURCE_SHA256_UTF8: 30a3d71f9ae556119b1b6f8ed13d3f622e366d3c75dc6dd3a1f1e0fa495b09d9 -->
<!-- SOURCE_CHAR_COUNT: 27833 -->

# 13_TOOL_USE_AND_TOOL_DESIGN.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Tools & Automation  
Completezza stimata: 90%

---

## Scopo del file

Questo file spiega come progettare, scegliere e usare **tool per agenti AI** nella tua AI Business Factory.

L’obiettivo è evitare l’errore più comune:

```text
dare all’agente troppi strumenti, troppo generici, troppo rumorosi e troppo costosi.
```

Questo file serve per capire:

- cos’è un tool;
- come Claude usa i tool;
- differenza tra tool, MCP, API, script, skill e agente;
- come progettare tool piccoli e utili;
- come descrivere bene un tool;
- come ridurre token e contesto;
- come evitare tool overload;
- come progettare strumenti futuri per Walbox;
- come capire se serve davvero un tool o basta prompt/script;
- come creare tool sicuri per clienti reali.

La regola centrale:

> Un tool buono fa una cosa chiara, con input chiari e output compatto.

---

## Fonti ufficiali usate

Fonti principali:

1. Tool use with Claude — Claude API Docs  
   https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview

2. Define tools / implement tool use — Claude API Docs  
   https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use

3. Writing effective tools for AI agents — Anthropic Engineering  
   https://www.anthropic.com/engineering/writing-tools-for-agents

4. Introducing advanced tool use on the Claude Developer Platform  
   https://www.anthropic.com/engineering/advanced-tool-use

5. Effective Context Engineering for AI Agents  
   https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

6. Code execution with MCP: Building more efficient agents  
   https://www.anthropic.com/engineering/code-execution-with-mcp

7. Tool use pricing / Claude Pricing  
   https://docs.anthropic.com/en/docs/about-claude/pricing

8. Code execution tool — Claude API Docs  
   https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/code-execution-tool

9. Text editor tool — Claude API Docs  
   https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/text-editor-tool

10. Web search tool — Claude API Docs  
    https://docs.anthropic.com/en/docs/build-with-claude/tool-use/web-search-tool

11. Create custom subagents — Claude Code Docs  
    https://docs.anthropic.com/en/docs/claude-code/sub-agents

12. Agent SDK overview — Claude Code Docs  
    https://docs.anthropic.com/en/docs/claude-code/sdk

13. Model Context Protocol — Claude API Docs  
    https://docs.anthropic.com/en/docs/agents-and-tools/mcp

14. Claude Code Best Practices  
    https://www.anthropic.com/engineering/claude-code-best-practices

15. Multi-agent Research System — Anthropic Engineering  
    https://www.anthropic.com/engineering/multi-agent-research-system

16. Demystifying evals for AI agents  
    https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents

---

## Sintesi brutale

Un tool è una capacità esterna che l’agente può usare.

Claude può decidere di chiamare uno strumento in base:

- alla richiesta utente;
- alla descrizione del tool;
- allo schema input;
- al contesto;
- agli strumenti disponibili.

La documentazione Claude spiega che, nel tool use, Claude genera una chiamata strutturata; poi l’applicazione o il server esegue il tool e restituisce il risultato al modello.

Tradotto:

```text
Claude decide “devo usare questo tool”.
Il sistema esegue il tool.
Il risultato torna a Claude.
Claude continua il lavoro.
```

---

## Regola madre

```text
Non dare tool perché puoi.
Dai tool perché servono al task.
```

Un agente con 3 tool chiari spesso lavora meglio di un agente con 50 tool confusi.

---

## Il rischio: tool overload

Anthropic ha evidenziato che le definizioni tool possono consumare moltissimi token prima ancora che la conversazione inizi. Negli articoli su advanced tool use e MCP/code execution si parla di tool definitions che possono arrivare a decine di migliaia di token, fino a oltre 100K in casi complessi.

Il problema non è solo costo.

È anche:

- scelta tool sbagliata;
- parametri sbagliati;
- tool simili confusi;
- contesto pieno;
- latenza;
- output rumoroso;
- agenti meno affidabili.

### Regola

> Più tool non significa agente più capace. Spesso significa agente più confuso.

---

## Tool use: modello mentale

```text
User request
↓
Model reads available tools
↓
Model decides whether tool needed
↓
Model emits tool call
↓
Tool executes outside model
↓
Tool result returns
↓
Model continues
```

Quindi la qualità dipende da:

- tool name;
- tool description;
- input schema;
- output format;
- errors;
- permissions;
- context size;
- whether tool is actually needed.

---

## Differenza tra tool, API, script, MCP, skill, agente

### Tool

Funzione usabile dall’agente.

Esempio:

```text
getPendingRequests(limit)
```

### API

Interfaccia di un servizio.

Esempio:

```text
Spotify API, Supabase API
```

### Script

Procedura deterministica.

Esempio:

```text
zip_factory.py
```

### MCP

Protocollo standard per esporre tool/dati a modelli AI.

### Skill

Istruzione/competenza riutilizzabile.

Esempio:

```text
frontend-safe-edit
```

### Agente

Ruolo che usa skill e tool.

Esempio:

```text
Walbox Night Recap Agent
```

---

## Quando serve un tool

Serve un tool quando l’agente deve:

- leggere dati esterni;
- scrivere dati esterni;
- eseguire calcoli;
- manipolare file;
- cercare web;
- interrogare database;
- chiamare API;
- eseguire comandi;
- generare artifact;
- interagire con applicazioni;
- automatizzare processo ripetibile.

### Esempi

```text
search_docs(query)
get_recent_song_requests(date)
create_checkpoint(project, content)
search_spotify_track(query)
get_vercel_deploy_status(project)
```

---

## Quando NON serve un tool

Non serve un tool quando:

- il task è puramente di ragionamento;
- basta una risposta testuale;
- i dati sono già forniti;
- il workflow è raro;
- non hai API stabile;
- lo script deterministico basta;
- l’agente non deve agire fuori dalla chat;
- il rischio sicurezza è alto e il valore basso.

### Esempio

Per scrivere un pitch Walbox non serve tool database.

Serve:

```text
Client Context + Sales Agent + pitch-builder
```

---

## Decision tree: serve tool?

```text
Il task richiede dati o azioni esterne?
  no → niente tool
  sì →
    È ripetibile?
      no → forse manuale
      sì →
        È deterministico?
          sì → script/tool semplice
          no →
            Serve ragionamento + tool?
              sì → agente con tool
```

---

## Tool design: principio atomicità

Un tool deve fare una cosa piccola.

### Cattivo tool

```text
manageWalbox()
```

Troppo generico.

### Buoni tool

```text
getPendingSongRequests(limit)
approveSongRequest(requestId)
rejectSongRequest(requestId, reason)
getNowPlaying()
createNightRecap(date)
```

### Regola

> Tool piccolo = scelta più facile + meno errori.

---

## Tool design: naming

Il nome deve dire cosa fa.

### Buoni nomi

```text
get_pending_requests
approve_request
search_spotify_track
get_vercel_deploy_status
create_checkpoint_file
summarize_night_requests
```

### Cattivi nomi

```text
handle_data
do_action
process
manager
walbox_tool
run
```

### Regola

> Se un umano non capisce quale tool usare dal nome, neanche l’agente lo farà bene.

---

## Tool descriptions

Le docs Claude sottolineano l’importanza di descrizioni molto chiare e dettagliate per i tool. Le descrizioni aiutano Claude a capire quando usare il tool, cosa fa, cosa non fa, quali input servono e quali output aspettarsi.

### Tool description buona

```text
Use this tool to fetch pending song requests from the Walbox Supabase queue.
Only returns requests with status="pending".
Use when the user asks to review or summarize pending requests.
Do not use for approved, rejected or historical requests.
```

### Tool description cattiva

```text
Gets requests.
```

### Regola

> La descrizione è il prompt del tool.

---

## Tool input schema

Input chiaro riduce errori.

### Cattivo

```json
{
  "data": "anything"
}
```

### Buono

```json
{
  "status": "pending | approved | rejected | playing",
  "limit": 20,
  "date_from": "YYYY-MM-DD",
  "date_to": "YYYY-MM-DD"
}
```

### Regola

> Input generici generano uso generico.

---

## Tool output format

Output compatto e strutturato.

### Cattivo output

```text
Tutto il database in testo libero.
```

### Buon output

```json
{
  "count": 3,
  "items": [
    {
      "id": "abc",
      "table": "7",
      "nickname": "Eros",
      "song": "Born Slippy",
      "mood": "cavallo",
      "status": "pending",
      "created_at": "2026-06-02T20:00:00Z"
    }
  ],
  "next_cursor": null
}
```

### Regola

> Il tool deve restituire ciò che serve per decidere, non tutto ciò che sa.

---

## Tool output token saving

Output deve:

- limitare righe;
- usare campi essenziali;
- avere pagination;
- avere summary;
- evitare HTML enorme;
- evitare dump;
- evitare base64;
- evitare log completi;
- troncare campi lunghi;
- includere count/metadata.

### Prompt per tool designer

```text
Ottimizza questo tool output per agenti.
Obiettivo:
meno token, stessa utilità decisionale.

Output:
1. campi da tenere;
2. campi da rimuovere;
3. limite default;
4. pagination;
5. error format.
```

---

## Tool permissions

Ogni tool deve avere permessi chiari.

### Read-only

Può solo leggere.

Esempi:

```text
get_pending_requests
search_docs
get_deploy_status
```

### Write

Può modificare dati.

Esempi:

```text
approve_request
create_checkpoint
update_status
```

### Destructive

Può cancellare o causare danni.

Esempi:

```text
delete_request
drop_table
reset_queue
```

### Regola

> Default: read-only. Write solo se serve. Destructive quasi mai automatico.

---

## Human confirmation

Alcuni tool devono richiedere conferma.

### Auto OK

```text
search_docs
get_status
get_pending_requests
npm_run_build
```

### Confirm

```text
approve_request
update_request_status
create_github_issue
send_email_draft
```

### Strong confirm/block

```text
delete_records
drop_table
send_email_now
publish_social_post
deploy_production
modify_env
```

---

## Tool errors

Un buon tool deve restituire errori utili.

### Cattivo

```text
Error
```

### Buono

```json
{
  "error": true,
  "code": "MISSING_DATE_RANGE",
  "message": "date_from and date_to are required for historical request search",
  "recoverable": true,
  "suggested_action": "Ask user for date range or use today's date."
}
```

### Regola

> L’errore del tool deve aiutare l’agente a recuperare.

---

## Tool idempotency

Quando possibile, i tool write devono essere idempotenti.

Esempio:

```text
approve_request(id)
```

Se chiamato due volte, non deve creare doppio effetto.

### Regola

> Un tool richiamato per errore non deve fare danni doppi.

---

## Tool audit log

Ogni tool write dovrebbe lasciare traccia:

- chi/che agente ha chiamato;
- quando;
- input;
- output;
- risultato;
- stato precedente;
- stato nuovo.

Per clienti reali è fondamentale.

---

## Tool safety levels

| Livello | Tipo | Esempio | Autonomia |
|---|---|---|---|
| 0 | read-only | search_docs | auto |
| 1 | safe compute | calculate, summarize | auto |
| 2 | non-critical write | create draft | confirm leggero |
| 3 | operational write | approve request | confirm |
| 4 | destructive | delete/drop/reset | block/strong confirm |
| 5 | external publish/payment | send/publish/charge | human mandatory |

---

## Tool namespace

Anthropic negli articoli engineering parla dell’importanza di boundaries chiari e tool namespacing.

### Esempio

```text
walbox.requests.get_pending
walbox.requests.approve
walbox.spotify.get_now_playing
walbox.reports.create_night_recap
factory.docs.search
factory.checkpoints.create
client.crm.get_followups
```

### Perché

Riduce conflitto tra tool simili.

### Regola

> Namespace chiaro = scelta tool più affidabile.

---

## Tool set minimo

Un agente deve avere il set minimo di tool.

### Frontend Agent

```text
read_file
edit_file
run_build
```

Non:

```text
database_admin
send_email
delete_records
```

### Sales Agent

```text
read_client_context
create_draft_message
```

Non:

```text
edit_code
database_write
```

### QA Agent

```text
read_diff
run_build
read_logs
```

Non:

```text
edit_files
deploy
```

### Research Agent

```text
web_search
open_source
summarize
```

Non:

```text
modify_code
approve_requests
```

---

## Tool selection heuristics

Regole da dare agli agenti:

1. Usa tool solo se serve.
2. Preferisci tool specializzato a generico.
3. Se due tool sembrano simili, scegli quello con scopo più specifico.
4. Non usare write tool senza conferma.
5. Prima read, poi write.
6. Limita risultati.
7. Non ripetere tool se risposta è sufficiente.
8. Se tool fallisce, spiega e chiedi/propone recupero.

---

## Tool use in multi-agent systems

Ogni sub-agent deve avere tool diversi.

### Esempio

```text
Research Agent: web/search tools.
Frontend Agent: file edit tools.
QA Agent: read/build tools.
Sales Agent: docs/client context only.
```

Non dare a tutti tutto.

### Regola

> Tool access segue ruolo e rischio.

---

## Tool use e evals

Anthropic ha pubblicato materiale sulle eval per agenti, includendo il controllo se l’agente sceglie il tool giusto nel contesto giusto.

Per te:

```text
Valutare tool non significa solo se funziona.
Significa se l’agente lo usa quando deve.
```

### Tool eval checklist

```text
[ ] Usa il tool giusto?
[ ] Evita tool non necessari?
[ ] Passa parametri corretti?
[ ] Gestisce errori?
[ ] Limita output?
[ ] Chiede conferma per write?
[ ] Non usa destructive tool?
[ ] Produce risultato utile?
```

---

## Tool call budget

Ogni workflow deve avere limite.

Esempio:

```text
Research task:
max 5 fonti ufficiali iniziali.

Bug analysis:
max 3 file letti prima di chiedere conferma.

Walbox report:
max 100 richieste o date range obbligatorio.

GitHub issue search:
max 20 issue.
```

### Regola

> Senza limiti, i tool espandono il task.

---

## Tool use e context engineering

Il risultato del tool entra nel contesto.

Quindi:

- tool output grande = contesto grande;
- contesto grande = costo/rumore;
- rumore = peggior decisione.

### Regola

> Tool output deve essere pensato per il modello, non per un umano che naviga dashboard.

---

## Tool use e MCP

MCP espone tool.

Se hai 10 MCP server con 20 tool ciascuno:

```text
200 tool definitions
```

Problema:

- token overhead;
- tool selection difficile;
- parametri confusi;
- latency.

### Regola

> MCP server sì, ma curati e limitati.

---

## Tool use e code execution

Code execution può aiutare quando:

- devi processare dati;
- devi creare file;
- devi eseguire script;
- devi ridurre output intermedi;
- devi interagire con molti tool via codice.

Anthropic indica che code execution con MCP può ridurre token perché l’agente può manipolare dati/tool in ambiente di codice senza riportare tutto nel contesto.

### Per te

Utile per:

- creare ZIP;
- generare file;
- analizzare CSV;
- creare report;
- controllare documenti.

Non serve per:

- pitch semplice;
- idea business;
- micro prompt.

---

## Tool use e pricing

I tool possono aggiungere token.

La documentazione pricing Anthropic segnala che alcuni tool aggiungono input tokens e che stdout/stderr, errori e contenuti file lunghi consumano token.

### Regola

> Ogni tool call ha costo visibile e costo nascosto.

Costo visibile:

```text
tool definition + tool result
```

Costo nascosto:

```text
più contesto → più rumore → più retry
```

---

## Tool design per Walbox

### Tool futuri utili

#### 1. `walbox.requests.get_pending`

Scopo:

```text
leggere richieste in attesa.
```

Input:

```json
{"limit": 20}
```

Output:

```json
{"count": 5, "items": [...]}
```

Permesso:

```text
read-only
```

---

#### 2. `walbox.requests.update_status`

Scopo:

```text
aggiornare status richiesta.
```

Input:

```json
{"request_id": "...", "status": "approved|rejected|playing"}
```

Permesso:

```text
write, confirm
```

---

#### 3. `walbox.reports.night_summary`

Scopo:

```text
creare report serata.
```

Input:

```json
{"date": "YYYY-MM-DD", "venue_id": "..."}
```

Output:

```json
{
  "total_requests": 42,
  "top_songs": [],
  "top_tables": [],
  "moods": {},
  "social_highlights": []
}
```

Permesso:

```text
read-only + generate text
```

---

#### 4. `walbox.spotify.get_playback_status`

Scopo:

```text
controllare playback attuale.
```

Input:

```json
{"device_id": "optional"}
```

Permesso:

```text
read-only
```

---

#### 5. `walbox.client.create_followup_draft`

Scopo:

```text
creare bozza follow-up cliente.
```

Permesso:

```text
draft only, no send
```

---

## Tool da NON creare subito per Walbox

Non creare ora:

```text
walbox.delete_all_requests
walbox.auto_publish_instagram
walbox.charge_customer
walbox.modify_supabase_schema
walbox.reset_production
walbox.auto_approve_all
walbox.send_email_now
```

### Regola

> Per MVP/demo, preferire read-only e draft. Evitare azioni irreversibili.

---

## Tool design per AI Business Factory

### Tool utili

#### `factory.docs.search`

Cerca nei file della Factory.

#### `factory.docs.create_file`

Crea nuovo `.md`.

#### `factory.docs.update_index`

Aggiorna indice.

#### `factory.checkpoint.create`

Crea checkpoint.

#### `factory.prompts.get_template`

Recupera prompt.

#### `factory.sources.add`

Aggiunge fonte ufficiale.

#### `factory.zip.create`

Crea ZIP.

### Permessi

- search: read-only;
- create file: write controllato;
- update index: write controllato;
- zip: safe compute;
- delete: non previsto.

---

## Tool da evitare nella Factory

```text
factory.delete_all
factory.rewrite_everything
factory.publish_without_review
factory.modify_system_files
```

---

## Tool design template

```md
# Tool Design

## Name
[nome tool]

## Namespace
[area]

## Purpose
[cosa fa in una frase]

## Use when
[quando usarlo]

## Do not use when
[quando evitarlo]

## Inputs
[parametri con tipi]

## Input examples
[esempi]

## Output
[formato compatto]

## Output limits
[limit, pagination, truncation]

## Permissions
read / write / destructive

## Confirmation
auto / confirm / strong confirm / block

## Errors
codici errore e recovery

## Token risks
cosa può generare output lungo

## Security risks
segreti, dati personali, azioni esterne

## Eval criteria
come capire se l’agente lo usa bene
```

---

## Esempio tool design completo

```md
# Tool Design — walbox.requests.get_pending

## Namespace
walbox.requests

## Purpose
Fetch pending Walbox song requests for a specific venue.

## Use when
Use when the agent needs to review or summarize currently pending song requests.

## Do not use when
Do not use for historical analytics or approved/played requests.

## Inputs
- venue_id: string
- limit: integer, default 20, max 100

## Output
{
  "count": number,
  "items": [
    {
      "id": string,
      "table": string,
      "nickname": string,
      "song_title": string,
      "artist": string,
      "mood": string,
      "dedication_preview": string,
      "created_at": string
    }
  ],
  "next_cursor": string|null
}

## Permissions
read-only

## Confirmation
auto

## Errors
- VENUE_NOT_FOUND
- LIMIT_TOO_HIGH
- DATABASE_UNAVAILABLE

## Token risks
Dedications can be long; return preview only.

## Security risks
Nicknames/dedications may include personal content.

## Eval criteria
Agent should use this for pending queue summaries, not for historical reports.
```

---

## Tool review checklist

```text
[ ] Nome chiaro?
[ ] Namespace chiaro?
[ ] Purpose specifico?
[ ] Do not use when presente?
[ ] Input schema stretto?
[ ] Output compatto?
[ ] Limit default?
[ ] Pagination?
[ ] Errori utili?
[ ] Permessi minimi?
[ ] Conferma per write?
[ ] Nessun segreto?
[ ] Token risk gestito?
[ ] Eval criteria?
```

---

## Prompt: progettare tool

```text
Agisci come Tool Designer.

Use case:
[USE CASE]

Progetta un tool con:
1. nome;
2. namespace;
3. purpose;
4. when to use;
5. when not to use;
6. input schema;
7. output schema compatto;
8. limiti/pagination;
9. permissions;
10. confirmation level;
11. error handling;
12. token risks;
13. security risks;
14. eval criteria.
```

---

## Prompt: review tool

```text
Agisci come Tool Reviewer.

Tool spec:
[SPEC]

Controlla:
- nome ambiguo;
- scope troppo largo;
- input generico;
- output troppo grande;
- permessi eccessivi;
- mancanza conferme;
- rischio token;
- rischio sicurezza;
- sovrapposizione con altri tool.

Output:
1. problemi;
2. gravità;
3. versione migliorata.
```

---

## Prompt: ridurre tool set

```text
Agisci come Tool Set Pruner.

Tool disponibili:
[LISTA]

Task dell’agente:
[TASK]

Output:
1. tool necessari;
2. tool da rimuovere;
3. tool sovrapposti;
4. tool troppo generici;
5. tool pericolosi;
6. tool set minimo consigliato.
```

---

## Prompt: tool output compression

```text
Comprimi questo output tool per uso agentico.

Output originale:
[OUTPUT]

Mantieni solo:
- campi decisionali;
- count;
- id;
- stato;
- errori;
- next action.

Rimuovi:
- campi lunghi;
- duplicati;
- raw dump;
- HTML;
- log inutili.
```

---

## Prompt: tool eval

```text
Valuta se l’agente ha usato correttamente i tool.

Task:
[TASK]

Tool disponibili:
[TOOLS]

Tool usati:
[CALLS]

Output:
1. tool giusto o sbagliato;
2. parametri corretti;
3. tool non necessari;
4. tool mancanti;
5. rischio;
6. regola da aggiungere.
```

---

## Workflow: creare un nuovo tool

```text
1. Identifica processo ripetibile.
2. Chiedi se serve davvero tool.
3. Definisci read/write/destructive.
4. Scrivi purpose.
5. Scrivi when/when not.
6. Definisci input schema.
7. Definisci output compatto.
8. Aggiungi limiti.
9. Aggiungi error format.
10. Aggiungi permissions.
11. Test con esempi.
12. Valuta token.
13. Documenta.
```

---

## Workflow: introdurre tool in agente

```text
1. Definisci ruolo agente.
2. Dai solo tool necessari.
3. Testa task semplice.
4. Controlla tool selection.
5. Controlla parametri.
6. Controlla output.
7. Aggiungi regole.
8. Rimuovi tool inutili.
9. Aggiungi eval/checklist.
```

---

## Tool anti-patterns

### 1. Mega-tool

```text
doEverything()
```

### 2. Tool senza descrizione

```text
"Does stuff"
```

### 3. Tool con input generico

```json
{"query": "anything"}
```

### 4. Tool output enorme

```text
dump completo
```

### 5. Write tool senza conferma

Pericoloso.

### 6. Tool duplicati

```text
send_user_notification
notify_user
notification_send
```

Confondono.

### 7. Tool con side effect nascosti

Un tool chiamato `getStatus` non deve modificare dati.

### 8. Tool che espone segreti

Mai.

### 9. Tool senza limiti

Rischio costi.

### 10. Tool non testabile

Difficile da affidare a un agente.

---

## Tool use per business

Tool utili per business futuro:

```text
client_context.get
client_context.update
proposal.create_draft
pricing.estimate
followup.create_message
lead.search
demo_script.create
```

Tool da evitare subito:

```text
invoice.send
payment.charge
contract.sign
email.send_now
```

### Regola

> Prima draft, poi umano approva.

---

## Tool use per customer support/Expedia-like

Possibili tool:

```text
policy.search
case.read
draft_partner_email
draft_internal_comment
escalation_check
```

Permissions:

```text
read/draft only
```

Non:

```text
send final email without human review
close case automatically
refund automatically
```

---

## Tool use per documentazione

Tool utili:

```text
docs.search
docs.create
docs.update
docs.zip
docs.count_lines
docs.link_check
```

Questi sono abbastanza sicuri.

---

## Tool use per code agents

Tool tipici:

```text
read_file
edit_file
search_code
run_build
run_tests
git_status
git_diff
```

Tool rischiosi:

```text
git_reset
delete_file
install_package
modify_env
deploy
```

---

## Permissions matrix per agenti

| Agente | Tool consentiti | Tool vietati |
|---|---|---|
| Research | web/search/read docs | edit code, write DB |
| Frontend | read/edit UI, build | DB admin, env |
| Backend | read/edit service, build/test | destructive DB without confirm |
| QA | read, diff, build | edit/write |
| Sales | read client docs, draft | send/publish |
| Documentation | read/write docs | code critical files |
| Token Saver | none/read docs | write tools |
| Security | read configs | destructive actions |
| Walbox Specialist | read docs, propose prompts | direct destructive |

---

## Tool maturity levels

### Level 0 — Manual

Copia/incolla.

### Level 1 — Script

Funzione deterministica.

### Level 2 — Tool read-only

Agente può leggere dati.

### Level 3 — Tool write with confirm

Agente può proporre/aggiornare con conferma.

### Level 4 — Tool write automatic

Solo per operazioni sicure e reversibili.

### Level 5 — Autonomous operations

Solo dopo eval, logging, rollback, permissions.

Per te ora:

```text
Level 0-2
```

Su Walbox:

```text
Level 0-1 ora, Level 2 dopo.
```

---

## Decisione operativa per te

Ora non devi costruire subito tool custom.

Devi:

1. capire design;
2. documentare tool futuri;
3. usare tool già disponibili con criterio;
4. non collegare tutto;
5. preferire read-only;
6. costruire scripts semplici se deterministici;
7. rimandare MCP/Agent SDK write tools.

---

## Roadmap tool per AI Business Factory

### Ora

- Python/file generation;
- ZIP;
- markdown files;
- web research via ChatGPT;
- manual review.

### Prossimo

- script index generator;
- script validate required sections;
- script line count;
- docs search.

### Dopo

- local MCP docs server;
- Factory Assistant;
- checkpoint retrieval;
- prompt library retrieval.

### Molto dopo

- Agent SDK orchestration;
- client onboarding agent;
- automated proposal generator;
- Walbox reporting agent.

---

## Roadmap tool per Walbox

### Ora

- Supabase app logic;
- Spotify app logic;
- manual dashboard.

### Prossimo

- report read-only;
- analytics read-only;
- night recap generator;
- client follow-up draft.

### Dopo

- manager assistant;
- promo suggestion;
- social content draft;
- support tool.

### Molto dopo

- multi-tenant admin;
- billing;
- CRM;
- automation.

---

## Regole finali

1. Tool piccolo.
2. Nome chiaro.
3. Descrizione dettagliata.
4. Input stretto.
5. Output compatto.
6. Default limit.
7. Pagination.
8. Errori utili.
9. Permessi minimi.
10. Read-only prima di write.
11. Conferma per write.
12. Blocca destructive.
13. Audit log.
14. Tool set minimo per agente.
15. Eval tool selection.
16. Non usare MCP se basta script/API.
17. Non creare tool per workflow non validati.
18. Ogni tool deve avere “do not use when”.
19. Tool response deve aiutare decisione.
20. Se un tool non riduce lavoro o errori, non serve.

---

## Completezza stimata

Completezza attuale: 90%

### Coperto bene

- definizione tool;
- tool use loop;
- tool overload;
- token cost;
- naming;
- description;
- input/output schema;
- permissions;
- confirmation;
- error handling;
- idempotency;
- audit;
- namespace;
- tool set minimo;
- multi-agent tool access;
- evals;
- MCP connection;
- code execution;
- Walbox tool design;
- AI Business Factory tool design;
- templates;
- prompt master;
- workflows;
- anti-pattern;
- maturity levels;
- roadmap.

### Da approfondire nei file dedicati

- JSON schema Anthropic tool definitions reali;
- esempi API completi;
- server tools vs client tools;
- tool_choice e forcing;
- parallel tool use;
- fine-grained tool streaming;
- computer use;
- bash/text editor tool dettagliati;
- web search pricing;
- MCP server implementation;
- Supabase MCP/tool reali;
- GitHub MCP/tool reali;
- Vercel API/tool reali;
- security evals per tool;
- logging e audit implementation.

---

## Prossimo file consigliato

```text
14_SECURITY_AND_APPROVALS.md
```

Perché dopo tool design serve definire sicurezza, permessi, approval, segreti, sandbox, policy, dati cliente e cosa non deve mai essere automatizzato.

<!-- END_SOURCE_FILE: 13_TOOL_USE_AND_TOOL_DESIGN.md -->


<!-- BEGIN_SOURCE_FILE: 14_SECURITY_AND_APPROVALS.md -->
<!-- SOURCE_SHA256_UTF8: 1b18f9f3156cb3ce41cac493516473a926764e1617ac77a3835984a853c23619 -->
<!-- SOURCE_CHAR_COUNT: 24310 -->

# 14_SECURITY_AND_APPROVALS.md

Versione: 1.0  
Data creazione: 2026-06-02  
Area: AI Business Factory / Security & Approvals  
Completezza stimata: 89%

---

## Scopo del file

Questo file definisce le regole di sicurezza, permessi e approvazioni per la tua **AI Business Factory**.

L’obiettivo è evitare che agenti AI, Claude Code, Antigravity, tool, hooks o automazioni possano:

- modificare file critici senza controllo;
- leggere o stampare segreti;
- cancellare dati;
- cambiare database;
- fare deploy sbagliati;
- inviare email/post senza approvazione;
- rompere demo stabili;
- usare troppi permessi;
- prendere decisioni business al posto tuo;
- creare rischi per clienti reali;
- confondere “può farlo” con “deve farlo”.

La regola centrale:

> Autonomia progressiva: prima read-only, poi draft, poi write con conferma, destructive quasi mai.

---

## Fonti ufficiali usate

Fonti principali:

1. Claude Code Security  
   https://docs.anthropic.com/en/docs/claude-code/security

2. Claude Code Settings  
   https://docs.anthropic.com/en/docs/claude-code/settings

3. Claude Code Hooks Reference  
   https://docs.anthropic.com/en/docs/claude-code/hooks

4. Automate workflows with hooks  
   https://docs.anthropic.com/en/docs/claude-code/hooks-guide

5. Claude Code Auto Mode  
   https://www.anthropic.com/engineering/claude-code-auto-mode

6. Claude Code Sandboxing  
   https://www.anthropic.com/engineering/claude-code-sandboxing

7. How we contain Claude across products  
   https://www.anthropic.com/engineering/how-we-contain-claude

8. Claude Code Skills  
   https://docs.anthropic.com/en/docs/claude-code/skills

9. Claude Code Sub-agents  
   https://docs.anthropic.com/en/docs/claude-code/sub-agents

10. Agent SDK Overview  
    https://docs.anthropic.com/en/docs/claude-code/sdk

11. Agent SDK Python Reference  
    https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-python

12. Agent SDK TypeScript Reference  
    https://docs.anthropic.com/en/docs/claude-code/sdk/sdk-typescript

13. Claude Code IAM / Authentication  
    https://docs.anthropic.com/en/docs/claude-code/iam

14. Monitoring Usage  
    https://docs.anthropic.com/en/docs/claude-code/monitoring-usage

15. Writing Effective Tools for Agents  
    https://www.anthropic.com/engineering/writing-tools-for-agents

16. Tool Use Overview  
    https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview

17. MCP docs  
    https://docs.anthropic.com/en/docs/agents-and-tools/mcp

18. Claude Code Overview  
    https://docs.anthropic.com/en/docs/claude-code/overview

---

## Sintesi brutale

Più un agente può fare cose nel mondo reale, più devi controllare:

- cosa può leggere;
- cosa può modificare;
- quali tool può usare;
- quali comandi può eseguire;
- quando deve chiedere conferma;
- cosa va bloccato;
- cosa va loggato;
- cosa va revisionato da umano.

Claude Code è descritto come strumento agentico che può leggere codebase, editare file ed eseguire comandi. Questo è potente, ma significa anche che devi trattarlo come un collaboratore tecnico con permessi limitati, non come un giocattolo senza rischio.

---

## Regola madre

```text
Least privilege.
```

Tradotto:

> Ogni agente deve avere solo i permessi minimi necessari per il task corrente.

Non:

```text
Diamo tutto accesso a tutto perché così lavora meglio.
```

Sì:

```text
Frontend Agent può leggere/editare solo file UI target.
QA Agent è read-only.
Sales Agent crea bozze, non invia.
Backend Agent modifica API solo dopo piano.
```

---

## I 5 livelli di autonomia

### Livello 0 — Read-only

L’agente può solo leggere/analizzare.

Uso:

- QA;
- research;
- bug analysis;
- planning;
- security review;
- business validation.

Rischio:

```text
basso, ma attenzione a dati sensibili letti.
```

---

### Livello 1 — Draft

L’agente può creare bozze o proposte.

Uso:

- email draft;
- post social draft;
- pitch;
- proposta prezzo;
- piano tecnico;
- checkpoint;
- codice non applicato.

Rischio:

```text
medio-basso.
```

Regola:

```text
umano approva prima di inviare/pubblicare/eseguire.
```

---

### Livello 2 — Safe write

L’agente può modificare file/dati non critici e reversibili.

Uso:

- file `.md`;
- UI file specifico;
- copy;
- componente isolato;
- bozza documento.

Rischio:

```text
medio.
```

Richiede:

- Git;
- diff;
- test;
- rollback.

---

### Livello 3 — Controlled write

L’agente può modificare aree tecniche importanti con conferma.

Uso:

- API;
- servizi;
- routing;
- App.jsx;
- database queries;
- package.json;
- vercel config.

Rischio:

```text
alto.
```

Richiede:

- read-only analysis;
- piano;
- conferma;
- test;
- rollback;
- QA.

---

### Livello 4 — Critical / destructive

L’agente può fare azioni irreversibili o esterne.

Esempi:

- delete database records;
- drop table;
- send email;
- publish post;
- charge payment;
- deploy production;
- modify env/secrets;
- git reset hard;
- delete files.

Rischio:

```text
molto alto.
```

Regola:

```text
mai automatico, quasi sempre umano obbligatorio.
```

---

## Matrice approvazioni

| Azione | Livello | Policy |
|---|---:|---|
| Leggere documenti pubblici | 0 | Auto |
| Leggere file progetto non sensibili | 0 | Auto/ok |
| Analizzare bug | 0 | Auto |
| Creare pitch draft | 1 | Auto |
| Creare email draft | 1 | Auto |
| Scrivere file .md | 2 | Review |
| Modificare UI file target | 2 | Review + test |
| Modificare App.jsx | 3 | Conferma |
| Modificare API/service | 3 | Conferma |
| Modificare package.json | 3 | Conferma |
| Modificare vercel.json | 3 | Conferma |
| Modificare .env | 4 | Block/strong confirm |
| Cambiare schema DB | 4 | Strong confirm |
| Cancellare dati | 4 | Block |
| Inviare email reale | 4 | Umano |
| Pubblicare social | 4 | Umano |
| Deploy produzione | 4 | Umano |
| Pagamenti/fatture | 4 | Umano |

---

## Approval fatigue

Anthropic ha parlato di approval fatigue: se un sistema chiede conferma troppe volte, gli utenti finiscono per approvare senza leggere bene.

Quindi la soluzione non è chiedere conferma per tutto.

La soluzione è:

```text
conferma intelligente in base al rischio.
```

### Regola

- read-only → auto;
- draft → auto;
- safe write → review;
- controlled write → conferma;
- destructive/external → blocco o conferma forte.

---

## Auto mode

Auto mode o permessi più larghi possono aumentare velocità, ma devono essere usati con confini.

Usalo solo quando:

- progetto non critico;
- task reversibile;
- sandbox attivo;
- Git pulito;
- file target chiaro;
- nessun dato sensibile;
- nessun deploy;
- nessun database write.

Non usarlo quando:

- dati reali;
- clienti reali;
- segreti;
- produzione;
- database;
- pagamenti;
- email/social;
- schema;
- refactor grande.

---

## Sandbox

Sandbox significa limitare cosa può fare l’agente a livello di filesystem e/o network.

Le fonti Claude Code Security parlano di sandboxed bash con isolamento filesystem e network. Gli articoli Anthropic sul sandboxing sottolineano che isolamento filesystem e rete servono a ridurre rischio di esfiltrazione o azioni indesiderate.

### Per te

Ora:

```text
Antigravity Strict mode + review + Git + prompt + no overages
```

Più avanti:

```text
sandbox Claude Code
permission rules
hooks
allow/deny
network restrictions
```

---

## Filesystem safety

Regola:

```text
L’agente lavora solo nella cartella progetto.
```

Non deve accedere a:

- home directory;
- documenti personali;
- download;
- chiavi SSH;
- file fiscali;
- file sanitari;
- password manager;
- desktop intero;
- altri repo cliente non coinvolti.

### Prompt/policy

```text
Non leggere file fuori dal workspace.
Se serve un file esterno, chiedi prima.
```

---

## Network safety

Agente con rete può:

- chiamare API;
- scaricare file;
- inviare dati;
- accedere a servizi;
- potenzialmente esfiltrare informazioni.

Regola:

```text
Network access solo se serve e verso domini attesi.
```

Esempi allow:

```text
docs ufficiali
GitHub repo pubblico
Vercel dashboard/API se necessario
Supabase project se necessario
Spotify API se necessario
```

Esempi block/strong confirm:

```text
webhook sconosciuti
pastebin
file upload esterni
domini casuali
servizi non collegati al task
```

---

## Segreti e API key

Mai mettere in prompt:

- API keys;
- client secret;
- tokens;
- password;
- private keys;
- cookie sessione;
- bearer token;
- env complete.

### Regola

> Se una stringa dà accesso a qualcosa, non va incollata in chat.

Per debug:

```text
mostra solo nome variabile, non valore.
```

Esempio:

```text
VITE_SUPABASE_URL presente.
VITE_SUPABASE_ANON_KEY presente.
SPOTIFY_CLIENT_SECRET presente.
```

Non:

```text
SPOTIFY_CLIENT_SECRET=...
```

---

## Env file policy

File protetti:

```text
.env
.env.local
.env.production
.env.development
*.pem
*.key
secrets.json
service-account.json
```

Policy:

```text
read: block/strong confirm
edit: block/strong confirm
print content: block
```

---

## Git safety

Comandi safe:

```bash
git status
git diff
git log --oneline -5
```

Comandi confirm:

```bash
git add
git commit
git push
git checkout
```

Comandi dangerous:

```bash
git reset --hard
git clean -fd
git rebase
git force-push
```

Policy:

```text
dangerous commands never automatic.
```

---

## Shell commands policy

### Auto/safe

```bash
npm run build
npm test
npm run lint
git status
git diff
ls
cat file specifico non sensibile
```

### Confirm

```bash
npm install
npm uninstall
git add
git commit
git push
vercel deploy
supabase CLI commands
```

### Block/strong confirm

```bash
rm -rf
sudo
chmod -R
chown -R
curl | bash
wget | bash
git reset --hard
drop database
delete from
truncate
```

---

## Database safety

Database è area critica.

Regole:

1. Read-only prima.
2. Nessuna modifica schema senza piano.
3. Nessun delete automatico.
4. Backup/rollback se dati reali.
5. Confirm per update.
6. Strong confirm per delete.
7. Audit log.
8. Limit query.
9. Evita `select *` su dati grandi/sensibili.
10. Non esporre dati personali nei prompt.

### Walbox Supabase

Operazioni sicure:

```text
read pending requests
read status
insert test request in dev/demo
```

Conferma:

```text
update status
clear demo queue
```

Strong confirm/block:

```text
delete all production data
alter table
drop table
change RLS
expose anon key incorrectly
```

---

## API safety

Per API esterne:

- non loggare token;
- non inviare dati non necessari;
- limitare scopes;
- usare env variables;
- non hardcodare segreti;
- rate limits;
- error handling.

### Spotify

Per Walbox:

```text
client id pubblico ok se previsto
client secret mai in frontend
token handling controllato
redirect URI controllato
```

Policy:

- search endpoint ok;
- playback/write azioni richiedono account locale autorizzato;
- non pubblicare secret.

---

## Frontend safety

UI file sono meno rischiosi, ma possono comunque rompere logica.

Regole:

- non toccare state/useEffect se UI polish;
- non toccare submit handlers;
- non toccare API calls;
- non cambiare routing;
- non rimuovere accessibility/labels;
- test mobile.

---

## Backend safety

Backend/API richiede:

- read-only analysis;
- piano;
- file coinvolti;
- test;
- rollback;
- gestione errori;
- no segreti;
- no refactor extra.

Prompt:

```text
Modalità read-only iniziale.
Non modificare file.
Analizza flusso dati, rischi e patch minima.
```

---

## Email safety

Agente può:

- scrivere bozza;
- migliorare tono;
- tradurre;
- preparare reply;
- creare subject.

Agente non deve automaticamente:

- inviare email;
- inoltrare dati sensibili;
- promettere condizioni;
- comunicare diagnosi/legale/finanziario senza revisione.

Policy:

```text
draft-only default.
send only on explicit human instruction.
```

---

## Social publishing safety

Per Walbox/social experience:

Agente può:

- creare caption;
- creare story idea;
- creare calendario;
- generare copy;
- proporre meme.

Non deve:

- pubblicare automaticamente;
- usare foto persone senza consenso;
- esporre dati/tavoli/nickname sensibili;
- promettere promo non approvate;
- creare contenuti offensivi verso clienti.

Policy:

```text
draft-only.
human approves.
```

---

## Payments / billing safety

Azioni pagamento sono critiche.

Agente può:

- stimare prezzo;
- creare bozza offerta;
- preparare invoice draft;
- spiegare pacchetti.

Non deve:

- addebitare carte;
- inviare fatture definitive senza review;
- modificare piani cliente;
- attivare abbonamenti;
- cancellare abbonamenti.

Policy:

```text
human mandatory.
```

---

## Customer data safety

Per clienti locali/Walbox:

Dati potenzialmente sensibili o personali:

- nickname;
- dediche;
- tavolo;
- foto;
- Instagram;
- telefono;
- email;
- preferenze;
- cronologia richieste;
- promo;
- punti/loyalty.

Regole:

- minimizzazione dati;
- non raccogliere più del necessario;
- evitare parola “profilazione” nel pitch;
- usare “memoria leggera del cliente”;
- consenso se foto/social;
- non esporre dati nei prompt se non serve;
- report aggregati quando possibile.

---

## GDPR/privacy note

Questo file non è consulenza legale.

Per prodotto reale con clienti e dati personali serviranno:

- privacy policy;
- cookie/consent se applicabile;
- base giuridica;
- informativa trattamento;
- retention;
- diritto cancellazione;
- gestione immagini;
- DPA con servizi;
- sicurezza accessi.

Per MVP demo:

```text
ridurre dati raccolti
nickname/tavolo temporanei
no login obbligatorio
foto opzionali
consenso esplicito se pubblicazione
```

---

## Human-in-the-loop

Regola:

```text
AI propone, umano approva.
```

HITL obbligatorio per:

- email inviate;
- post pubblicati;
- pagamenti;
- contratti;
- database delete;
- schema changes;
- deploy produzione;
- decisioni cliente;
- promesse commerciali;
- dati personali;
- sicurezza.

---

## Approval policy template

```md
# Approval Policy

## Auto allowed
- read-only docs
- git status
- git diff
- npm run build
- create draft
- write .md docs

## Review required
- UI file edits
- prompt updates
- pitch drafts
- checkpoint updates

## Confirmation required
- API/service edits
- App.jsx
- package.json
- routing
- deploy
- git push
- database update

## Strong confirmation / block
- secrets/env
- delete data
- schema changes
- production deploy
- sending emails
- publishing social posts
- payments
- destructive commands
```

---

## Walbox approval policy

```md
# Walbox Approval Policy

## Auto
- leggere docs;
- creare pitch draft;
- creare checkpoint;
- modificare file .md;
- git status/diff;
- npm run build.

## Review
- CustomerJukeboxOldOrange UI;
- LiveTvScreen UI;
- copy;
- entry variants;
- non-critical CSS.

## Confirm
- ManagerDashboard;
- App.jsx;
- walboxDb.js;
- spotifyApi.js;
- api/search.js;
- package.json;
- vercel.json;
- routing;
- Vercel env names;
- Git push.

## Strong confirm/block
- .env values;
- Spotify client secret;
- Supabase service key;
- Supabase schema/RLS;
- delete all song_requests;
- production deploy changes;
- auto-publish social;
- payments.
```

---

## AI Business Factory approval policy

```md
# AI Business Factory Approval Policy

## Auto
- creare nuovo file .md;
- aggiornare ZIP;
- contare righe;
- creare template;
- aggiornare documentazione non critica.

## Review
- modificare indice fonti;
- aggiornare regole core;
- aggiungere nuova skill;
- creare prompt library.

## Confirm
- eliminare file;
- riscrivere file intero;
- cambiare struttura cartella;
- sostituire versioni precedenti.

## Block
- condividere segreti;
- cancellare archivio;
- pubblicare dati cliente;
- modificare file fuori workspace.
```

---

## Sub-agent security

Ogni sub-agent deve avere permessi coerenti col ruolo.

### Frontend Agent

Può:

- leggere/editare UI file autorizzati;
- build.

Non può:

- database;
- env;
- deploy;
- payments.

### QA Agent

Può:

- leggere;
- diff;
- build.

Non può:

- editare;
- deployare;
- cancellare.

### Sales Agent

Può:

- creare bozze.

Non può:

- inviare;
- pubblicare;
- modificare codice.

### Backend Agent

Può:

- analizzare servizi;
- proporre patch.

Non può:

- schema/delete senza conferma;
- segreti.

### Security Agent

Può:

- analizzare policy.

Non può:

- cambiare permessi da solo.

---

## Skill security

Le skill possono specificare allowed tools, ma per bloccare davvero certe azioni servono permission settings/deny rules/hooks.

Regola:

```text
Skill dice come lavorare.
Permission dice cosa può fare.
Hook può bloccare a runtime.
```

---

## Hooks for security

Hook utili:

- PreToolUse per bloccare tool calls;
- PostToolUse per log/QA dopo azione;
- SessionStart per caricare policy;
- SessionEnd per checkpoint/audit;
- UserPromptSubmit per controlli su input.

Nota da docs: PostToolUse non può annullare un’azione già fatta; per bloccare devi intervenire prima, tipicamente con PreToolUse.

---

## Security hooks roadmap

### 1. Critical file guard

Blocca/confirm:

```text
App.jsx
walboxDb.js
spotifyApi.js
api/search.js
vercel.json
.env
```

### 2. Secret guard

Blocca lettura/stampa env/secrets.

### 3. Destructive command guard

Blocca:

```text
rm -rf
git reset --hard
drop table
delete from
truncate
```

### 4. Dependency guard

Conferma per `package.json`.

### 5. Database guard

Read-only default, write confirm.

### 6. Social/email guard

Draft-only.

---

## Monitoring and audit

Le fonti Claude Code monitoring includono eventi hook e informazioni di esecuzione.

Per te, in futuro serve loggare:

- chi ha fatto cosa;
- quale agente;
- quale tool;
- quale file;
- quando;
- risultato;
- errore;
- approvazione umana.

Per MVP:

```text
git history + checkpoint .md
```

Per prodotto:

```text
audit log strutturato
```

---

## Risk score

Classifica task:

```text
0 = nessun rischio
1 = basso
2 = medio
3 = alto
4 = critico
```

### Esempi

```text
typo .md = 0
copy pitch = 1
UI file = 2
App.jsx = 3
database schema = 4
delete production = 4
email send = 4
payment charge = 4
```

---

## Risk assessment prompt

```text
Agisci come Security/Approval Agent.

Task:
[TASK]

Valuta:
1. risk score 0-4;
2. dati coinvolti;
3. file/tool coinvolti;
4. permessi necessari;
5. cosa può essere auto;
6. cosa richiede review;
7. cosa va bloccato;
8. rollback;
9. approval policy.
```

---

## Security review prompt

```text
Fai security review di questo workflow.

Controlla:
- segreti;
- dati cliente;
- file critici;
- database;
- network;
- tool permissions;
- write/destructive actions;
- human approval;
- audit;
- rollback.

Output:
safe / attenzione / bloccare + motivi.
```

---

## Approval policy generator prompt

```text
Crea approval policy per questo progetto.

Progetto:
[PROGETTO]

Output:
1. azioni auto;
2. azioni review;
3. azioni confirm;
4. azioni strong confirm/block;
5. file critici;
6. dati sensibili;
7. comandi safe/dangerous;
8. tool permissions.
```

---

## Secret handling prompt

```text
Analizza questa configurazione senza esporre segreti.

Regole:
- non stampare valori;
- mostra solo nomi variabili;
- indica se mancano;
- indica rischio;
- suggerisci fix senza rivelare chiavi.
```

---

## Database safety prompt

```text
Analizza questa modifica database.

Modalità read-only.

Output:
1. cosa cambia;
2. dati coinvolti;
3. rischio;
4. rollback;
5. backup richiesto;
6. test;
7. conferma necessaria.
```

---

## Email/social safety prompt

```text
Crea solo una bozza.
Non inviare.
Non pubblicare.
Non promettere condizioni non confermate.
Non includere dati personali non necessari.

Output:
- draft;
- rischi;
- cosa deve approvare l’umano.
```

---

## Production readiness checklist

Prima di prodotto reale:

```text
[ ] privacy policy
[ ] dati minimi
[ ] gestione consenso
[ ] segreti in env sicuri
[ ] no secret in frontend
[ ] RLS/database permissions
[ ] backup
[ ] audit log
[ ] error monitoring
[ ] deploy rollback
[ ] access control dashboard
[ ] human approval per azioni esterne
[ ] rate limits
[ ] terms/conditions se serve
```

---

## MVP safety checklist

Per demo Walbox:

```text
[ ] no dati sensibili obbligatori
[ ] nickname/tavolo ok
[ ] foto opzionali
[ ] niente pagamento
[ ] niente email inviate
[ ] niente social publishing automatico
[ ] Supabase anon key configurata correttamente
[ ] no service key frontend
[ ] Spotify secret solo server/env
[ ] dashboard non pubblicizzata come admin sicuro definitivo
[ ] demo testata
```

---

## Red flags

Blocca e chiedi conferma se l’agente propone:

- “disabilito sicurezza temporaneamente”;
- “mettiamo service key nel frontend”;
- “facciamo `delete all` e poi vediamo”;
- “pubblico direttamente”;
- “inviamo email a tutti”;
- “usiamo dati cliente per marketing senza consenso”;
- “skip permissions” su progetto reale;
- “reset hard” senza backup;
- “modifico schema in produzione”;
- “non serve test”.

---

## Security mindset per business

Vendere software/AI a clienti significa assumersi responsabilità.

Per piccoli locali:

- non promettere sicurezza enterprise se non c’è;
- presentare come beta/demo;
- limitare dati;
- evitare pagamenti all’inizio;
- evitare login se non serve;
- usare strumenti affidabili;
- backup;
- supporto chiaro.

### Regola

> Più dati raccogli, più responsabilità hai.

---

## Antigravity security checklist

Per il tuo setup attuale:

```text
[ ] Strict mode attivo
[ ] Terminal command review
[ ] Review Changes
[ ] Non-workspace access bloccato
[ ] AI Credit Overages OFF
[ ] Git status prima/dopo
[ ] Commit dopo step buono
[ ] Prompt “modifica solo file”
[ ] No secrets in prompt
[ ] No full access se non necessario
```

---

## Claude Code security checklist

Quando lo userai:

```text
[ ] progetto test prima
[ ] niente secrets
[ ] settings controllati
[ ] permissions definite
[ ] sandbox se possibile
[ ] hooks leggeri
[ ] no dangerous skip permissions
[ ] read-only per analisi
[ ] confirm per write
[ ] Git pulito
```

---

## Error-to-policy workflow

Quando succede un errore:

```text
1. descrivi errore;
2. valuta rischio;
3. nuova regola;
4. aggiorna prompt;
5. aggiorna skill;
6. aggiorna approval policy;
7. valuta hook;
8. checkpoint.
```

### Prompt

```text
Trasforma questo errore in policy di sicurezza.

Errore:
[ERRORE]

Output:
1. causa;
2. rischio;
3. nuova regola;
4. dove inserirla;
5. hook/permission utile;
6. test.
```

---

## Security maturity roadmap

### Livello 1 — Manuale

- prompt chiari;
- review changes;
- git;
- no secrets;
- checkpoint.

### Livello 2 — Policy

- approval policy;
- file critici;
- safe/danger commands;
- role permissions.

### Livello 3 — Hooks

- critical file guard;
- secret guard;
- destructive command guard;
- build hook.

### Livello 4 — CI/Sandbox

- GitHub Actions;
- tests;
- sandbox;
- deploy checks.

### Livello 5 — Product security

- auth;
- roles;
- audit logs;
- monitoring;
- privacy/GDPR;
- backups;
- incident response.

---

## Incident response base

Se qualcosa va storto:

```text
1. Fermare agenti/automazioni.
2. Non fare altre modifiche.
3. Salvare stato/log.
4. Identificare file/dati toccati.
5. Rollback Git/Vercel/database se possibile.
6. Cambiare segreti se esposti.
7. Documentare incidente.
8. Aggiornare policy.
```

---

## Completezza stimata

Completezza attuale: 89%

### Coperto bene

- livelli autonomia;
- approval matrix;
- approval fatigue;
- auto mode;
- sandbox;
- filesystem/network safety;
- secrets/env;
- git/shell safety;
- database/API safety;
- frontend/backend safety;
- email/social/payments;
- customer data;
- GDPR high-level;
- human-in-the-loop;
- approval policies;
- sub-agent/skill security;
- hooks security;
- monitoring/audit;
- risk scoring;
- prompts;
- checklists;
- red flags;
- Antigravity/Claude Code checklist;
- maturity roadmap;
- incident response.

### Da approfondire nei file dedicati

- configurazione reale permissions Claude Code;
- JSON hook reali;
- sandbox setup operativo;
- managed settings enterprise;
- RLS Supabase concreta;
- secrets scanning;
- GDPR/privacy policy reale;
- authentication/roles per Walbox prodotto;
- incident response completo;
- audit log implementation;
- CI security checks;
- threat modeling avanzato;
- legal review.

---

## Prossimo file consigliato

```text
15_BUSINESS_FACTORY_WORKFLOW.md
```

Perché dopo aver coperto tool, sicurezza e workflow tecnici, serve tornare al centro business: come passare da idea → validazione → MVP → demo → vendita → replica.

<!-- END_SOURCE_FILE: 14_SECURITY_AND_APPROVALS.md -->
