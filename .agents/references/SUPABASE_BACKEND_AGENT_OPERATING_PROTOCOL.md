# SUPABASE BACKEND AGENT OPERATING PROTOCOL
## AI Business Factory — MVP Development Guidelines

Questo protocollo definisce lo standard operativo per l'utilizzo di **Supabase** come backend agentico controllato nei progetti MVP della AI Business Factory (es. Road to WAO, BlaBlaParty, Walbox, ecc.). 

---

### 1. Scopo del Supabase Backend Agent
Il "Supabase Backend Agent" non è un agente creativo o autonomo. È un ruolo tecnico specializzato adibito a:
* **Integrità Dati & Schema**: Gestione, manutenzione e allineamento dello schema PostgreSQL.
* **RLS & Security Hardening**: Configurazione granulare delle Row Level Security (RLS) e delle policy.
* **Lifecycle dei Dati**: Garanzia della corretta transizione di stato delle entità (rides, requests, profiles).
* **Test Isolation**: Controllo e isolamento tra ambienti di test, staging e produzione.
* **Cleanup & Archiviazione**: Manutenzione periodica e soft-cleanup delle istanze per scopi demo.

---

### 2. Quando Usarlo
Attivare ed applicare questo protocollo durante:
* Creazione o modifica di tabelle, chiavi esterne, indici o viste.
* Debugging di problemi di persistenza dei dati o di autorizzazione (es. errori RLS / codice HTTP 401/403).
* Configurazione o modifica di policy RLS.
* Configurazione e setup iniziale di utenti demo.
* Sviluppo ed esecuzione di test unitari/funzionali mocked (Playwright/Jest).
* Sviluppo ed esecuzione di smoke test reali su ambienti di staging/Vercel.
* Operazioni di pulizia o manutenzione periodica dei database demo.
* Interventi per risolvere avvisi del "Supabase Security Advisor".

---

### 3. Regola Mocked vs Real
Per garantire uno sviluppo rapido ed evitare di sporcare le istanze Supabase reali, la Factory adotta due livelli di test rigorosamente separati:

| Ambito | Mocked Test (Playwright E2E) | Real Smoke Test (Vercel) |
| :--- | :--- | :--- |
| **Obiettivo** | Validare la logica applicativa del frontend, i cambi tab, le modali e le risposte d'errore. | Validare l'integrazione end-to-end dell'applicazione reale con Supabase reale su server. |
| **Database** | Completamente isolato in memoria / Mockato tramite `page.route` intercettando le chiamate API Supabase. | Istanza reale PostgreSQL su Supabase (Staging/Production). |
| **Utenti** | Credenziali fittizie o mockate a livello HTTP. | Utenti reali registrati in Supabase Auth via credenziali di test da variabili ambiente. |
| **Impatto DB** | Nessun inserimento reale sul database Supabase. | Inserisce record reali su Supabase (successivamente archiviati in modalità soft). |

---

### 4. Demo Users Protocol
Non utilizzare mai account personali o dati reali degli utenti durante i test di fumo reali.
1. Creare sempre **due utenti demo** con ruoli chiari e complementari (es. il fornitore del servizio e il consumatore del servizio).
   * **Luca (Driver/Provider)**: `luca.driver.demo@roadtowao.local` (offre passaggi, crea offerte).
   * **Sara (Rider/Consumer)**: `sara.raver.demo@roadtowao.local` (cerca passaggi, inserisce richieste).
2. **Nessun Hardcoding**: Non inserire mai le password degli utenti demo nel codice sorgente o nei file di test.
3. **Iniezione via Environment**: Caricare le credenziali dinamicamente a runtime tramite variabili d'ambiente (es. `WAO_LUCA_EMAIL`, `WAO_LUCA_PASSWORD`).
4. **Fallback e Validazione**: All'avvio del test, controllare sempre che le variabili d'ambiente necessarie siano popolate e lanciare un errore descrittivo in caso di assenza.

---

### 5. Test Data Naming Protocol
Tutti i record inseriti durante i test di fumo reali devono essere facilmente identificabili ed isolabili per impedire confusione con i dati degli utenti reali della demo.
* **Prefissi Obbligatori**: Utilizzare sempre i seguenti prefissi all'interno dei campi testuali liberi (es. nickname, messaggi, note):
  * `TEST VERCEL` (per test eseguiti su URL Vercel).
  * `TEST MOCK` (se visibile o richiesto).
  * `DEMO` (per configurazioni base).
* **Esempio di payload**:
  * Nickname: `Luca Driver Demo`
  * Messaggio: `TEST VERCEL LUCA OFFRE`
  * Dettagli bagaglio: `TEST VERCEL LUCA BAGAGLIO`
* **Scopo**: Questo pattern permette di filtrare facilmente i record nella dashboard di Supabase e di eseguire script di soft-cleanup mirati senza rischiare di toccare dati inseriti manualmente dai tester umani.

---

### 6. Supabase Tables & Lifecycle
Le tabelle Supabase devono rispecchiare in modo trasparente il ciclo di vita delle entità dell'applicazione.

#### Rides / Servizi
* **Stati**: `open` (posti disponibili), `full` (al completo), `cancelled` (cancellata dal driver), `archived` (archiviata storicamente o soft-deleted), `completed` (evento terminato).
* **Filtro Bacheca**: La bacheca pubblica deve mostrare esclusivamente i record con `visibility = 'public'` e `status` in `['open', 'full']`.
* **Filtro Control Room**: Deve avere visibilità anche sugli stati storici (`cancelled`, `archived`) per tracciabilità e audit.

#### Join Requests / Prenotazioni
* **Stati**: `pending` (in attesa di risposta dal driver), `approved` (richiesta accettata, contatto privato sbloccato), `rejected` (rifiutata dal driver), `cancelled` (annullata dal passeggero).

#### General Requests / Richieste generiche
* **Stati**: `pending` (attiva in bacheca), `matched` (associata a una ride compatibile), `archived` (archiviata storicamente/rimossa).

---

### 7. Cleanup Strategy
Nell'ecosistema MVP ed in fase di validazione, evitare a tutti i costi l'operazione di `DELETE` fisica (hard delete) sul database.

1. **Soft Archive / Soft Cancel**: Invece di rimuovere fisicamente i dati, effettuare un `UPDATE` dello stato del record (es. impostare `status = 'archived'` o `status = 'cancelled'`).
2. **Cleanup Demo Automatico/Manuale**: Fornire una funzionalità o script (es. pulsante "Pulisci bacheca demo" in Control Room per utenti Admin) che effettua l'archiviazione di massa dei soli record di test.
3. **Sicurezza del Filtro**: Filtrare l'aggiornamento dei record usando i prefissi specificati nel *Test Data Naming Protocol* o isolando i record in stato `pending`/`new` che hanno superato una determinata finestra temporale.
4. **Codice Esempio (PostgreSQL / Edge Functions)**:
   ```sql
   -- Esempio di soft-archive per record demo general_requests
   UPDATE general_requests 
   SET status = 'archived' 
   WHERE status IN ('pending', 'new') 
     AND (message LIKE 'TEST VERCEL%' OR message LIKE 'DEMO%');
   ```

---

### 8. Supabase Security Advisor
Gli avvisi del Security Advisor di Supabase non sono bloccanti, ma vanno monitorati ed inclusi in task di manutenzione dedicati.

1. **Mutable Path Warning**: Le funzioni SQL (es. trigger di sincronizzazione profili) devono definire esplicitamente il `search_path` per evitare attacchi di tipo hijack.
   * *Soluzione*: Aggiungere sempre `SET search_path = public` alle funzioni.
2. **Security Definer Abuse**: Evitare l'utilizzo indiscriminato di `SECURITY DEFINER` se non strettamente necessario (es. quando la funzione deve bypassare le RLS per operazioni di sistema).
3. **Workflow di Sicurezza**: Non tentare mai di applicare patch SQL rapide o script di sicurezza "ad-hoc" in mezzo a modifiche applicative. Istituire sempre un piano di rollback ed eseguire in un task isolato denominato `Supabase Security Hardening`.

---

### 9. Agent Operating Rules
* **READ ONLY First**: Prima di lanciare migrazioni, query SQL o modificare codice del backend, ispezionare accuratamente lo schema corrente, le policy RLS attive e le tabelle coinvolte.
* **PATCH MINIMA**: Applicare modifiche chirurgiche ai soli file di migrazione o ai file del servizio DB. Non effettuare refactoring strutturali del modulo DB se non esplicitamente concordato.
* **NO TERMINAL**: Non lanciare comandi sul terminale o avviare processi Playwright/npm a meno che non sia specificato dall'utente.
* **Isolamento file `.env`**: Non modificare mai direttamente il file `.env` locale contenente segreti reali, ma affidarsi alle variabili esportate dall'ambiente del terminale.

---

### 10. Prompt Templates

#### Template: READ ONLY Supabase Diagnosis
```markdown
Contesto: Ho riscontrato un errore di tipo [403 Forbidden / RLS violation / fail persistenza] sulla tabella [NomeTabella].
Obiettivo: Analizzare lo schema della tabella, i trigger attivi e le policy RLS per diagnosticare la causa del problema.
Istruzioni: Leggi la definizione della tabella e le policy correnti in Supabase. Non effettuare modifiche. Restituisci un riepilogo della diagnosi.
```

#### Template: Create Real Smoke Test
```markdown
Contesto: Abbiamo configurato Supabase e rilasciato l'app su Vercel.
Obiettivo: Creare uno smoke test end-to-end reale in tests/smoke/ che usi le variabili d'ambiente (WAO_LUCA_EMAIL, WAO_SARA_EMAIL, ecc.) per validare il flusso reale.
Istruzioni: Il test deve simulare il login reale, l'inserimento di dati con prefisso "TEST VERCEL", la verifica della comparsa in Bacheca e nei Messaggi, e il logout pulito. Nessun hardcode di credenziali.
```

---

### 11. AI Business Factory Reuse
Questo pattern di backend controllato e test di fumo è uno standard riutilizzabile per qualsiasi nuovo micro-servizio o MVP. Ogni nuovo progetto avviato all'interno della AI Business Factory deve comprendere fin dal primo giorno:
1. Una coppia di **utenti demo** configurati nel seed del database o documentati.
2. Una suite di **test mockati** locali per il test rapido della UI (Playwright).
3. Uno **smoke test reale** per verificare l'app pubblicata su URL pubblica (es. Vercel) connessa a Supabase reale.
4. Una **strategia di archiviazione soft** per la rimozione periodica dei dati di test.
5. Una configurazione solida di **RLS** per ogni tabella creata.
