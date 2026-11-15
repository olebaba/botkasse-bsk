import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { sql } from '@vercel/postgres'
import { krevAdmin, krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { DELETE, GET, POST, PUT } from '@/app/api/spillere/route.ts'
import { lagRequest, pgFeil, somAdmin, sqlTekst, stilleFeillogg, uten } from '@/app/api/spillere/testHjelpere.ts'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('POST /api/spillere', () => {
    it('POST returnerer 401 når ikke innlogget', async () => {
        uten(401)

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: 'Ola' }))

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST returnerer 403 når bruker ikke er admin', async () => {
        uten(403)

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: 'Ola' }))

        expect(respons.status).toBe(403)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST sjekker admin før forespørselen leses', async () => {
        uten(401)

        const respons = await POST(lagRequest('POST', '{ikke json'))

        expect(krevAdmin).toHaveBeenCalledTimes(1)
        expect(respons.status).toBe(401)
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST returnerer 400 ved ugyldig JSON', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', '{ikke json'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST returnerer 400 når JSON-innholdet ikke er et objekt', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', 'null'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST returnerer 400 for draktnummer 0', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', { draktnummer: 0, navn: 'Ola' }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Draktnummer må være et positivt heltall.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST returnerer 400 for tomt navn', async () => {
        somAdmin()

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: '   ' }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Navn må fylles ut.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('POST oppretter spilleren og returnerer 201', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 7, navn: 'Ola', vis_navn: true }], rowCount: 1 } as never)

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: ' Ola ' }))

        expect(respons.status).toBe(201)
        expect(await respons.json()).toEqual({
            spiller: { id: '7', navn: 'Ola', visNavn: true, draktnummer: 7, boter: [] },
        })
        expect(sql).toHaveBeenCalledTimes(1)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([7, 'Ola'])
        expect(sqlTekst(vi.mocked(sql).mock.calls[0])).toBe(
            'INSERT INTO spillere (id, navn, vis_navn, total_sum) VALUES (?, ?, true, 0) RETURNING id, navn, vis_navn',
        )
    })

    it('POST returnerer 409 når draktnummeret allerede er i bruk', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('23505'))

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: 'Ola' }))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Draktnummer 7 er allerede i bruk.' })
    })

    it('POST returnerer 500 ved ukjent feil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(new Error('boom'))

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: 'Ola' }))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke legge til spiller.' })
        feillogg.mockRestore()
    })

    it('POST returnerer 500 og logger bare feilkoden for andre databasefeil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('42P01'))

        const respons = await POST(lagRequest('POST', { draktnummer: 7, navn: 'Ola' }))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke legge til spiller.' })
        expect(feillogg).toHaveBeenCalledTimes(1)
        expect(feillogg).toHaveBeenCalledWith('Feil ved oppretting av spiller', '42P01')
        feillogg.mockRestore()
    })
})

describe('GET /api/spillere', () => {
    it('GET returnerer spillere med uendret form', async () => {
        vi.mocked(krevInnlogget).mockResolvedValue({ user: { id: '1', type: 'bruker' } as never })
        vi.mocked(sql).mockResolvedValueOnce({
            rows: [
                { id: 7, navn: 'Ola', vis_navn: true },
                { id: 12, navn: 'Kari', vis_navn: false },
            ],
            rowCount: 2,
        } as never)

        const respons = await GET(new NextRequest('http://localhost/api/spillere'))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({
            spillere: [
                { id: '7', navn: 'Ola', visNavn: true, draktnummer: 7, boter: [] },
                { id: '12', navn: 'Kari', visNavn: false, draktnummer: 12, boter: [] },
            ],
        })
        expect(sql).toHaveBeenCalledTimes(1)
    })
})

describe('PUT /api/spillere', () => {
    const gyldigBody = { spiller_id: 7, navn: 'Ola', visNavn: false }

    it('PUT returnerer 401 når ikke innlogget', async () => {
        uten(401)

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 403 når bruker ikke er admin', async () => {
        uten(403)

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(403)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT sjekker admin før forespørselen leses', async () => {
        uten(401)

        const respons = await PUT(lagRequest('PUT', '{ikke json'))

        expect(krevAdmin).toHaveBeenCalledTimes(1)
        expect(respons.status).toBe(401)
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 400 ved ugyldig JSON', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', '{ikke json'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Ugyldig forespørsel.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 400 når spiller_id er en streng', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', { spiller_id: '7', navn: 'Ola', visNavn: true }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Draktnummer må være et positivt heltall.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 400 for tomt navn', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', { spiller_id: 7, navn: '   ', visNavn: true }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Navn må fylles ut.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 400 når visNavn mangler', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', { spiller_id: 7, navn: 'Ola' }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Vis spiller må være sann eller usann.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 404 når spilleren ikke finnes', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke spiller med draktnummer 7.' })
        expect(sql).toHaveBeenCalledTimes(1)
    })

    it('PUT oppdaterer navn og visNavn og returnerer 200', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 7, navn: 'Ola', vis_navn: false }], rowCount: 1 } as never)

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({
            spiller: { id: '7', navn: 'Ola', visNavn: false, draktnummer: 7, boter: [] },
        })
        expect(sql).toHaveBeenCalledTimes(1)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([7, 'Ola', false, 7])
        expect(sqlTekst(vi.mocked(sql).mock.calls[0])).toBe(
            'UPDATE spillere SET id = ?, navn = ?, vis_navn = ? WHERE id = ? RETURNING id, navn, vis_navn',
        )
    })

    it('PUT endrer draktnummer i samme UPDATE og returnerer spilleren med nytt nummer', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 70, navn: 'Ola', vis_navn: false }], rowCount: 1 } as never)

        const respons = await PUT(lagRequest('PUT', { ...gyldigBody, nyttDraktnummer: 70 }))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({
            spiller: { id: '70', navn: 'Ola', visNavn: false, draktnummer: 70, boter: [] },
        })
        expect(sql).toHaveBeenCalledTimes(1)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([70, 'Ola', false, 7])
    })

    it('PUT returnerer 400 for ugyldig nyttDraktnummer uten å spørre databasen', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', { ...gyldigBody, nyttDraktnummer: 0 }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Nytt draktnummer må være et positivt heltall.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('PUT returnerer 409 når det nye draktnummeret allerede er i bruk', async () => {
        somAdmin()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('23505'))

        const respons = await PUT(lagRequest('PUT', { ...gyldigBody, nyttDraktnummer: 70 }))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Draktnummer 70 er allerede i bruk.' })
    })

    it('PUT returnerer 500 ved ukjent feil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(new Error('boom'))

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke oppdatere spiller.' })
        feillogg.mockRestore()
    })

    it('PUT returnerer 500 og logger bare feilkoden for databasefeil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('42P01'))

        const respons = await PUT(lagRequest('PUT', gyldigBody))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke oppdatere spiller.' })
        expect(feillogg).toHaveBeenCalledTimes(1)
        expect(feillogg).toHaveBeenCalledWith('Feil ved oppdatering av spiller', '42P01')
        feillogg.mockRestore()
    })
})

describe('DELETE /api/spillere', () => {
    const lagSlettRequest = (query = 'spiller_id=7') =>
        new NextRequest(`http://localhost/api/spillere?${query}`, { method: 'DELETE' })

    const slettingUtenTreff = (kontroll: { finnes: boolean; antall_boter: number; har_bruker: boolean }) =>
        vi
            .mocked(sql)
            .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
            .mockResolvedValueOnce({ rows: [kontroll], rowCount: 1 } as never)

    it('DELETE returnerer 401 når ikke innlogget', async () => {
        uten(401)

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('DELETE returnerer 403 når bruker ikke er admin', async () => {
        uten(403)

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(403)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('DELETE returnerer 400 når spiller_id ikke er et tall', async () => {
        somAdmin()

        const respons = await DELETE(lagSlettRequest('spiller_id=abc'))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Draktnummer må være et positivt heltall.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('DELETE returnerer 400 når spiller_id mangler', async () => {
        somAdmin()

        const respons = await DELETE(lagSlettRequest(''))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Draktnummer må være et positivt heltall.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('DELETE sletter spilleren i ett atomisk statement og returnerer 200', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 7 }], rowCount: 1 } as never)

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({ message: 'Spiller slettet.' })
        expect(sql).toHaveBeenCalledTimes(1)
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual([7])
        const tekst = sqlTekst(vi.mocked(sql).mock.calls[0])
        expect(tekst).toContain('DELETE FROM spillere s WHERE s.id = ?')
        expect(tekst).toContain('NOT EXISTS (SELECT 1 FROM bøter')
        expect(tekst).toContain('NOT EXISTS (SELECT 1 FROM brukere')
    })

    it('DELETE slår opp årsaken i en egen spørring når ingenting ble slettet', async () => {
        somAdmin()
        slettingUtenTreff({ finnes: true, antall_boter: 3, har_bruker: false })

        await DELETE(lagSlettRequest())

        expect(sql).toHaveBeenCalledTimes(2)
        expect(vi.mocked(sql).mock.calls[1].slice(1)).toEqual([7, 7, 7])
        expect(sqlTekst(vi.mocked(sql).mock.calls[1])).toBe(
            'SELECT EXISTS (SELECT 1 FROM spillere WHERE id = ?) AS finnes, ' +
                '(SELECT COUNT(*) FROM bøter WHERE spiller_id = ?)::int AS antall_boter, ' +
                'EXISTS (SELECT 1 FROM brukere WHERE spiller_id = ?) AS har_bruker',
        )
    })

    it('DELETE returnerer 404 når spilleren ikke finnes', async () => {
        somAdmin()
        slettingUtenTreff({ finnes: false, antall_boter: 0, har_bruker: false })

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke spiller med draktnummer 7.' })
    })

    it('DELETE returnerer 409 når spilleren har bøter', async () => {
        somAdmin()
        slettingUtenTreff({ finnes: true, antall_boter: 3, har_bruker: false })

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({
            error: 'Spilleren har bøter og kan ikke slettes. Skjul spilleren i stedet.',
        })
    })

    it('DELETE returnerer 409 når spilleren er koblet til en brukerkonto', async () => {
        somAdmin()
        slettingUtenTreff({ finnes: true, antall_boter: 0, har_bruker: true })

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Spilleren er koblet til en brukerkonto og kan ikke slettes.' })
    })

    it('DELETE returnerer 409 med melding om nytt forsøk når ingenting blokkerer lenger', async () => {
        somAdmin()
        slettingUtenTreff({ finnes: true, antall_boter: 0, har_bruker: false })

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Spilleren kunne ikke slettes, prøv igjen.' })
    })

    it('DELETE returnerer 409 når databasen avviser slettingen på grunn av bøter', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('23503'))

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({
            error: 'Spilleren har bøter og kan ikke slettes. Skjul spilleren i stedet.',
        })
        expect(feillogg).not.toHaveBeenCalled()
        feillogg.mockRestore()
    })

    it('DELETE returnerer 500 ved ukjent feil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(new Error('boom'))

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke slette spiller.' })
        feillogg.mockRestore()
    })

    it('DELETE returnerer 500 og logger bare feilkoden for andre databasefeil', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('42P01'))

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke slette spiller.' })
        expect(feillogg).toHaveBeenCalledTimes(1)
        expect(feillogg).toHaveBeenCalledWith('Feil ved sletting av spiller', '42P01')
        feillogg.mockRestore()
    })

    it('DELETE returnerer 500 når oppfølgingsspørringen feiler', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(sql)
            .mockResolvedValueOnce({ rows: [], rowCount: 0 } as never)
            .mockRejectedValueOnce(new Error('boom'))

        const respons = await DELETE(lagSlettRequest())

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke slette spiller.' })
        feillogg.mockRestore()
    })
})
