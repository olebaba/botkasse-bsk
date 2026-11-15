# AGENTS-testing.md

Mønstre for Vitest i `botkasse-bsk`. Kjør med `test:run` (se `AGENTS.md`).

## Generelt

- Miljøet er `node`. Importer `describe`, `it`, `expect` og `vi` eksplisitt fra `'vitest'`
- Rene funksjoner i `lib/` testes direkte. Skriv testene først for validering og domenelogikk
- Datoer i testdata lages via `lib/dayjs.ts`

## API-ruter

Det finnes ingen testdatabase, så ruter testes med mocket database og autentisering:

```ts
vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))
```

- Bruk factory-mocks. Ekte import av `apiAuth.ts` starter Lucia-adapteren mot databasen
- Gjenbruk hjelperne i `app/api/spillere/testHjelpere.ts`
- Sjekk at `sql` ikke kalles ved 401, 403 og 400
- Sjekk verdiene som sendes til databasen med `vi.mocked(sql).mock.calls[0].slice(1)`
- Eksempel: `app/api/spillere/route.test.ts`

## Tjenester

Mock `fetch` med `vi.stubGlobal('fetch', vi.fn())` og rydd med `vi.unstubAllGlobals()` i `afterEach`. Eksempel: `lib/spillereService.test.ts`.

## UI

Ingen testrammeverk for komponenter, og det skal ikke legges til uten beskjed. Legg logikk i hooks og rene funksjoner i `lib/` slik at den kan testes.
