import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { hentForseelseStatistikk } from './statistikkService'

const jsonRespons = (body: unknown, status: number) => new Response(JSON.stringify(body), { status })

describe('hentForseelseStatistikk', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('kaller API-et med encodet id og returnerer statistikken', async () => {
        const statistikk = {
            forseelseId: '3',
            forseelseNavn: 'Sen ankomst',
            antallBoter: 2,
            totaltBelop: 100,
            innsamletBelop: 50,
            spillerMedFlestBoter: null,
        }
        fetchMock.mockResolvedValue(jsonRespons(statistikk, 200))

        const resultat = await hentForseelseStatistikk('a/b')

        expect(resultat).toEqual(statistikk)
        expect(fetchMock).toHaveBeenCalledWith('/api/statistikk/a%2Fb')
    })

    it('kaster serverens feilmelding ved feil', async () => {
        fetchMock.mockResolvedValue(jsonRespons({ error: 'Forseelse ikke funnet' }, 404))

        await expect(hentForseelseStatistikk('99')).rejects.toThrow('Forseelse ikke funnet')
    })

    it('kaster standardmelding når feilresponsen ikke er JSON', async () => {
        fetchMock.mockResolvedValue(new Response('feil', { status: 500 }))

        await expect(hentForseelseStatistikk('1')).rejects.toThrow('Kunne ikke hente statistikk')
    })
})
