# AGENTS.md - `botkasse-bsk`

Repoet `botkasse-bsk` er et verktøy for å hente og vise data fra Botkassen til Bækkelaget bsk innebandy.
Det tilbyr API-endepunkter for å hente, opprette og oppdatere saker i Botkasse.

Stack: Next.js (App Router), TypeScript, Tailwind CSS og Postgres (Neon via `@vercel/postgres`). Pakkehåndtering og kjøring med **bun**.

## 1) Kommandoer

Bruk IntelliJ MCP (`execute_run_configuration`) for scripts — se **`AGENTS-intellij.md`**.

### Før commit (obligatorisk)

Kjør i rekkefølge via `execute_run_configuration`:

1. `format`
2. `test:run`
3. `build`

- `format` kjører `prettier --write .` på hele repoet. Sjekk `git status` etterpå og tilbakestill endringer i filer du ikke jobber med.
- Bruk `test:run`, ikke `test`. `test` starter Vitest i watch-modus og blir aldri ferdig.

## 2) Testing

- **Vitest** (`.test.ts` / `.test.tsx`) plassert sammen med koden den tester
- E2E og UI-tester er ikke satt opp
- Prioriter tester for endret domenelogikk
- Mønstre for mocking av database, autentisering og `fetch`: se **`AGENTS-testing.md`**

## 3) Prosjektstruktur

- Sider: `app/` (Next.js App Router, `app/**/page.tsx`, layout i `app/layout.tsx`)
- API-ruter: `app/api/**/route.ts` (route handlers, f.eks. `app/api/boter/[spiller_id]/route.ts`)
- UI: `komponenter/` (`komponenter/ui/`, `komponenter/tabeller/`, `komponenter/boter/`, `komponenter/spillere/`, `komponenter/navigasjon/`)
- Datahenting på klient: `hooks/` (React-hooks som kaller tjenestefunksjoner i `lib/*Service.ts`)
- Domenelogikk og tjenester: `lib/` (f.eks. `lib/botBeregning.ts`, `lib/spillereService.ts`, `lib/queries.ts`)
- Autentisering: `lib/auth/` (Lucia-basert, f.eks. `krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)

Ved nytt API-endepunkt:

1. Opprett `app/api/{ressurs}/route.ts` (bruk `[id]/route.ts` for dynamiske path-segmenter)
2. Beskytt ruten med `krevInnlogget()` / `krevAdmin()` / `krevEierEllerAdmin()` fra `lib/auth/apiAuth.ts` som første linje
3. Valider input med rene funksjoner i `lib/{ressurs}Validering.ts` som returnerer `{ ok: true, verdi } | { ok: false, feil }` (se `lib/spillerValidering.ts`)
4. Spør/skriv direkte mot Postgres med `sql` fra `@vercel/postgres` (se `lib/queries.ts` for delte hjelpefunksjoner)
5. Svar med `{ error: string }` på norsk ved feil: 400 ugyldig input, 404 ikke funnet, 409 konflikt (Postgres-kode `23505` unik, `23503` fremmednøkkel). Logg kun feilkoden, aldri request-body
6. Eksponer endepunktet via en tjenestefunksjon i `lib/{ressurs}Service.ts` som kaster serverens feilmelding, konsumert av en hook i `hooks/`

Hooks viser tilbakemelding med `melding` + `AlertTypes` (se `hooks/useBotSkjema.ts`). Oppdater lokale lister med rene hjelpefunksjoner (f.eks. `lib/spillerListe.ts`) i stedet for ny henting.

## 4) Database

- Det finnes bare én database: **produksjon** (Neon). Tester skal aldri koble til den
- `spillere.id` er draktnummeret. `bøter.spiller_id` og `brukere.spiller_id` har fremmednøkkel med `ON UPDATE CASCADE`, så draktnummer endres med én `UPDATE`. Sletting av spiller med bøter eller bruker blokkeres
- `spillere.vis_navn` styrer både visning og den månedlige boten i `app/api/cron/route.ts`
- `app/api/spillere/[id]` tar **bruker-id**, ikke draktnummer
- Ingen migreringsverktøy: skjemaendringer kjøres manuelt (Neon-konsollet eller IntelliJ, se `AGENTS-intellij.md`). Ta en Neon-branch først, og kjør endringen i prod før koden som trenger den merges

## 5) Kodestil

- All kode, kommentarer og UI-tekst på **norsk bokmål**
- React-komponenter skrives som `const` med arrow function
- Minst mulig kommentarer: koden skal forklare seg selv. Kommenter bare _hvorfor_ der det ikke er åpenbart
- Bruk eksisterende mønstre i koden fremfor nye varianter, og følg beste praksis for Next.js, TypeScript og Tailwind
- Bruk props-basert dataflyt og hooks (ingen Redux/Zustand)
- Importer hjelpefunksjoner og konstanter fra `lib/`. Dato og tid via `lib/dayjs.ts` (ferdigkonfigurert med norsk locale), ikke importer `dayjs` direkte
- Klient-fetching skal gå via tjenestefunksjoner i `lib/*Service.ts`, ikke direkte `fetch()` i komponenter

## 6) Git-workflow

- Egen branch per feature/fix, aldri direkte på `main`
- Hold commit-meldinger korte, beskrivende, én linje, uten punktum
- Ingen conventional commit-prefix og ingen issue-nummer påkrevd

Standard flyt:

```sh
git checkout -b kort-beskrivende-navn
# kjør format, test:run og build via IntelliJ MCP (se «Før commit» i seksjon 1)
git commit -m "Kort beskrivelse på norsk"
git push origin <branch>
```

Opprett PR med `gh pr create --fill` (GitHub MCP kan bare lese).

## 7) Grenser (aldri gjør dette)

- Aldri lekke eller logge sensitiv informasjon (fnr, tokens, session-data)
- Aldri hardkode hemmeligheter eller credentials
- Aldri bytt ut datohåndtering i `lib/dayjs.ts` med tilfeldige ad hoc-varianter
- Aldri innfør ny global state-løsning uten eksplisitt beskjed
- Aldri kall backend direkte fra tilfeldige komponenter når hook/tjeneste-mønsteret finnes
- Aldri fjern sikkerhetsmekanismer i API-ruter (`krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)
- Aldri skriv til produksjonsdatabasen uten eksplisitt beskjed
- Aldri commit med rød format/test/build

## Når du trenger mer kontekst

- `README.md` - prosjektformål og lokal kjøring
- `package.json` - scripts og verktøy som faktisk brukes
- `lib/auth/apiAuth.ts` - tilgangskontroll for API-ruter (`krevInnlogget()`, `krevAdmin()`, `krevEierEllerAdmin()`)
- `app/api/**/route.ts` - API-ruter, autorisasjon og Postgres-kall (`app/api/spillere/route.ts` er et komplett eksempel)
- `hooks/` - anbefalt mønster for datahenting på klient
- `lib/dayjs.ts` - korrekt håndtering av dato og tid
- `lib/queries.ts` - delte Postgres-hjelpefunksjoner

## Hurtigsjekk før levering

- [ ] Endringen følger eksisterende mønster i berørte filer
- [ ] Tester er oppdatert der domenelogikk er endret
- [ ] Format, tester og bygg er grønn (se «Før commit» i seksjon 1)
