import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { hentUtgifter, summerUtgifter, type Utgift } from './utgiftService'

const jsonRespons = (body: unknown, status: number) => new Response(JSON.stringify(body), { status })

describe('utgiftService', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    describe('hentUtgifter', () => {
        it('henter utgiftene fra /api/utgifter og returnerer dem', async () => {
            const utgifter = [{ utgift: 'Baller', beløp: 150, dato: '2026-11-01' }]
            fetchMock.mockResolvedValue(jsonRespons(utgifter, 200))

            const resultat = await hentUtgifter()

            expect(resultat).toEqual(utgifter)
            expect(fetchMock).toHaveBeenCalledTimes(1)
            expect(fetchMock).toHaveBeenCalledWith('/api/utgifter', { next: { revalidate: 86400 } })
        })

        it('kaster serverens feilmelding ved feil', async () => {
            fetchMock.mockResolvedValue(jsonRespons({ error: 'Kunne ikke hente utgifter.' }, 500))

            await expect(hentUtgifter()).rejects.toThrow(new Error('Kunne ikke hente utgifter.'))
        })

        it('kaster standardmelding når feilresponsen ikke er JSON', async () => {
            fetchMock.mockResolvedValue(new Response('<html>feil</html>', { status: 500 }))

            await expect(hentUtgifter()).rejects.toThrow(new Error('Kunne ikke hente utgifter'))
        })
    })

    describe('summerUtgifter', () => {
        it('summerer beløpene i alle utgiftene', () => {
            const utgifter: Utgift[] = [
                { utgift: 'Baller', beløp: 150, dato: '2026-11-01' },
                { utgift: 'Kaffe', beløp: 75, dato: '2026-11-05' },
                { utgift: 'Premie', beløp: 300, dato: '2026-11-10' },
            ]

            expect(summerUtgifter(utgifter)).toBe(525)
        })

        it('returnerer 0 for tom liste', () => {
            expect(summerUtgifter([])).toBe(0)
        })
    })
})
