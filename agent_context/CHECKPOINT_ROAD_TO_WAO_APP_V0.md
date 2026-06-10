# CHECKPOINT — ROAD TO WAO APP V0

Versione: 1.0  
Data: 2026-06-10  
Area: BlaBlaParty / Road to WAO / WAO Crew Ride  
Stato: mini app demo funzionante  
Uso previsto: fonte di ripartenza per ChatGPT + Antigravity + AI Business Factory

---

## 0. Scopo del checkpoint

Questo file fissa lo stato attuale della mini app **Road to WAO / WAO Crew Ride** dopo il primo ciclo di costruzione visuale + prodotto.

Serve a ripartire senza perdere contesto e senza ricominciare a fare polish casuale.

Regola centrale:

```text
La V0 ora deve diventare un flusso prodotto stabile, non un esperimento visual infinito.
```

---

## 1. Definizione prodotto

**Road to WAO** è una demo mobile-first per organizzare crew/passaggi verso WAO Festival.

È una verticale di BlaBlaParty applicata al problema specifico:

```text
vedo crew/passaggi attivi
→ chiedo di unirmi
→ la richiesta va in pending approval
→ seguo lo stato nei messaggi
→ ho un profilo leggero di viaggio
```

Non è ancora un servizio ufficiale, non organizza viaggi, non gestisce pagamenti, non vende biglietti e non mostra contatti prima dell’approvazione.

---

## 2. Stato attuale app

La mini app demo ora include:

```text
Casa
→ Home visual cosmic/solar

Bacheca
→ passaggi/crew demo attivi

Unisciti al viaggio
→ modal richiesta accesso

Messaggi
→ richiesta inviata / in attesa approvazione

Profilo
→ profilo leggero demo + stato richiesta
```

Questo chiude il primo loop prodotto:

```text
Bacheca
→ Chiedi di unirti
→ Invia richiesta
→ Messaggi
→ Richiesta inviata / In attesa approvazione
→ Profilo aggiornato con richiesta pending
```

---

## 3. Stack tecnico

```text
React
Vite
Vanilla CSS
Local React state
Static demo data
No backend
No database
No login
No payments
```

---

## 4. Visual direction attuale

Direzione visuale approvata:

```text
WAO cosmic / solar / psychedelic premium
```

Elementi principali:

- sfondo dark cosmic;
- eclissi solare / mandala;
- palette arancio/oro + viola/magenta + turchese;
- card glass scure;
- bottoni rounded premium;
- atmosfera festival mistica/cosmica;
- UI mobile-first.

Nota importante:

```text
La Home non è pixel-perfect, ma la direzione è sufficiente per demo.
Non continuare a consumare quota per inseguire il visual perfetto ora.
```

---

## 5. File principali creati/modificati

File probabili coinvolti nello stato attuale:

```text
src/App.jsx
src/road-to-wao.css
src/components/BottomNav.jsx
src/components/RoadBoard.jsx
src/components/JoinRequestModal.jsx
src/components/MessagesPanel.jsx
src/components/ProfilePanel.jsx
src/components/CosmicAppShell.jsx
src/components/SolarHeroBackground.jsx
```

Asset visuali usati o preparati:

```text
public/assets/road-to-wao/home/hero/...
public/assets/road-to-wao/home/ornaments/...
```

Documenti utili già creati:

```text
ROAD_TO_WAO_HOME_ASSET_MAP.md
ANTIGRAVITY_PROMPT_STEP_1_HOME_WITH_ASSETS.md
VISUAL_FACTORY_PIPELINE_CHECKPOINT.md
```

---

## 6. Funzionalità completate

### 6.1 Home / Casa

La tab Casa mostra la Home visuale con:

- identità Road to WAO;
- claim cosmic/solar;
- CTA principali;
- bottom navigation.

Problema noto:

```text
Su alcuni telefoni il palco/stage del background non è perfettamente visibile.
Non è bloccante per la V0.
```

### 6.2 Bacheca Viaggi

La tab Bacheca mostra card demo:

1. **Milano → WAO**
   - 2 posti liberi;
   - partenza 14 Agosto mattina;
   - vibe tranquilla / music-first;
   - stato: Passaggio aperto.

2. **Roma → WAO**
   - 1 posto libero;
   - partenza 13 Agosto sera;
   - vibe social / full experience;
   - stato: Quasi pieno.

3. **Firenze → WAO**
   - cerca driver;
   - partenza 14 Agosto;
   - vibe easy / camping;
   - stato: In attesa driver.

Ogni card ha CTA:

```text
Chiedi di unirti
```

### 6.3 Join Request Modal

Click su “Chiedi di unirti” apre modal:

```text
Unisciti al viaggio
```

Campi demo:

- nickname;
- città/partenza;
- numero persone;
- messaggio per la crew;
- conferma 18+.

Dopo invio:

```text
Richiesta inviata
In attesa approvazione della crew
Nessun contatto viene mostrato prima dell’approvazione.
```

### 6.4 Messaggi

La tab Messaggi ora non è più placeholder puro.

Se non ci sono richieste:

```text
Nessuna richiesta ancora
Chiedi di unirti a un viaggio dalla Bacheca.
```

Se esiste una richiesta:

```text
Richiesta inviata
In attesa approvazione
[route]
[partenza]
[nickname]
Nessun contatto viene mostrato prima dell’approvazione.
```

### 6.5 Profilo

La tab Profilo ora mostra un profilo leggero demo:

```text
Profilo viaggio
La tua identità leggera per trovare la crew giusta.
```

Contenuti:

- nickname demo;
- badge Crew seeker;
- città di partenza;
- vibe viaggio;
- stato festival;
- richieste inviate;
- ultima richiesta pending, se presente;
- CTA Vai alla Bacheca;
- CTA Modifica profilo demo.

---

## 7. UX flow attuale

Flow demo da testare:

```text
1. Apri app su telefono.
2. Vai in Bacheca.
3. Scegli Milano / Roma / Firenze.
4. Tocca Chiedi di unirti.
5. Compila richiesta.
6. Conferma 18+.
7. Invia richiesta.
8. Vai in Messaggi.
9. Vedi richiesta pending.
10. Vai in Profilo.
11. Vedi profilo + ultima richiesta.
```

---

## 8. Cosa NON toccare ora

Non fare adesso:

```text
- non rifare la Home;
- non rigenerare asset;
- non fare altro visual polish generico;
- non creare backend;
- non creare login;
- non creare database;
- non creare pagamento;
- non creare chat reale;
- non fare refactor generale;
- non cambiare art direction;
- non aggiungere dipendenze;
- non trasformare la demo in prodotto definitivo.
```

---

## 9. Problemi noti

### 9.1 Home visual non perfetta su mobile

Il background/hero su iPhone non mostra sempre il palco come desiderato.

Decisione:

```text
Accettare temporaneamente.
La Home è abbastanza forte per demo.
Priorità ora: prodotto e flusso.
```

### 9.2 Stato solo locale

Le richieste esistono solo nello stato React locale.

Decisione:

```text
Va bene per demo V0.
Supabase arriverà solo dopo flusso stabile e approvato.
```

### 9.3 Profilo demo non editabile davvero

Il profilo è solo demo.

Decisione:

```text
Va bene per mostrare il concept di identità leggera.
```

---

## 10. Test da eseguire prima di ogni commit

```bash
npm run build
git status
```

Test mobile:

```bash
npm run dev -- --host 0.0.0.0
```

Aprire da iPhone sulla rete locale, esempio:

```text
http://192.168.1.52:5173/
```

Checklist:

```text
[ ] Casa si apre
[ ] Bacheca si apre
[ ] card leggibili
[ ] Chiedi di unirti apre modal
[ ] form invia richiesta
[ ] Messaggi mostra pending
[ ] Profilo mostra richiesta
[ ] Bottom nav funziona
[ ] Build passa
```

---

## 11. Git checkpoint consigliati

Commit già consigliati o da verificare:

```bash
git add .
git commit -m "Create Road to WAO cosmic home base"

git add .
git commit -m "Add Road to WAO app navigation and road board"

git add .
git commit -m "Add join request modal flow"

git add .
git commit -m "Show pending join requests in messages"

git add .
git commit -m "Add lightweight profile panel"
```

Se il repository non è ancora inizializzato:

```bash
git init
git add .
git commit -m "Create Road to WAO app V0"
```

---

## 12. Prossimo step singolo consigliato

Il prossimo step migliore è creare una **Control Room / Admin Demo** molto semplice.

Obiettivo:

```text
mostrare lato moderatore/driver che approva o rifiuta richieste.
```

Perché:

Road to WAO deve funzionare come flow moderato, non come chat casuale.

Flow target:

```text
utente invia richiesta
→ admin vede richiesta pending
→ admin approva
→ utente vede richiesta approvata
→ contatto/gruppo privato simulato viene sbloccato
```

Non backend ancora. Solo stato React locale.

---

## 13. Prompt per ripartire in Antigravity

```text
FAST EDIT ONLY. No screenshots. No long planning.

Obiettivo:
aggiungere una Control Room demo per Road to WAO, senza backend.

Contesto:
l’app ha già Home, Bacheca, Join Request Modal, Messaggi pending e Profilo leggero.
Ora serve simulare il lato moderatore/driver che approva o rifiuta una richiesta.

File consentiti:
- src/App.jsx
- src/components/AdminPanel.jsx se vuoi creare nuovo componente
- src/components/MessagesPanel.jsx
- src/components/BottomNav.jsx se serve
- src/road-to-wao.css

Funzionamento richiesto:
1. Aggiungi accesso demo alla Control Room, per esempio come piccolo bottone/testo in Profilo o Messaggi: “Apri Control Room demo”.
2. La Control Room mostra le richieste pending salvate nello stato React locale.
3. Ogni richiesta mostra:
   - route
   - nickname
   - numero persone
   - messaggio
   - status pending
4. Azioni:
   - Approva
   - Rifiuta
5. Se approvata:
   - lo status della richiesta diventa approved
   - in Messaggi l’utente vede “Richiesta approvata”
   - mostra un contatto/gruppo privato demo: “Gruppo Telegram crew sbloccato”
6. Se rifiutata:
   - status rejected
   - in Messaggi mostra “Richiesta non approvata” con tono gentile.

Regole visual:
- stile cosmic/glass coerente;
- mobile-first;
- nessun backend;
- nessun login;
- nessun pagamento;
- nessun nuovo asset;
- non rifare Home o Bacheca.

Output:
1. file modificati;
2. comportamento aggiunto;
3. come testare.
```

---

## 14. Regola Visual Factory da mantenere

Per tutte le prossime schermate visual premium:

```text
Creative Direction
→ Visual Reference
→ Asset Pack
→ Screen Blueprint
→ Antigravity Implementation
→ Mobile QA
→ Micro-fix
→ Commit
→ Checkpoint
```

Antigravity non deve inventare art direction. Deve eseguire layer, layout, componenti e CSS seguendo asset map e blueprint.

Per schermata:

```text
massimo 3 passaggi Antigravity:
1. Planning read-only
2. Implementazione
3. Micro-fix
STOP
```

---

## 15. Stato finale checkpoint

```text
Road to WAO App V0 è una mini app demo funzionante.
Ha un visual forte, una Bacheca, richiesta join, messaggi pending e profilo leggero.
La prossima evoluzione non è altro polish visuale: è la moderazione/admin approval demo.
```
