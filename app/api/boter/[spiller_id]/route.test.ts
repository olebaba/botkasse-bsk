import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { sql } from '@vercel/postgres'
import { POST } from '@/app/api/boter/[spiller_id]/route.ts'
import { lagRequest, pgFeil, somAdmin, sqlTekst, stilleFeillogg, uten } from '@/app/api/spillere/testHjelpere.ts'

const gyldigBody = { beløp: 50, dato: '2024-09-01', forseelsesId: '2', kommentar: 'for sent' }
const params = (spillerId: string) => ({ params: Promise.resolve({ spiller_id: spillerId }) })

beforeEach(() => {
    vi.clearAllMocks()
})

describe('POST /api/boter/[spiller_id]', () => {
    it('returnerer 401 og 403 uten admin', async () => {
        for (const status of [401, 403]) {
            uten(status)

            const respons = await POST(lagRequest('POST', gyldigBody), params('7'))

            expect(respons.status).toBe(status)
        }
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 400 ved ugyldig JSON', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', '{ikke json'), params('7'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it.each([
        ['ugyldig spiller-id', gyldigBody, 'abc'],
        ['manglende beløp', { ...gyldigBody, beløp: undefined }, '7'],
        ['negativt beløp', { ...gyldigBody, beløp: -5 }, '7'],
        ['beløp som tekst', { ...gyldigBody, beløp: '50' }, '7'],
        ['ugyldig dato', { ...gyldigBody, dato: '2024-02-30' }, '7'],
        ['forseelse som ikke er et heltall', { ...gyldigBody, forseelsesId: 'x' }, '7'],
    ])('returnerer 400 ved %s', async (_navn, body, spillerId) => {
        somAdmin()

        const respons = await POST(lagRequest('POST', body), params(spillerId))

        expect(respons.status).toBe(400)
        expect(sql).not.toHaveBeenCalled()
    })

    it('lagrer boten og oppdaterer summen i ett statement', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValue({ rows: [], rowCount: 1 } as never)

        const respons = await POST(lagRequest('POST', gyldigBody), params('7'))

        expect(respons.status).toBe(200)
        expect(sql).toHaveBeenCalledTimes(1)
        const kall = vi.mocked(sql).mock.calls[0]
        expect(sqlTekst(kall)).toContain('INSERT INTO bøter')
        expect(sqlTekst(kall)).toContain('UPDATE spillere')
        expect(kall.slice(1)).toEqual([7, 50, '2024-09-01', 2, 'for sent', 50, 7])
    })

    it('lagrer tom kommentar som null', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValue({ rows: [], rowCount: 1 } as never)

        await POST(lagRequest('POST', { ...gyldigBody, kommentar: '  ' }), params('7'))

        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([7, 50, '2024-09-01', 2, null, 50, 7])
    })

    it('returnerer 404 ved fremmednøkkelbrudd', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValue(pgFeil('23503'))
        const feillogg = stilleFeillogg()

        const respons = await POST(lagRequest('POST', gyldigBody), params('7'))

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke spilleren eller forseelsen.' })
        feillogg.mockRestore()
    })

    it('returnerer 500 og logger bare feilkoden ved databasefeil', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValue(pgFeil('XX000'))
        const feillogg = stilleFeillogg()

        const respons = await POST(lagRequest('POST', gyldigBody), params('7'))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke legge til bot.' })
        expect(feillogg).toHaveBeenCalledWith('Feil ved oppretting av bot', 'XX000')
        feillogg.mockRestore()
    })
})
