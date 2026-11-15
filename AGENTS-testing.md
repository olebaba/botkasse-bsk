# AGENTS-testing.md

Mønstre for Vitest i `botkasse-bsk`. Kjør tester med run-konfigurasjonen `test:run` (se `AGENTS-intellij.md`).

## Generelt

- Miljøet er `node` (`vitest.config.ts`). Importer `describe`, `it`, `expect` og `vi` eksplisitt fra `'vitest'`
- Rene funksjoner i `lib/` testes direkte. Skriv testene først for validering og domenelogikk
- Testdata med datoer lages via `lib/dayjs.ts` (se `lib/spillerSortering.test.ts`)

## API-ruter

Det finnes ingen testdatabase, så ruter testes med mocket database og autentisering:

```ts
vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))
```

- Bruk factory-mocks. Ekte import av `apiAuth.ts` starter Lucia-adapteren mot databasen
- Gjenbruk hjelperne i `app/api/spillere/testHjelpere.ts` (`somAdmin`, `uten`, `lagRequest`, `pgFeil`, `sqlTekst`, `stilleFeillogg`)
- Sjekk at `sql` ikke kalles ved 401/403/400
- Sjekk verdiene som sendes til databasen med `vi.mocked(sql).mock.calls[0].slice(1)`, og SQL-teksten med `sqlTekst`
- Simuler Postgres-feil med `pgFeil('23505')` og lignende
- Se `app/api/spillere/route.test.ts` for et komplett eksempel

## Tjenester

Mock `fetch` med `vi.stubGlobal('fetch', vi.fn())` og `vi.unstubAllGlobals()` i `afterEach`. Bygg svar med `new Response(JSON.stringify(...), { status })` (se `lib/spillereService.test.ts`).

## UI

Det finnes ikke noe testrammeverk for komponenter (ingen testing-library eller jsdom), og det skal ikke legges til uten beskjed. Hold logikken i hooks og rene funksjoner i `lib/` slik at den kan testes, og verifiser UI med `lint`, `build` og manuell sjekk.
