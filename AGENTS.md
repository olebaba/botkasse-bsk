# AGENTS.md - `botkasse-bsk`

Botkassen til Bækkelaget bsk innebandy: oversikt over spillere, bøter og lagkassen, med egne sider for botsjefen.

Stack: Next.js (App Router), TypeScript, Tailwind CSS og Postgres (Neon via `@vercel/postgres`), med **bun** som pakkehåndterer.

## Kommandoer

Bruk IntelliJ MCP (`execute_run_configuration`) når det er tilgjengelig, se **`AGENTS-intellij.md`**. Ellers bun:

| Oppgave | Kommando           |
| ------- | ------------------ |
| Format  | `bun run format`   |
| Lint    | `bun run lint`     |
| Tester  | `bun run test:run` |
| Bygg    | `bun run build`    |

- Før commit må `format`, `lint`, `test:run` og `build` være grønne (CI kjører lint, test:run og build)
- Bruk `test:run`, ikke `test`. `test` starter Vitest i watch-modus og blir aldri ferdig
- `format` kjører Prettier på hele repoet. Sjekk `git status` etterpå og tilbakestill filer du ikke jobber med

## Testing

- Vitest (`*.test.ts`) ligger sammen med koden den tester. E2E og UI-tester er ikke satt opp
- Legg til eller oppdater tester når domenelogikk eller API-ruter endres
- Mocking av database, autentisering og `fetch`: se **`AGENTS-testing.md`**

## Struktur og mønstre

- `app/`: sider og API-ruter (`app/api/**/route.ts`)
- `komponenter/`: UI. `hooks/`: datahenting og skjemalogikk. `lib/`: domenelogikk, tjenester og validering. `lib/auth/`: Lucia-autentisering

Nytt API-endepunkt (se `app/api/spillere/route.ts`):

1. Første linje i handleren er `krevInnlogget()`, `krevAdmin()` eller `krevEierEllerAdmin()` fra `lib/auth/apiAuth.ts`
2. Valider input med rene funksjoner i `lib/{ressurs}Validering.ts` som returnerer `{ ok: true, verdi } | { ok: false, feil }`
3. Spør Postgres direkte med `sql` fra `@vercel/postgres`
4. Feil svares med `{ error: string }` på norsk: 400 ugyldig input, 404 ikke funnet, 409 konflikt (Postgres `23505`/`23503`). Logg bare feilkoden
5. Klienten kaller ruten via en tjenestefunksjon i `lib/{ressurs}Service.ts`, som kaster serverens feilmelding, brukt fra en hook i `hooks/`

Hooks viser tilbakemelding med `melding` og `AlertTypes` (se `hooks/useBotSkjema.ts`). Oppdater lokale lister med rene hjelpefunksjoner (f.eks. `lib/spillerListe.ts`) i stedet for å hente på nytt.

## Database

- Det finnes bare én database, og det er **produksjon**
- `spillere.id` er draktnummeret. `bøter.spiller_id` og `brukere.spiller_id` har fremmednøkkel med `ON UPDATE CASCADE`
- `spillere.vis_navn` styrer både visning og den månedlige boten i `app/api/cron/route.ts`
- `app/api/spillere/[id]` tar **bruker-id**, ikke draktnummer
- Ingen migreringsverktøy: skjemaendringer kjøres manuelt. Ta en Neon-branch først, og kjør endringen i prod før koden som trenger den merges

## Kodestil

- All kode, kommentarer og UI-tekst på **norsk bokmål**
- React-komponenter som `const` med arrow function
- Minst mulig kommentarer. Kommenter bare _hvorfor_ der det ikke er åpenbart
- Følg eksisterende mønstre fremfor nye varianter
- Props og hooks for dataflyt, ingen global state (Redux/Zustand)
- Dato og tid via `lib/dayjs.ts`, aldri `dayjs` direkte
- Ingen `fetch()` i komponenter, bruk tjenestefunksjonene i `lib/*Service.ts`

## Git og PR

- Egen branch per endring, aldri direkte på `main`
- Commit-meldinger: én kort linje på norsk, uten punktum, prefiks eller issue-nummer
- Opprett PR med `gh pr create` (GitHub MCP kan bare lese)

## Sikkerhet

- Aldri logg eller lekk sensitiv informasjon (fnr, tokens, session-data, request-body)
- Aldri hardkod eller commit hemmeligheter. Lokale verdier hører hjemme i `.env.local` (ignorert av git)
- Aldri fjern tilgangskontrollen i API-ruter
- Aldri skriv til produksjonsdatabasen uten eksplisitt beskjed. Tester skal aldri koble til databasen
