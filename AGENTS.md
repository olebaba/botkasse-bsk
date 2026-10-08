# AGENTS.md - `botkasse-bsk`

Repoet `botkasse-bsk` er et verktøy for å hente og vise data fra Botkassen til Bækkelaget bsk innebandy.
Det tilbyr API-endepunkter for å hente, opprette og oppdatere saker i Botkasse.

## 1) Kommandoer

Bruk IntelliJ MCP (`execute_run_configuration`) for scripts — se **`AGENTS-intellij.md`**.

### Før commit (obligatorisk)

Kjør i rekkefølge via `execute_run_configuration`:

1. `format`
2. `test`
3. `build`

## 2) Testing

- Enhet/integrasjon: **Vitest** (`.test.ts` / `.test.tsx`) plassert sammen med koden den tester (f.eks. i `lib/`)
- E2E: Ikke satt opp som standard script i dette repoet per nå
- «Kjør tester» betyr `bun run test` med mindre noe annet er eksplisitt avtalt
- Prioriter tester for endret domenelogikk

## 3) Prosjektstruktur

- Sider: `app/` (Next.js App Router, `app/**/page.tsx`, layout i `app/layout.tsx`)
- API-ruter: `app/api/**/route.ts` (route handlers, f.eks. `app/api/boter/[spiller_id]/route.ts`)
- UI: `komponenter/` (`komponenter/ui/`, `komponenter/tabeller/`, `komponenter/boter/`, `komponenter/spillere/`, `komponenter/navigasjon/`)
- Datahenting på klient: `hooks/` (egne React-hooks med `useState`/`useEffect` + `fetch`)
- Domenelogikk og tjenester: `lib/` (f.eks. `lib/botBeregning.ts`, `lib/spillereService.ts`, `lib/queries.ts`)
- Autentisering: `lib/auth/` (Lucia-basert, f.eks. `krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)

Ved nytt API-endepunkt:

1. Opprett `app/api/{ressurs}/route.ts` (bruk `[id]/route.ts` for dynamiske path-segmenter)
2. Beskytt ruten med `krevInnlogget()` / `krevAdmin()` / `krevEierEllerAdmin()` fra `lib/auth/apiAuth.ts`
3. Spør/skriv direkte mot Postgres med `sql` fra `@vercel/postgres` (se `lib/queries.ts` for delte hjelpefunksjoner)
4. Eksponer endepunktet via en tjenestefunksjon i `lib/{ressurs}Service.ts`, konsumert av en hook i `hooks/`

## 4) Kodestil

- All kode, kommentarer og UI-tekst på **norsk bokmål**
- Bruk eksisterende mønstre i koden fremfor nye varianter
- Bruk props-basert dataflyt og hooks (ingen Redux/Zustand)
- Dato og tid skal håndteres via `lib/dayjs.ts` (ferdigkonfigurert dayjs med norsk locale), ikke importer `dayjs` direkte andre steder
- Klient-fetching skal gå via tjenestefunksjoner i `lib/*Service.ts`, ikke direkte `fetch()` i komponenter

## 5) Git-workflow

- Egen branch per feature/fix, aldri direkte på `main`
- Hold commit-meldinger korte, beskrivende, én linje, uten punktum
- Ingen conventional commit-prefix og ingen issue-nummer påkrevd

Standard flyt:

```sh
git checkout -b kort-beskrivende-navn
# kjør format, test og build via IntelliJ MCP (se «Før commit» i seksjon 1)
git commit -m "Kort beskrivelse på norsk"
git push origin <branch>
```

Opprett PR via GitHub MCP (`create_pull_request`) eller `gh pr create --fill`.

## 6) Grenser (aldri gjør dette)

- Aldri lekke eller logge sensitiv informasjon (fnr, tokens, session-data)
- Aldri hardkode hemmeligheter eller credentials
- Aldri bytt ut datohåndtering i `lib/dayjs.ts` med tilfeldige ad hoc-varianter
- Aldri innfør ny global state-løsning uten eksplisitt beskjed
- Aldri kall backend direkte fra tilfeldige komponenter når hook/tjeneste-mønsteret finnes
- Aldri fjern sikkerhetsmekanismer i API-ruter (`krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)
- Aldri commit med rød format/test/build

## Når du trenger mer kontekst

- `README.md` - prosjektformål og lokal kjøring
- `package.json` - scripts og verktøy som faktisk brukes
- `lib/auth/apiAuth.ts` - tilgangskontroll for API-ruter (`krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)
- `app/api/**/route.ts` - API-ruter, autorisasjon og Postgres-kall
- `hooks/` - anbefalt mønster for datahenting på klient
- `lib/dayjs.ts` - korrekt håndtering av dato og tid
- `lib/queries.ts` - delte Postgres-hjelpefunksjoner

## Hurtigsjekk før levering

- [ ] Endringen følger eksisterende mønster i berørte filer
- [ ] Tester er oppdatert der domenelogikk er endret
- [ ] Format, tester og bygg er grønn (se «Før commit» i seksjon 1)
