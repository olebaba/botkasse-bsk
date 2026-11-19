import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: { query: vi.fn() } }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { sql } from '@vercel/postgres'
import { POST } from '@/app/api/boter/betal/route.ts'
import { lagRequest, pgFeil, somAdmin, stilleFeillogg, uten } from '@/app/api/spillere/testHjelpere.ts'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('POST /api/boter/betal', () => {
    it('returnerer 401 og 403 uten admin', async () => {
        for (const status of [401, 403]) {
            uten(status)

            const respons = await POST(lagRequest('POST', { botIder: ['1'], erBetalt: true }))

            expect(respons.status).toBe(status)
        }
        expect(sql.query).not.toHaveBeenCalled()
    })

    it('returnerer 400 ved ugyldig JSON', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', '{ikke json'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql.query).not.toHaveBeenCalled()
    })

    it.each([
        ['mangler botIder', { erBetalt: true }],
        ['har tom botIder', { botIder: [], erBetalt: true }],
        ['har botIder som ikke er en liste', { botIder: '1', erBetalt: true }],
        ['har bot-id som ikke er et heltall', { botIder: ['1', 'abc'], erBetalt: true }],
        ['mangler erBetalt', { botIder: ['1'] }],
        ['har erBetalt som ikke er boolsk', { botIder: ['1'], erBetalt: 'true' }],
    ])('returnerer 400 når body %s', async (_navn, body) => {
        somAdmin()

        const respons = await POST(lagRequest('POST', body))

        expect(respons.status).toBe(400)
        expect(sql.query).not.toHaveBeenCalled()
    })

    it.each([true, false])('setter erBetalt til %s i stedet for å veksle', async (erBetalt) => {
        somAdmin()
        vi.mocked(sql.query).mockResolvedValue({ rows: [], rowCount: 2 } as never)

        const respons = await POST(lagRequest('POST', { botIder: ['1', 2], erBetalt }))

        expect(respons.status).toBe(200)
        const [tekst, verdier] = vi.mocked(sql.query).mock.calls[0]
        expect(tekst).not.toContain('NOT er_betalt')
        expect(verdier).toEqual([erBetalt, [1, 2]])
    })

    it('returnerer 404 når ingen bøter ble funnet', async () => {
        somAdmin()
        vi.mocked(sql.query).mockResolvedValue({ rows: [], rowCount: 0 } as never)

        const respons = await POST(lagRequest('POST', { botIder: ['1'], erBetalt: true }))

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ingen av de valgte bøtene.' })
    })

    it('returnerer 500 og logger bare feilkoden ved databasefeil', async () => {
        somAdmin()
        vi.mocked(sql.query).mockRejectedValue(pgFeil('XX000'))
        const feillogg = stilleFeillogg()

        const respons = await POST(lagRequest('POST', { botIder: ['1'], erBetalt: true }))

        expect(respons.status).toBe(500)
        expect(feillogg).toHaveBeenCalledWith('Feil ved markering av bøter', 'XX000')
        feillogg.mockRestore()
    })
})
