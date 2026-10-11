import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn(), db: { connect: vi.fn() } }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { db, sql } from '@vercel/postgres'
import { krevAdmin, krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { DELETE, GET, POST, PUT } from '@/app/api/spillere/route.ts'

const somAdmin = () => vi.mocked(krevAdmin).mockResolvedValue({ user: { id: '1', type: 'admin' } as never })

const uten = (status: number) =>
    vi.mocked(krevAdmin).mockResolvedValue({ error: NextResponse.json({ error: 'x' }, { status }) })

const lagRequest = (metode: string, body?: unknown, url = 'http://localhost/api/spillere') =>
    new Request(url, {
        method: metode,
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    })

const pgFeil = (kode: string) => Object.assign(new Error('databasefeil'), { code: kode })

const stilleFeillogg = () => vi.spyOn(console, 'error').mockImplementation(() => undefined)

const sqlTekst = (kall: unknown[]) => (kall[0] as TemplateStringsArray).join('?').replace(/\s+/g, ' ').trim()

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
        expect(vi.mocked(sql).mock.calls[0].slice(1)).toEqual(['Ola', false, 7])
        expect(sqlTekst(vi.mocked(sql).mock.calls[0])).toBe(
            'UPDATE spillere SET navn = ?, vis_navn = ? WHERE id = ? RETURNING id, navn, vis_navn',
        )
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

describe('PUT /api/spillere med nyttDraktnummer', () => {
    const body = { spiller_id: 7, navn: 'Ola', visNavn: false, nyttDraktnummer: 70 }

    const SQL = {
        begin: 'BEGIN',
        laas: 'SELECT id FROM spillere WHERE id = ? FOR UPDATE',
        opprett:
            'INSERT INTO spillere (id, navn, vis_navn, total_sum) ' +
            'SELECT ?::int, ?::text, ?::boolean, total_sum FROM spillere WHERE id = ? RETURNING id, navn, vis_navn',
        flyttBoter: 'UPDATE bøter SET spiller_id = ? WHERE spiller_id = ?',
        flyttBruker: 'UPDATE brukere SET spiller_id = ? WHERE spiller_id = ?',
        slettGammel: 'DELETE FROM spillere WHERE id = ?',
        commit: 'COMMIT',
        rollback: 'ROLLBACK',
    }

    const vellykketRekkefolge = [
        SQL.begin,
        SQL.laas,
        SQL.opprett,
        SQL.flyttBoter,
        SQL.flyttBruker,
        SQL.slettGammel,
        SQL.commit,
    ]

    // Svarer ut fra SQL-teksten, så testene beskriver hvilket statement som feiler (ikke posisjon i en kø).
    const lagKlient = ({
        gammelFinnes = true,
        feilVed = {},
    }: { gammelFinnes?: boolean; feilVed?: Record<string, unknown> } = {}) => {
        const klient = {
            sql: vi.fn(async (...kall: unknown[]): Promise<{ rows: unknown[]; rowCount: number }> => {
                const tekst = sqlTekst(kall)
                if (tekst in feilVed) throw feilVed[tekst]
                if (tekst === SQL.laas) {
                    return gammelFinnes ? { rows: [{ id: 7 }], rowCount: 1 } : { rows: [], rowCount: 0 }
                }
                if (tekst === SQL.opprett) {
                    return { rows: [{ id: 70, navn: 'Ola', vis_navn: false }], rowCount: 1 }
                }
                return { rows: [], rowCount: 0 }
            }),
            release: vi.fn(),
        }
        vi.mocked(db.connect).mockResolvedValue(klient as never)
        return klient
    }

    const setninger = (klient: ReturnType<typeof lagKlient>) => klient.sql.mock.calls.map(sqlTekst)

    it.each([401, 403])('returnerer %i uten å åpne en transaksjon', async (status) => {
        uten(status)

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(status)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(db.connect).not.toHaveBeenCalled()
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 400 for ugyldig nyttDraktnummer uten å åpne en transaksjon', async () => {
        somAdmin()

        const respons = await PUT(lagRequest('PUT', { ...body, nyttDraktnummer: 0 }))

        expect(respons.status).toBe(400)
        expect(await respons.json()).toEqual({ error: 'Nytt draktnummer må være et positivt heltall.' })
        expect(db.connect).not.toHaveBeenCalled()
        expect(sql).not.toHaveBeenCalled()
    })

    it('bruker det enkle UPDATE-statementet uten transaksjon når nyttDraktnummer mangler', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 7, navn: 'Ola', vis_navn: false }], rowCount: 1 } as never)

        const respons = await PUT(lagRequest('PUT', { spiller_id: 7, navn: 'Ola', visNavn: false }))

        expect(respons.status).toBe(200)
        expect(sql).toHaveBeenCalledTimes(1)
        expect(db.connect).not.toHaveBeenCalled()
    })

    it('bruker det enkle UPDATE-statementet uten transaksjon når nyttDraktnummer er likt spiller_id', async () => {
        somAdmin()
        vi.mocked(sql).mockResolvedValueOnce({ rows: [{ id: 7, navn: 'Ola', vis_navn: false }], rowCount: 1 } as never)

        const respons = await PUT(lagRequest('PUT', { ...body, nyttDraktnummer: 7 }))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({
            spiller: { id: '7', navn: 'Ola', visNavn: false, draktnummer: 7, boter: [] },
        })
        expect(sql).toHaveBeenCalledTimes(1)
        expect(sqlTekst(vi.mocked(sql).mock.calls[0])).toBe(
            'UPDATE spillere SET navn = ?, vis_navn = ? WHERE id = ? RETURNING id, navn, vis_navn',
        )
        expect(db.connect).not.toHaveBeenCalled()
    })

    it('flytter spiller, bøter og brukerkobling i én transaksjon og returnerer 200', async () => {
        somAdmin()
        const klient = lagKlient()

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({
            spiller: { id: '70', navn: 'Ola', visNavn: false, draktnummer: 70, boter: [] },
        })
        expect(setninger(klient)).toEqual(vellykketRekkefolge)
        expect(klient.sql.mock.calls.map((kall) => kall.slice(1))).toEqual([
            [],
            [7],
            [70, 'Ola', false, 7],
            [70, 7],
            [70, 7],
            [7],
            [],
        ])
        expect(klient.release).toHaveBeenCalledTimes(1)
    })

    it('kjører hele transaksjonen på én tilkobling og aldri via global sql', async () => {
        somAdmin()
        const klient = lagKlient()

        await PUT(lagRequest('PUT', body))

        expect(db.connect).toHaveBeenCalledTimes(1)
        expect(klient.sql).toHaveBeenCalledTimes(vellykketRekkefolge.length)
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 404 og ruller tilbake uten å opprette ny rad når spilleren ikke finnes', async () => {
        somAdmin()
        const klient = lagKlient({ gammelFinnes: false })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(404)
        expect(await respons.json()).toEqual({ error: 'Fant ikke spiller med draktnummer 7.' })
        expect(setninger(klient)).toEqual([SQL.begin, SQL.laas, SQL.rollback])
        expect(klient.release).toHaveBeenCalledTimes(1)
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 409 og ruller tilbake når det nye draktnummeret allerede er i bruk', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        const klient = lagKlient({ feilVed: { [SQL.opprett]: pgFeil('23505') } })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Draktnummer 70 er allerede i bruk.' })
        expect(setninger(klient)).toEqual([SQL.begin, SQL.laas, SQL.opprett, SQL.rollback])
        expect(klient.release).toHaveBeenCalledTimes(1)
        expect(feillogg).not.toHaveBeenCalled()
        feillogg.mockRestore()
    })

    it.each([
        ['INSERT', SQL.opprett, 2],
        ['UPDATE bøter', SQL.flyttBoter, 3],
        ['UPDATE brukere', SQL.flyttBruker, 4],
        ['DELETE', SQL.slettGammel, 5],
    ])('ruller tilbake uten COMMIT og returnerer 500 når %s feiler', async (_beskrivelse, feilendeSetning, indeks) => {
        somAdmin()
        const feillogg = stilleFeillogg()
        const klient = lagKlient({ feilVed: { [feilendeSetning]: pgFeil('42P01') } })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke endre draktnummer.' })
        expect(setninger(klient)).toEqual([...vellykketRekkefolge.slice(0, indeks + 1), SQL.rollback])
        expect(setninger(klient)).not.toContain(SQL.commit)
        expect(klient.release).toHaveBeenCalledTimes(1)
        expect(sql).not.toHaveBeenCalled()
        expect(feillogg).toHaveBeenCalledTimes(1)
        expect(feillogg).toHaveBeenCalledWith('Feil ved endring av draktnummer', '42P01')
        feillogg.mockRestore()
    })

    it('returnerer 409 med melding om nytt forsøk når DELETE avvises på grunn av nye bøter', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        const klient = lagKlient({ feilVed: { [SQL.slettGammel]: pgFeil('23503') } })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Spilleren fikk nye bøter under endringen, prøv igjen.' })
        expect(setninger(klient)).toEqual([...vellykketRekkefolge.slice(0, 6), SQL.rollback])
        expect(setninger(klient)).not.toContain(SQL.commit)
        expect(klient.release).toHaveBeenCalledTimes(1)
        expect(feillogg).not.toHaveBeenCalled()
        feillogg.mockRestore()
    })

    it('ruller tilbake og returnerer 500 når COMMIT feiler', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        const klient = lagKlient({ feilVed: { [SQL.commit]: new Error('boom') } })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke endre draktnummer.' })
        expect(setninger(klient)).toEqual([...vellykketRekkefolge, SQL.rollback])
        expect(klient.release).toHaveBeenCalledTimes(1)
        feillogg.mockRestore()
    })

    it('ruller tilbake og frigir tilkoblingen når BEGIN feiler', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        const klient = lagKlient({ feilVed: { [SQL.begin]: new Error('boom') } })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke endre draktnummer.' })
        expect(setninger(klient)).toEqual([SQL.begin, SQL.rollback])
        expect(klient.release).toHaveBeenCalledTimes(1)
        feillogg.mockRestore()
    })

    it('svarer med den opprinnelige feilen og frigir tilkoblingen når ROLLBACK også feiler', async () => {
        somAdmin()
        const klient = lagKlient({
            feilVed: { [SQL.opprett]: pgFeil('23505'), [SQL.rollback]: new Error('tilkobling brutt') },
        })

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(409)
        expect(await respons.json()).toEqual({ error: 'Draktnummer 70 er allerede i bruk.' })
        expect(setninger(klient)).toEqual([SQL.begin, SQL.laas, SQL.opprett, SQL.rollback])
        expect(klient.release).toHaveBeenCalledTimes(1)
    })

    it('returnerer 500 og logger bare feilkoden når tilkoblingen ikke kan åpnes', async () => {
        somAdmin()
        const feillogg = stilleFeillogg()
        vi.mocked(db.connect).mockRejectedValueOnce(pgFeil('08006'))

        const respons = await PUT(lagRequest('PUT', body))

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke endre draktnummer.' })
        expect(feillogg).toHaveBeenCalledTimes(1)
        expect(feillogg).toHaveBeenCalledWith('Feil ved endring av draktnummer', '08006')
        expect(sql).not.toHaveBeenCalled()
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
