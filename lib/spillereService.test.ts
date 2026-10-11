import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { lagSpiller, oppdaterSpiller, slettSpiller } from './spillereService'

const jsonRespons = (body: unknown, status: number) => new Response(JSON.stringify(body), { status })

describe('spillereService', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('lagSpiller', () => {
        it('sender POST med draktnummer og navn og returnerer spilleren', async () => {
            const spiller = { id: '7', draktnummer: 7, navn: 'Ola Nordmann', boter: [], visNavn: true }
            fetchMock.mockResolvedValue(jsonRespons({ spiller }, 201))

            const resultat = await lagSpiller(7, 'Ola Nordmann')

            expect(resultat).toEqual(spiller)
            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith('/api/spillere', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ draktnummer: 7, navn: 'Ola Nordmann' }),
            })
        })

        it('kaster serverens feilmelding ved 409', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 'Draktnummer 7 er allerede i bruk.' }, 409))

            await expect(lagSpiller(7, 'Ola Nordmann')).rejects.toThrow(new Error('Draktnummer 7 er allerede i bruk.'))
        })

        it('kaster standardmelding når feilresponsen ikke er JSON', async () => {
            fetchMock.mockResolvedValue(new Response('<html>feil</html>', { status: 500 }))

            await expect(lagSpiller(7, 'Ola Nordmann')).rejects.toThrow(new Error('Kunne ikke legge til spiller.'))
        })

        it('kaster standardmelding når feilresponsen mangler error-tekst', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 42 }, 500))

            await expect(lagSpiller(7, 'Ola Nordmann')).rejects.toThrow(new Error('Kunne ikke legge til spiller.'))
        })
    })

    describe('oppdaterSpiller', () => {
        it('sender PUT med spiller_id, navn og visNavn og returnerer spilleren', async () => {
            const spiller = { id: '7', draktnummer: 7, navn: 'Kari Nordmann', boter: [], visNavn: false }
            fetchMock.mockResolvedValue(jsonRespons({ spiller }, 200))

            const resultat = await oppdaterSpiller(7, { navn: 'Kari Nordmann', visNavn: false })

            expect(resultat).toEqual(spiller)
            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith('/api/spillere', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spiller_id: 7, navn: 'Kari Nordmann', visNavn: false }),
            })
        })

        it('sender nyttDraktnummer i PUT-body når draktnummeret endres', async () => {
            const spiller = { id: '70', draktnummer: 70, navn: 'Kari Nordmann', boter: [], visNavn: true }
            fetchMock.mockResolvedValue(jsonRespons({ spiller }, 200))

            const resultat = await oppdaterSpiller(7, { navn: 'Kari Nordmann', visNavn: true, nyttDraktnummer: 70 })

            expect(resultat).toEqual(spiller)
            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith('/api/spillere', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spiller_id: 7, navn: 'Kari Nordmann', visNavn: true, nyttDraktnummer: 70 }),
            })
        })

        it('kaster serverens feilmelding ved 404', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 'Fant ikke spilleren.' }, 404))

            await expect(oppdaterSpiller(7, { navn: 'Kari', visNavn: true })).rejects.toThrow(
                new Error('Fant ikke spilleren.'),
            )
        })

        it('kaster serverens feilmelding ved 409 når nytt draktnummer er i bruk', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 'Draktnummer 70 er allerede i bruk.' }, 409))

            await expect(oppdaterSpiller(7, { navn: 'Kari', visNavn: true, nyttDraktnummer: 70 })).rejects.toThrow(
                new Error('Draktnummer 70 er allerede i bruk.'),
            )
        })

        it('kaster standardmelding når feilresponsen ikke er JSON', async () => {
            fetchMock.mockResolvedValue(new Response('<html>feil</html>', { status: 500 }))

            await expect(oppdaterSpiller(7, { navn: 'Kari', visNavn: true })).rejects.toThrow(
                new Error('Kunne ikke oppdatere spiller.'),
            )
        })
    })

    describe('slettSpiller', () => {
        it('sender DELETE med spiller_id i URL-en', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ message: 'Spiller slettet.' }, 200))

            await expect(slettSpiller(7)).resolves.toBeUndefined()

            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith('/api/spillere?spiller_id=7', { method: 'DELETE' })
        })

        it('kaster serverens feilmelding ved 409', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 'Spilleren har bøter og kan ikke slettes.' }, 409))

            await expect(slettSpiller(7)).rejects.toThrow(new Error('Spilleren har bøter og kan ikke slettes.'))
        })

        it('kaster standardmelding når feilresponsen ikke er JSON', async () => {
            fetchMock.mockResolvedValue(new Response('<html>feil</html>', { status: 500 }))

            await expect(slettSpiller(7)).rejects.toThrow(new Error('Kunne ikke slette spiller.'))
        })
    })
})
