import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevEierEllerAdmin: vi.fn() }))

import { sql } from '@vercel/postgres'
import { krevEierEllerAdmin } from '@/lib/auth/apiAuth.ts'
import { GET, POST } from '@/app/api/spillere/[id]/route.ts'
import { pgFeil, sqlTekst, stilleFeillogg } from '@/app/api/spillere/testHjelpere.ts'

const props = { params: Promise.resolve({ id: 'bruker-1' }) }

const somType = (type: 'admin' | 'bruker' | 'gjest') =>
    vi.mocked(krevEierEllerAdmin).mockResolvedValue({ user: { id: 'bruker-1', type } as never })

const lagSkjema = (felt: Record<string, string>) => {
    const formData = new FormData()
    Object.entries(felt).forEach(([navn, verdi]) => formData.set(navn, verdi))
    return new Request('http://localhost/api/spillere/bruker-1', { method: 'POST', body: formData })
}

beforeEach(() => {
    vi.resetAllMocks()
})

describe('POST /api/spillere/[id]', () => {
    it('returnerer 403 uten å spørre databasen når bruker ikke har tilgang', async () => {
        vi.mocked(krevEierEllerAdmin).mockResolvedValue({
            error: NextResponse.json({ error: 'x' }, { status: 403 }),
        })

        const respons = await POST(lagSkjema({ Navn: 'Ola' }), props)

        expect(respons.status).toBe(403)
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 403 for gjester', async () => {
        somType('gjest')

        const respons = await POST(lagSkjema({ Navn: 'Ola', Mobilnummer: '91234567' }), props)

        expect(respons.status).toBe(403)
        expect(await respons.json()).toEqual({ error: 'Gjester kan ikke endre profilen.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 400 når forespørselen ikke er et skjema', async () => {
        somType('bruker')

        const respons = await POST(
            new Request('http://localhost/api/spillere/bruker-1', { method: 'POST', body: 'tull' }),
            props,
        )

        expect(respons.status).toBe(400)
        expect(sql).not.toHaveBeenCalled()
    })

    it.each<Record<string, string>>([
        { Navn: 'a'.repeat(101) },
        { Navn: '   ' },
        { Mobilnummer: '1234' },
        { Mobilnummer: '12345678901234' },
        { Mobilnummer: '9123abcd' },
    ])('returnerer 400 ved ugyldig input %j', async (felt) => {
        somType('bruker')

        const respons = await POST(lagSkjema(felt), props)

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: expect.any(String) })
        expect(sql).not.toHaveBeenCalled()
    })

    it('oppdaterer navn og mobilnummer i ett statement', async () => {
        somType('bruker')
        vi.mocked(sql).mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)

        const respons = await POST(lagSkjema({ Navn: ' Ola ', Mobilnummer: '91234567' }), props)

        expect(respons.status).toBe(200)
        expect(sql).toHaveBeenCalledTimes(1)
        const kall = vi.mocked(sql).mock.calls[0]
        expect(sqlTekst(kall)).toContain('UPDATE brukere')
        expect(sqlTekst(kall)).toContain('UPDATE spillere')
        expect(kall.slice(1)).toEqual(['91234567', 'bruker-1', 'Ola'])
    })

    it('sender null for felt som ikke endres', async () => {
        somType('bruker')
        vi.mocked(sql).mockResolvedValueOnce({ rows: [], rowCount: 1 } as never)

        const respons = await POST(lagSkjema({ Navn: '', Mobilnummer: '' }), props)

        expect(respons.status).toBe(200)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([null, 'bruker-1', null])
    })

    it('returnerer 404 når brukeren ikke finnes', async () => {
        somType('admin')
        vi.mocked(sql).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)

        const respons = await POST(lagSkjema({ Navn: 'Ola' }), props)

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke bruker.' })
    })

    it('returnerer 409 uten å lekke detaljer når brukernavnet er i bruk', async () => {
        somType('bruker')
        stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('23505'))

        const respons = await POST(lagSkjema({ Navn: 'Ola', Mobilnummer: '91234567' }), props)

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke oppdatere profilen. Prøv et annet mobilnummer.' })
    })

    it('logger bare feilkoden ved andre databasefeil', async () => {
        somType('bruker')
        const logg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('08006'))

        const respons = await POST(lagSkjema({ Navn: 'Ola' }), props)

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Feil under oppdatering.' })
        expect(logg).toHaveBeenCalledWith('Feil under oppdatering', '08006')
    })
})

describe('GET /api/spillere/[id]', () => {
    const forespørsel = new Request('http://localhost/api/spillere/bruker-1')

    it('returnerer 403 uten å spørre databasen når bruker ikke har tilgang', async () => {
        vi.mocked(krevEierEllerAdmin).mockResolvedValue({
            error: NextResponse.json({ error: 'x' }, { status: 403 }),
        })

        const respons = await GET(forespørsel, props)

        expect(respons.status).toBe(403)
        expect(sql).not.toHaveBeenCalled()
    })

    it('henter spiller med eksplisitte kolonner', async () => {
        somType('bruker')
        const spiller = { id: 7, navn: 'Ola', vis_navn: true, total_sum: 100 }
        vi.mocked(sql)
            .mockResolvedValueOnce({ rows: [{ id: 'bruker-1', brukernavn: '91234567', spiller_id: 7 }] } as never)
            .mockResolvedValueOnce({ rows: [spiller] } as never)

        const respons = await GET(forespørsel, props)

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual(spiller)
        const [brukerKall, spillerKall] = vi.mocked(sql).mock.calls
        expect(sqlTekst(brukerKall)).toBe('SELECT id, brukernavn, spiller_id FROM brukere WHERE id = ?')
        expect(sqlTekst(spillerKall)).toBe('SELECT id, navn, vis_navn, total_sum FROM spillere WHERE id = ?')
        expect(spillerKall.slice(1)).toEqual([7])
    })

    it('returnerer 404 når brukeren ikke finnes', async () => {
        somType('bruker')
        vi.mocked(sql).mockResolvedValueOnce({ rows: [] } as never)

        const respons = await GET(forespørsel, props)

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke bruker.' })
    })

    it('returnerer 404 når spilleren ikke finnes', async () => {
        somType('bruker')
        vi.mocked(sql)
            .mockResolvedValueOnce({ rows: [{ id: 'bruker-1', brukernavn: '91234567', spiller_id: 7 }] } as never)
            .mockResolvedValueOnce({ rows: [] } as never)

        const respons = await GET(forespørsel, props)

        expect(respons.status).toBe(404)
    })
})
