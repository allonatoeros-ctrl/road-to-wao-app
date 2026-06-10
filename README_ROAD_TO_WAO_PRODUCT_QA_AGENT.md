# Road to WAO — Product QA Agent Pack

Uso: copia questa cartella nel progetto `road-to-wao-app`, idealmente in una cartella tipo:

```text
/agent_context/road-to-wao-product-qa/
```

Oppure carica questi file come contesto in Antigravity prima di lanciare una review read-only.

## File inclusi

1. `CHECKPOINT_ROAD_TO_WAO_APP_V0.md`  
   Stato attuale della mini app, cosa funziona, cosa non toccare, prossimo step.

2. `WAO_CAR_SHARING_PROJECT_CONTEXT_V0.md`  
   Contesto prodotto WAO, posizionamento non ufficiale, safety, limiti MVP.

3. `BLABLAPARTY_TECHNO_CULTURE_INTELLIGENCE_SKILL.md`  
   Skill culturale per non trasformare il prodotto in travel app, dating app o chat caotica.

4. `03_CODING_CONTEXT_PROMPTS_SECURITY_MASTER.md`  
   Regole per agenti coding, context engineering, safe workflow, anti-scope-creep.

5. `FILLOUT_SPECIALIST_AGENT_CONTEXT.md`  
   Contesto no-code/intake utile per capire possibili step futuri con form/manual review, senza backend immediato.

## Prompt pronto

```text
READ-ONLY PRODUCT QA AGENT. Non modificare file.

Agisci come:
Road to WAO Product QA Agent + UX Flow Reviewer + Trust & Safety Specialist + Context Engineer.

Leggi prima questi file di contesto:
- agent_context/CHECKPOINT_ROAD_TO_WAO_APP_V0.md
- agent_context/WAO_CAR_SHARING_PROJECT_CONTEXT_V0.md
- agent_context/BLABLAPARTY_TECHNO_CULTURE_INTELLIGENCE_SKILL.md
- agent_context/03_CODING_CONTEXT_PROMPTS_SECURITY_MASTER.md
- agent_context/FILLOUT_SPECIALIST_AGENT_CONTEXT.md

Poi leggi questi file app:
- src/App.jsx
- src/components/RoadBoard.jsx
- src/components/JoinRequestModal.jsx
- src/components/MessagesPanel.jsx
- src/components/ProfilePanel.jsx
- src/components/AdminPanel.jsx
- src/components/BottomNav.jsx
- src/road-to-wao.css

Obiettivo:
analizzare la mini app Road to WAO attuale e capire cosa manca per renderla una demo prodotto credibile, senza aggiungere feature inutili.

Contesto prodotto:
Road to WAO è una demo mobile-first per organizzare crew/passaggi verso WAO Festival.
Non è servizio ufficiale, non vende biglietti, non organizza viaggi, non gestisce pagamenti e non mostra contatti prima dell’approvazione.
La V0 usa React/Vite, stato locale, localStorage per profilo leggero, no backend, no database, no login.

Analizza:
1. bug funzionali possibili
2. buchi UX nel flow utente
3. buchi nel flow admin/moderatore
4. problemi di copy/safety
5. rischio di sembrare servizio ufficiale WAO
6. rischio di sembrare app viaggio/booking invece che crew/passaggi moderati
7. cosa manca per demo mobile credibile
8. cosa NON costruire ora
9. quale contesto era utile e quale invece va ignorato

Output richiesto:
1. Stato attuale in 5 righe
2. Top 5 problemi reali
3. Top 5 cose da NON fare ora
4. Massimo 3 micro-task consigliati, ordinati per priorità
5. Per ogni micro-task:
   - obiettivo
   - file probabili
   - rischio
   - modello consigliato
   - prompt breve per implementarlo
6. Prossimo step singolo consigliato

Vincoli:
- non modificare file
- non proporre backend ora
- non proporre login ora
- non proporre database ora
- non proporre chat reale ora
- non proporre pagamenti
- non proporre redesign Home
- non proporre nuove sezioni grandi
- ragiona da MVP/demo, non da prodotto definitivo
```

## Modello consigliato

- Gemini Flash High per review prodotto seria.
- Gemini Pro solo se vuoi review più profonda, ma non è obbligatorio.
