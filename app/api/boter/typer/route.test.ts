import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { sql } from '@vercel/postgres'
import { POST } from '@/app/api/boter/typer/route.ts'
import { lagRequest, pgFeil, somAdmin, stilleFeillogg, uten } from '@/app/api/spillere/testHjelpere.ts'

const gyldigBody = { type: 'For sent', standard_belop: 50 }

beforeEach(() => {
    vi.clearAllMocks()
})

describe('POST /api/boter/typer', () => {
    it('returnerer 401 og 403 uten admin', async () => {
        for (const status of [401, 403]) {
            uten(status)

            const respons = await POST(lagRequest('POST', gyldigBody))

            expect(respons.status).toBe(status)
        }
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 400 ved ugyldig JSON', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', '{ikke json'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it.each([
        ['mangler navn', { standard_belop: 50 }],
        ['har tomt navn', { type: '  ', standard_belop: 50 }],
        ['mangler beløp', { type: 'For sent' }],
        ['har negativt beløp', { type: 'For sent', standard_belop: -1 }],
        ['har beløp som tekst', { type: 'For sent', standard_belop: '50' }],
    ])('returnerer 400 når body %s', async (_navn, body) => {
        somAdmin()

        const respons = await POST(lagRequest('POST', body))

        expect(respons.status).toBe(400)
        expect(sql).not.toHaveBeenCalled()
    })

    it('lagrer forseelsen med trimmet navn', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValue({ rows: [], rowCount: 1 } as never)

        const respons = await POST(lagRequest('POST', { type: ' For sent ', standard_belop: 50 }))

        expect(respons.status).toBe(200)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual(['For sent', 50])
    })

    it('returnerer 409 når forseelsen finnes fra før', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValue(pgFeil('23505'))

        const respons = await POST(lagRequest('POST', gyldigBody))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Forseelsen «For sent» finnes allerede.' })
    })

    it('returnerer 500 og logger bare feilkoden ved databasefeil', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValue(pgFeil('XX000'))
        const feillogg = stilleFeillogg()

        const respons = await POST(lagRequest('POST', gyldigBody))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke legge til forseelse' })
        expect(feillogg).toHaveBeenCalledWith('Feil ved oppretting av forseelse', 'XX000')
        feillogg.mockRestore()
    })
})
