import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn(), db: { connect: vi.fn() } }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { db, sql } from '@vercel/postgres'
import { PUT } from '@/app/api/spillere/route.ts'
import { lagRequest, pgFeil, somAdmin, sqlTekst, stilleFeillogg, uten } from '@/app/api/spillere/testHjelpere.ts'

beforeEach(() => {
    vi.clearAllMocks()
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
