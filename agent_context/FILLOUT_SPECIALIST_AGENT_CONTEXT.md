# FILLOUT_SPECIALIST_AGENT_CONTEXT.md

Versione: 1.0  
Data creazione: 2026-06-07  
Area: AI Business Factory / No-Code Validation Backend / Fillout Specialist Agent  
Completezza stimata: 90%  
Stato: research brief operativo basato su fonti Fillout ufficiali aggiornate al 2026-06-07

---

## Fonti usate

### Fonti Fillout ufficiali / primarie

- Fillout — Home: https://www.fillout.com/
- Fillout — Pricing: https://www.fillout.com/pricing
- Fillout Help — Use AI to create forms: https://www.fillout.com/help/ai-forms
- Fillout Help — Sync form results to a database: https://www.fillout.com/help/guides/sync-form-results
- Fillout / Zite Help — Zite Database REST API: https://www.zite.com/help/database/api/database-api
- Fillout Help — Webhooks: https://www.fillout.com/help/webhook
- Fillout Help — Create a webhook via API: https://www.fillout.com/help/api-reference/create-a-webhook
- Fillout Help — Embed Fillout forms on React: https://www.fillout.com/help/embed-forms-react
- Fillout Help — Condition groups: https://www.fillout.com/help/condition-logic-groups
- Fillout Help — Dynamic data: https://www.fillout.com/help/fetch-dynamic-data
- Fillout Help — Map fields to integrations: https://www.fillout.com/help/additional-integration-mappings
- Fillout — Integrations: https://www.fillout.com/integrations
- Fillout Help — Styling & Branding: https://www.fillout.com/help/styling
- Fillout Help — Disable internal storage: https://www.fillout.com/help/internal-storage
- Fillout — About: https://www.fillout.com/about
- Fillout — Workflows: https://www.fillout.com/workflows

### Fonti interne AI Business Factory usate come contesto

- `21_README_AND_USAGE_GUIDE.md`
- `23_SHORT_MANUAL.md`
- `17_WALBOX_CASE_STUDY.md`
- `19_CHECKPOINT_TEMPLATE.md`
- `28_OPENAI_AGENTS_SDK_DEEP_DIVE.md`
- `29_TOOL_CALLING_AND_STRUCTURED_OUTPUTS.md`
- `33_AGENT_EVALUATION_QA_AND_TRACING.md`
- `35_AI_SOFTWARE_FACTORY_ORCHESTRATOR.md`

---

## 1. Missione del Fillout Specialist Agent

Il **Fillout Specialist Agent** è un agente no-code/product specializzato nella AI Business Factory.

La sua missione è decidere quando Fillout è lo strumento giusto per trasformare una domanda, un flusso di intake o una validazione MVP in un form/app leggera, senza costruire subito backend, dashboard o codice custom.

Deve lavorare prima del Frontend/Backend Agent quando il progetto è ancora in fase di validazione, raccolta dati, screening, onboarding, feedback o manual review.

Non deve vendere Fillout come soluzione definitiva.

Formula operativa:

```text
Fillout = validation backend + intake layer + manual review tool
non = app definitiva / database prodotto / social network / realtime app / backend complesso
```

Output principali dell’agente:

```text
- scelta Fillout sì/no;
- form schema;
- question flow;
- conditional logic;
- safety/privacy fields;
- integration/export plan;
- embed plan per React/Vite;
- prompt per Fillout AI;
- criterio di passaggio a Supabase/custom app.
```

---

## 2. Quando usare Fillout

Usa Fillout quando il problema è raccogliere dati strutturati da utenti, clienti, staff o locali e poi revisarli manualmente o esportarli.

Casi ideali:

```text
- validazione nuova idea;
- form di richiesta demo;
- lista attesa;
- candidatura;
- survey;
- feedback post-evento;
- onboarding cliente/locale;
- intake staff;
- raccolta offerte/richieste da moderare;
- MVP senza backend;
- board manuale alimentata da form;
- workflow leggero con export CSV/Sheets/Airtable/Notion;
- trigger webhook verso Zapier, Make, n8n o API propria.
```

È particolarmente utile quando:

```text
- non serve realtime;
- non serve login utente pieno;
- non serve chat interna;
- non serve pagare;
- non serve dashboard complessa;
- si vuole imparare dal comportamento prima di costruire;
- il rischio maggiore è costruire troppo presto.
```

---

## 3. Quando NON usare Fillout

Non usare Fillout quando il cuore del prodotto è già una vera app interattiva con stato dinamico, realtime, ruoli utenti complessi o esperienza custom.

Da evitare per:

```text
- realtime queue tipo Walbox live;
- TV screen sincronizzato;
- dashboard staff operativa in tempo reale;
- social network / community interna;
- chat tra utenti;
- matching automatico serio;
- pagamenti marketplace;
- login/profili completi;
- loyalty con saldo punti affidabile;
- prenotazioni/conti aperti con valore economico reale;
- dati sensibili non necessari;
- scraping o import non autorizzati;
- prodotto finale che richiede UX branded molto custom.
```

Regola:

```text
Se il valore è “raccolgo e valuto” → Fillout.
Se il valore è “interagisco live” → React/Supabase/custom app.
```

---

## 4. Fillout in una AI Business Factory

Dentro la Factory, Fillout occupa il livello tra landing e backend.

Pattern:

```text
Idea / landing
↓
Fillout form
↓
responses / Zite DB / Google Sheets / Airtable
↓
manual review
↓
insight / board / follow-up
↓
decisione: stop / iterate / build Supabase
```

Ruolo corretto:

```text
Validation Backend Temporaneo
```

Significa:

- raccoglie dati veri;
- struttura le domande;
- abilita review manuale;
- consente export;
- può essere embed in React/Vite;
- può mandare dati via webhook/API;
- evita di costruire database custom prima di sapere se serve.

Non sostituisce:

- Product Agent;
- privacy/safety review;
- moderazione umana;
- Supabase quando serve prodotto dinamico;
- React quando serve esperienza custom.

---

## 5. Funzionalità principali aggiornate

### 5.1 Form builder

Fillout permette di creare form, survey e quiz con editor drag-and-drop, temi, domande, logiche, risposte e integrazioni.

Funzionalità chiave:

```text
- form illimitati;
- domande illimitate;
- multi-page forms;
- 50+ field types;
- review page;
- file upload;
- answer piping;
- conditional logic;
- calculations/scoring;
- hidden fields;
- pre-fill;
- close date;
- custom closed message;
- templates.
```

### 5.2 AI Form Builder

Fillout AI può generare un form da prompt, importare domande, importare form esistenti e convertire PDF/documenti in form.

Uso Factory:

```text
ChatGPT genera prompt preciso → Fillout AI crea prima bozza → Fillout Specialist Agent revisiona schema e safety → pubblicazione test.
```

Non fidarsi della prima generazione AI:

```text
sempre review manuale delle domande, dati raccolti, consenso e logica condizionale.
```

### 5.3 Multi-step / wizard

Fillout supporta multi-page forms e logiche per mostrare/nascondere pagine o endings.

Uso:

```text
- Step 1: intent / consenso;
- Step 2: dati essenziali;
- Step 3: preferenze;
- Step 4: conferma/review;
- Thank you page con next step.
```

### 5.4 Logiche condizionali

Fillout supporta condition groups con AND, OR e nested conditions per mostrare, nascondere o validare campi.

Uso Factory:

```text
WAO: se “offro passaggio” mostra posti disponibili, auto, bagagli.
WAO: se “cerco passaggio” mostra numero persone, budget contributo, flessibilità.
BlaBlaParty: se “ho già biglietto” mostra ticket status; se “non ho biglietto” non vendere ticket, solo status.
Walbox: se “sono locale” mostra richiesta demo; se “sono cliente” mostra survey.
```

### 5.5 Response storage / database / Zite

Fillout salva risposte e può sincronizzarle a **Zite Database**, il database interno collegato all’ecosistema Fillout/Zite.

Uso pratico:

```text
- vedere submissions nel tab Results;
- aggiornare/modificare risposte;
- creare record in database;
- aggiornare record esistenti;
- usare database con più tabelle, campi, viste;
- accedere via REST API.
```

Nota importante:

```text
Zite DB è utile come database temporaneo/no-code.
Non trattarlo come sostituto definitivo di Supabase per app con logica prodotto complessa.
```

### 5.6 Integrazioni

Fillout dichiara integrazioni native e partner con strumenti come:

```text
Airtable, HubSpot, Notion, Stripe, Google Sheets, Salesforce,
Slack, SmartSuite, Monday.com, Calendly, Google Calendar, Gmail,
Webhook, Discord, Amazon S3, Google Drive, Google Docs, OneDrive,
Dropbox, SendGrid, Mailchimp, Zapier, Make, Relay, Microsoft Teams,
Activepieces, PostgreSQL, MySQL, Firebase, MongoDB e altri.
```

Uso Factory:

```text
- Google Sheets = board/manual review veloce;
- Airtable = database no-code più strutturato;
- Notion = CRM leggero/documentazione;
- Webhook = ponte verso n8n/Make/Zapier/API propria;
- Slack/Discord/Email = notifiche interne;
- Google Docs/PDF = report o recap, ma non MVP iniziale.
```

### 5.7 Webhook / API

Fillout può inviare submissions via webhook verso Make, Zapier o qualsiasi endpoint. I webhook possono usare GET/POST/PUT/DELETE, con body, URL parameters, headers e cookies.

Fillout REST API consente operazioni come:

```text
- recuperare forms;
- recuperare form metadata;
- recuperare submissions;
- recuperare submission by id;
- cancellare submission;
- creare/rimuovere webhook;
- creare submissions.
```

Zite DB API consente CRUD su database, tabelle, campi e record.

Uso Factory:

```text
Webhook prima.
API solo quando serve davvero integrazione programmata.
Supabase quando il form non basta più.
```

### 5.8 Embedding React/Vite

Fillout può essere condiviso via link, QR o embed. Per React è disponibile la libreria `@fillout/react`, utile per popup, slider e custom button.

Pattern React/Vite:

```text
Landing React/Vite
↓
CTA “Join / Request / Submit”
↓
Fillout popup o full-page embed
↓
Thank you page / redirect
↓
Manual review
```

Regola:

```text
Per V0 usa link o popup.
Non installare dipendenze se basta un link.
```

### 5.9 Branding / custom domain / white label

Fillout supporta temi, logo, immagini, font, custom CSS, custom links, custom favicon, custom domains e rimozione branding in base al piano.

Impatto operativo:

```text
Free = utile per test, ma branding Fillout visibile.
Starter/Pro/Business = utile quando il form entra in demo seria o cliente.
Business = custom domain e analytics più avanzate.
```

### 5.10 Privacy / security / data handling

Fillout dichiara SOC 2 compliance, cifratura in transito con TLS 1.2, cifratura a riposo con AES e backup giornalieri cifrati.

Fillout offre anche opzione Enterprise per disabilitare storage interno: in quel caso le submission non vengono salvate sui server Fillout ma passate a integrazioni/webhook. Questo limita funzioni come Results page, partial submissions, PDF generation, scheduling e approvals.

Regola Factory:

```text
Non raccogliere dati sensibili se non servono.
Non promettere compliance perfetta.
Per test MVP raccogli solo dati minimi, esplicita uso e review manuale.
```

---

## 6. Limiti e rischi

### Limiti prodotto

```text
- non è una realtime app;
- non è un backend relazionale completo tipo Supabase;
- non è un social/community engine;
- non è una dashboard custom operativa;
- non sostituisce moderazione umana;
- non è ideale per UX molto brandizzata o interattiva;
- non è adatto a matching complesso automatico;
- non è ideale per dati sensibili in V0.
```

### Rischi operativi

```text
- form troppo lungo → abbandono;
- domande ambigue → dati inutili;
- raccolta dati eccessiva → rischio privacy;
- confondere form app con prodotto definitivo;
- creare workflow Make/Zapier/n8n prima di validare;
- generare board pubbliche senza review;
- promettere sicurezza/compliance non verificata;
- lasciare Fillout branding in demo dove serve percezione premium.
```

### Rischio AI Form Builder

L’AI builder può creare struttura veloce, ma può anche:

```text
- chiedere dati non necessari;
- creare campi ambigui;
- non distinguere bene “cerco/offro”;
- dimenticare consenso/safety;
- creare flow troppo lungo;
- usare wording non coerente col brand.
```

Mitigazione:

```text
Prompt preciso + review manuale + checklist privacy/safety + test da telefono.
```

---

## 7. Pricing e piano free: impatto operativo

Prezzi verificati al 2026-06-07, billing annuale indicato da Fillout:

| Piano | Prezzo | Risposte/mese | Impatto operativo |
|---|---:|---:|---|
| Free | $0/mese | 1.000 | Ottimo per validazione V0, form illimitati, domande illimitate, seat illimitati. Branding Fillout visibile e limiti su branding/custom features. |
| Starter | $15/mese annuale | 2.000 | Buono se il form inizia a essere usato seriamente e servono custom endings, redirect, login forms, più field types. |
| Pro | $40/mese annuale | 5.000 | Utile per demo più professionali: custom emails, remove branding, custom share links, custom fonts/favicon, custom CSS. |
| Business | $75/mese annuale | illimitate | Utile per uso cliente/operativo più serio: custom domain, analytics, custom code, partial submissions, pre-fetch data, priority support. |
| Enterprise | custom | custom | Solo per requisiti forti: storage esterno, data residency, access control, compliance avanzata. |

Decisione Factory:

```text
Free per test e validazione.
Pro solo se il form deve sembrare prodotto brandizzato.
Business solo se custom domain/analytics/volume diventano necessari.
Enterprise non ora.
```

---

## 8. Fillout vs alternative

| Tool | Quando usarlo | Limite rispetto a Factory |
|---|---|---|
| Google Forms | Test ultra semplice, zero costo, dati in Sheets | Poco brand, UX debole, meno adatto a MVP vendibile/demo premium |
| Tally | Form semplici, budget zero, ottima semplicità | Meno forte se vuoi AI generation, database/workflow più avanzato, branding/app-like flow |
| Typeform | Esperienza conversazionale premium | Può costare di più; meno adatto se vuoi database/integrations pesanti a basso attrito |
| Jotform | Form molto completi, enterprise-ish, pagamenti, documenti | Può diventare pesante/complesso; rischio overbuilding form-suite |
| Airtable Forms | Se dati vivono già in Airtable | Form UX meno forti; dipendenza da Airtable schema |
| Softr | App no-code su Airtable/Sheets | Più vicino a mini-app, ma più setup; non serve per semplice intake |
| Glide | Mobile/data app no-code | Più app builder che form; utile dopo validazione |
| Fillout + Airtable | Intake + database no-code forte | Buono se board/manual review è centrale, ma attenzione a non creare backend parallelo |
| Fillout + Google Sheets | V0 più veloce per board/manual review | Fragile se cresce; ottimo per test 7-14 giorni |
| Fillout + Supabase | Ponte verso app vera | Ha senso solo quando si è deciso di costruire backend vero |

Sintesi:

```text
Tally = form semplice.
Fillout = form + workflow + database/integrations + AI generation.
Supabase = backend vero.
React = esperienza prodotto custom.
```

---

## 9. Fillout vs Supabase / backend custom

### Usa Fillout quando

```text
- il dato entra una volta e viene rivisto manualmente;
- non serve realtime;
- non serve user account;
- non serve dashboard custom;
- non sai ancora quali campi servono davvero;
- vuoi testare domanda/offerta;
- vuoi ridurre tempo e token.
```

### Usa Supabase/custom backend quando

```text
- serve stato live;
- serve login;
- serve profilo utente;
- serve board pubblica dinamica;
- serve matching automatico;
- serve moderazione strutturata;
- serve storico/ruoli/permessi;
- serve app vera con UI custom;
- serve accesso dati dal frontend in modo controllato.
```

Regola di passaggio:

```text
Fillout valida schema e domanda.
Supabase costruisce prodotto dopo segnale reale.
```

---

## 10. Pattern operativo: Landing React → Fillout → Review manuale → Export → Decisione

```text
1. Landing React/Vite spiega valore e posizionamento.
2. CTA apre Fillout via link/popup/embed.
3. Fillout raccoglie dati minimi con logica condizionale.
4. Submission entra in Results/Zite/Sheets/Airtable.
5. Review manuale: approva, scarta, raggruppa, contatta.
6. Board pubblica o interna aggiornata manualmente.
7. Dopo 7-14 giorni si misura segnale.
8. Decisione: stop / migliorare form / costruire Supabase.
```

Metriche minime:

```text
- tasso completamento;
- numero submission valide;
- qualità dati;
- percentuale casi review-approved;
- domande ricorrenti;
- attrito nei campi;
- bisogno reale emerso;
- quante persone rispondono al follow-up.
```

---

## 11. Pattern per Walbox

### Cosa usare ora

Fillout è utile per Walbox soprattutto fuori dal core live jukebox.

Usi immediati:

```text
1. Walbox Demo Request per locali.
2. Prenotazione / candidatura serata test.
3. Onboarding locale: nome locale, logo, palette, mood, Spotify setup, TV disponibile.
4. Feedback post-serata clienti.
5. Feedback staff/owner/SMM.
6. Survey preferenze musicali prima/dopo serata.
7. Report manuale post-serata con domande strutturate.
```

MVP ora:

```text
Walbox core resta React/Supabase/Spotify.
Fillout serve per sales, onboarding, feedback e validation di nuove feature.
```

### Cosa rimandare

```text
- loyalty leggerissima via Fillout;
- coupon request;
- profilo cliente temporaneo;
- survey periodiche;
- AI summary delle risposte;
- workflow automatici email/Slack.
```

### Cosa NON fare con Fillout

```text
- sostituire la queue live;
- far scegliere canzoni live tramite Fillout;
- gestire approvazione staff live;
- costruire TV screen con Fillout;
- usare Fillout come database definitivo per punti/loyalty;
- raccogliere dati personali non necessari dei clienti al tavolo.
```

### Pattern consigliato Walbox

```text
React/Vite Walbox demo
+ Fillout “Richiedi demo locale”
+ Fillout “Feedback serata”
+ manual review
+ report post-serata
```

---

## 12. Pattern per BlaBlaParty

### Cosa usare ora

Fillout può essere il form principale della V0, al posto o in alternativa a Tally, se vuoi più controllo, logiche condizionali, integrazioni e AI generation.

Usi immediati:

```text
1. Form “Trova crew”.
2. Raccolta interesse per eventi pilota.
3. Screening safety base.
4. Ticket status senza vendere biglietti.
5. Città di partenza.
6. Vibe matching leggero.
7. Disponibilità a entrare in gruppo Telegram moderato.
8. Feedback dopo festival.
9. Candidatura admin/moderatori.
```

MVP ora:

```text
Landing React/Vite + Fillout + Google Sheets/Airtable + review manuale + Telegram.
```

### Cosa rimandare

```text
- matching automatico;
- profili utente;
- login;
- app mobile;
- chat interna;
- reputazione utenti;
- calendario eventi dinamico;
- notifiche automatiche complesse.
```

### Cosa NON fare con Fillout

```text
- vendere biglietti;
- gestire pagamenti;
- fare dating-like matching;
- pubblicare dati personali in board pubblica;
- creare gruppi automatici senza review;
- chiedere documenti o dati sensibili non necessari;
- fingere ufficialità con festival/organizzatori.
```

### Pattern consigliato BlaBlaParty

```text
Landing React/Vite
↓
Fillout “Find your festival crew”
↓
Google Sheets/Airtable board privata
↓
review manuale
↓
crew board pubblica con dati minimizzati
↓
Telegram group/manual intro
```

---

## 13. Pattern per WAO Car Sharing Board

### Cosa usare ora

WAO Car Sharing Board è il caso più adatto per Fillout subito.

Motivo:

```text
il problema attuale è intake ordinato + distinzione cerca/offre + review manuale,
non ancora app realtime.
```

Form minimo:

```text
1. Disclaimer: board non ufficiale, non organizza/garantisce passaggi.
2. Conferma età 18+.
3. Ruolo: cerco passaggio / offro passaggio / sto valutando.
4. Nome/nickname.
5. Contatto Telegram obbligatorio o preferito.
6. Instagram opzionale.
7. Città/zona partenza.
8. Data partenza.
9. Data ritorno.
10. Numero persone.
11. Se offro: posti disponibili, auto, bagagli, tappe, contributo spese.
12. Se cerco: posti richiesti, flessibilità, bagagli, contributo spese.
13. Note safety/logistica.
14. Consenso a review manuale e contatto da admin.
15. Thank you page: “ti contattiamo se troviamo match, non è conferma passaggio”.
```

### Cosa rimandare

```text
- profili Supabase;
- matching automatico;
- mappa tratte;
- gruppi automatici;
- notifiche automatiche;
- reputazione/recensioni;
- verifica identità;
- app car sharing completa.
```

### Cosa NON fare con Fillout

```text
- promettere sicurezza del passaggio;
- gestire pagamenti;
- mostrare telefoni/email pubblicamente;
- creare gruppi senza consenso;
- automatizzare pairing tra sconosciuti senza review;
- presentarsi come ufficiale WAO/festival;
- raccogliere documenti, targa o dati sensibili se non necessari.
```

### Pattern consigliato WAO

```text
Landing/board React o pagina semplice
↓
Fillout intake con scelta chiara cerco/offro/valuto
↓
Google Sheets/Airtable/Zite DB
↓
admin review
↓
creazione gruppi per tratta
↓
board pubblica minimizzata
```

Decisione:

```text
WAO Car Sharing Board è il primo caso d’uso Fillout da implementare.
```

---

## 14. Prompt library per Fillout AI

### 14.1 Prompt — WAO Car Sharing Board

```text
Create a multi-step form for a non-official festival car sharing board.

Goal:
Collect structured submissions from people who are looking for a ride, offering a ride, or just evaluating options for a festival trip.

Tone:
Clear, friendly, safety-first, not commercial, not official.

Important disclaimer:
This board is not official, does not organize transport, does not guarantee rides, and only helps admins review and connect compatible people manually.

Form structure:
1. Intro and disclaimer acceptance.
2. Age confirmation: user must confirm they are 18+.
3. Main intent with a required single-choice field:
   - I am looking for a ride
   - I am offering a ride
   - I am evaluating / not sure yet
4. Contact details:
   - name or nickname
   - Telegram contact
   - Instagram optional
5. Trip details:
   - departure city/area
   - departure date
   - return date
   - number of people
6. Conditional section if “offering a ride”:
   - number of available seats
   - car type optional
   - luggage space
   - possible stops
   - expected fuel/toll contribution
   - smoking/music/pet preferences optional
7. Conditional section if “looking for a ride”:
   - seats needed
   - luggage
   - flexibility on departure/return
   - willing to share fuel/toll costs
8. Safety and consent:
   - consent to manual review by admins
   - consent to be contacted by admins
   - consent to be added to a small route group only after review
9. Final notes.
10. Thank you page:
   “Submission received. This is not a confirmed ride. Admins will review and contact you if there is a compatible route.”

Use conditional logic to show only relevant questions based on the main intent.
Avoid collecting sensitive data, IDs, exact home address, payment information or private phone number unless necessary.
```

### 14.2 Prompt — BlaBlaParty Crew Finder

```text
Create a multi-step form for BlaBlaParty, a moderated Festival Crew Finder for techno/house festivals.

Goal:
Collect requests from people who want to find a crew or join other festival-goers.

Positioning:
Not a dating app, not a ticket marketplace, not a travel agency, not official festival organization.

Tone:
Modern, festival-oriented, clear, trust & safety first.

Form structure:
1. Intro: explain that BlaBlaParty helps manually review and connect compatible people/crews.
2. Age confirmation: 18+ required.
3. Event selection:
   - select festival/event
   - “other event” option
4. Ticket status:
   - I already have a ticket
   - I plan to buy one
   - I am still evaluating
   Note: do not sell tickets.
5. Departure city/area.
6. Travel status:
   - going alone
   - going with 1 friend
   - small group looking for more people
7. Vibe preferences:
   - techno / house / hard techno / melodic / mixed
   - chill / high-energy / social / focused on music
8. Contact:
   - nickname
   - Telegram
   - Instagram optional
9. Safety agreement:
   - respectful behavior
   - manual moderation
   - no harassment
   - admin can reject unsafe submissions
10. Consent to be contacted and possibly invited to a moderated Telegram group.
11. Thank you page with next steps.

Use conditional logic to adapt questions to solo users vs small groups.
Do not ask for sensitive personal data.
```

### 14.3 Prompt — Walbox demo request per locali

```text
Create a short, professional demo request form for Walbox, a social experience for bars and pubs.

Goal:
Collect qualified requests from venue owners, managers or social media managers who want to test Walbox during a real night.

Positioning:
Walbox is not a huge app or a replacement for staff/social media manager. It is an interactive social experience: QR at the table, music requests, mood/dedications, staff dashboard, live TV screen and post-night content signals.

Form structure:
1. Venue name.
2. City / area.
3. Role:
   - owner
   - manager
   - social media manager
   - staff
   - other
4. Type of venue:
   - pub
   - cocktail bar
   - brewery
   - club/bar
   - event space
   - other
5. What they want to test:
   - Shuffle Night
   - customer music requests
   - TV live screen
   - customer feedback
   - social content
   - not sure yet
6. Does the venue have a TV/screen available?
7. Does the venue use Spotify Premium or a music setup?
8. Preferred date/time for a short demo call or in-person demo.
9. Contact details.
10. Optional notes.
11. Thank you page: “We’ll review your request and propose a simple pilot night.”

Keep it short. Do not mention complex AI, backend, Supabase or technical stack.
```

### 14.4 Prompt — Walbox feedback serata

```text
Create a mobile-first feedback form for customers after a Walbox Shuffle Night.

Goal:
Understand if the social jukebox experience increased participation, fun, visibility and willingness to join another night.

Tone:
Short, informal, pub-friendly.

Form structure:
1. Did you use Walbox tonight?
   - yes
   - no, but I saw it
   - no
2. How fun was the experience? 1-5.
3. Did seeing requests/dedications on TV make the night more engaging? 1-5.
4. What did you use?
   - requested a song
   - sent a dedication
   - reacted/mood
   - watched TV screen only
5. What should be improved?
6. Would you use it again?
7. Optional nickname/table.
8. Optional permission to quote anonymous feedback.
9. Thank you page.

Do not ask for unnecessary personal data.
Keep it under 2 minutes.
```

### 14.5 Prompt — Walbox onboarding locale

```text
Create an onboarding form for a venue that wants to run a Walbox pilot night.

Goal:
Collect all information needed to configure a simple pilot night without overbuilding.

Sections:
1. Venue basics:
   - venue name
   - address/city
   - contact person
   - role
2. Brand basics:
   - logo upload optional
   - main colors
   - tone of voice
   - phrases/memes to include or avoid
3. Event setup:
   - pilot night date
   - expected number of tables/customers
   - TV/screen availability
   - Wi-Fi availability
   - staff person responsible
4. Music setup:
   - Spotify Premium available yes/no
   - playlist controlled by venue yes/no
   - genres allowed
   - songs/artists to avoid
5. Moderation preferences:
   - manual approval
   - semi-automatic
   - dedications moderated yes/no
6. Success criteria:
   - more participation
   - social content
   - customer feedback
   - test new format
7. Final notes.

Do not ask for passwords, API keys or private credentials.
```

### 14.6 Prompt — validation test per nuova idea MVP

```text
Create a validation form for a new MVP idea inside an AI Business Factory.

Goal:
Validate demand before building a custom app.

Form structure:
1. One-sentence intro explaining the idea.
2. Who are you?
   - potential user
   - buyer/decision maker
   - curious observer
   - other
3. What problem are you trying to solve?
4. How do you solve it today?
5. How painful is the problem? 1-5.
6. Would this solution be useful? 1-5.
7. Which feature matters most?
8. What would make you not use it?
9. Would you join a beta or test?
10. Contact optional.
11. Consent to be contacted.
12. Thank you page explaining this is a validation test, not a finished product.

Keep the form short and focused on learning, not selling.
Do not collect sensitive or unnecessary data.
```

---

## 15. Checklist prima di pubblicare un form

```text
[ ] Il form ha un obiettivo unico.
[ ] Le prime 2 schermate chiariscono cosa succede.
[ ] C’è distinzione netta tra ruoli/intenti.
[ ] I campi obbligatori sono davvero necessari.
[ ] Conditional logic testata.
[ ] Thank you page chiara.
[ ] Test da mobile fatto.
[ ] Test submission fatta.
[ ] Export/review verificato.
[ ] Board pubblica non espone dati privati.
[ ] Link/QR funzionano.
[ ] Branding coerente col progetto.
[ ] Non promette ciò che il progetto non fa.
```

---

## 16. Checklist privacy/safety

```text
[ ] Raccogli solo dati minimi.
[ ] Spiega perché raccogli i dati.
[ ] Spiega chi li vede.
[ ] Spiega che la review è manuale se lo è.
[ ] Non raccogli documenti/ID se non necessari.
[ ] Non raccogli indirizzo preciso di casa.
[ ] Non pubblicare Telegram/Instagram senza consenso.
[ ] Non promettere sicurezza o verifica totale.
[ ] Non presentare progetto non ufficiale come ufficiale.
[ ] Non usare dati per finalità diverse da quelle dichiarate.
[ ] Prevedi modo manuale per rimuovere una submission.
[ ] Per under 18: bloccare o evitare il caso in MVP.
[ ] Per dati sensibili: non usare Fillout V0 senza revisione privacy/legale.
```

---

## 17. Errori da evitare

```text
1. Usare Fillout per fare una app realtime.
2. Fare form lunghissimi.
3. Chiedere dati “perché magari servono”.
4. Non distinguere “cerco” e “offro”.
5. Fare board pubbliche con contatti visibili.
6. Usare AI Form Builder senza revisione.
7. Aggiungere automazioni Make/n8n prima di capire il workflow manuale.
8. Confondere validation backend con prodotto finale.
9. Pagare piano alto prima del test.
10. Inserire API key o credenziali nel form.
11. Raccogliere pagamenti non necessari.
12. Promettere match, passaggi, sicurezza o risultati garantiti.
```

---

## 18. Roadmap: quando passare da Fillout a Supabase/custom app

Passa a Supabase/custom app quando almeno 3 condizioni sono vere:

```text
[ ] Il form riceve submission valide e ripetute.
[ ] La review manuale è diventata lenta o ripetitiva.
[ ] Serve stato pubblico aggiornato.
[ ] Serve login/profilo.
[ ] Serve matching o filtro dinamico.
[ ] Serve dashboard custom.
[ ] Serve realtime.
[ ] Serve moderazione strutturata.
[ ] Serve controllo completo UX/brand.
[ ] Serve data model stabile.
```

Soglie pratiche:

```text
0-30 submissions: Fillout + Sheets manuale.
30-100 submissions: Fillout + Airtable/Zite + review process.
100+ submissions o uso ricorrente: valutare Supabase.
Realtime/TV/live: Supabase/custom subito.
```

---

## 19. Workflow consigliato con Antigravity

### Caso: landing React/Vite esistente

Usa Antigravity solo per collegare bene la CTA e non toccare il core.

Prompt sicuro:

```text
Modifica solo @src/config/links.js e @src/components/[CTA_COMPONENT].jsx.

Obiettivo:
collegare il bottone principale al link Fillout [URL].

Vincoli:
- non modificare layout generale;
- non aggiungere dipendenze;
- non toccare routing;
- non toccare Supabase/backend;
- se serve embed avanzato, fermati e proponi piano.

Output:
1. cosa hai modificato;
2. come testare da desktop e mobile;
3. cosa non hai toccato.
```

### Modello consigliato

```text
Gemini Flash Low: cambiare solo link CTA.
Gemini Flash Medium: aggiungere popup/embed leggero o configurazione link.
Gemini Flash High: integrare @fillout/react con stato/modal custom.
Pro: solo se serve architettura multi-form, webhook/API o integrazione Supabase.
```

### Non fare in Antigravity ora

```text
- non costruire backend custom se Fillout basta;
- non installare @fillout/react se un link basta;
- non creare automazioni n8n prima del test manuale;
- non rifare landing per adattarla al form;
- non toccare core Walbox stabile.
```

---

## 20. Prossimo step singolo

Decisione finale:

```text
Fillout nella AI Business Factory va usato come validation backend temporaneo e intake layer no-code, prima di Supabase/custom app.
```

Primo caso d’uso da implementare:

```text
WAO Car Sharing Board.
```

Perché:

```text
- il problema immediato è form sbagliato/ambiguo;
- serve distinguere chiaramente cerco/offro/valuto;
- serve review manuale;
- serve export/board temporanea;
- non serve backend custom nella V0;
- non bisogna ancora costruire app completa.
```

Primo task operativo:

```text
Creare in Fillout il form WAO Car Sharing Board usando il prompt 14.1,
poi testarlo da telefono con 3 submission finte:
1. cerco passaggio;
2. offro passaggio;
3. sto valutando.
```

Checkpoint dopo test:

```text
- link form;
- campi funzionanti;
- logiche condizionali;
- export/review;
- dati da pubblicare in board;
- dati da tenere privati;
- correzioni necessarie;
- decisione: usare Fillout / cambiare form / passare a React custom.
```
