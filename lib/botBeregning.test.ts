import { describe, it, expect, beforeEach, vi } from 'vitest'
import dayjs from 'dayjs'
import type { Bot } from '@/app/api/boter/[spiller_id]/route'
import {
    hentGjeldendeSesongStart,
    hentGjeldendeSesongSlutt,
    hentSesongTekst,
    erISesong,
    filtrerBoterForSesong,
    beregnSumMaaBetales,
    beregnSumNyeBoter,
    beregnSum,
    beregnSumBetalt,
    beregnSumMaaBetalesForSesong,
    beregnSumNyeBoterForSesong,
    beregnSumForSesong,
    beregnSumBetaltForSesong,
    beregnSumMaaBetalesForSpesifikkSesong,
    beregnBelopForSesongvalg,
    hentTilgjengeligeSesonger,
    filtrerBoterForSpesifikkSesong,
} from '@/lib/botBeregning'

describe('botBeregning', () => {
    // Mock data for testing
    const opprettTestBot = (id: string, belop: number, dato: string, erBetalt: boolean = false): Bot => ({
        id,
        spillerId: '1',
        belop,
        dato: dayjs(dato),
        forseelseId: '1',
        erBetalt,
    })

    // Test data - Med dagens dato 25. august 2025 er gjeldende sesong 2025/2026
    const testBoter: Bot[] = [
        // Gjeldende sesong (2025/2026) - betalt
        opprettTestBot('1', 100, '2025-08-15', true),

        // Gjeldende sesong - forrige måned (skal betales)
        opprettTestBot('2', 200, '2025-07-10', false), // Juli - før forrige måned (skal betales)

        // Gjeldende sesong - denne måneden (nye bøter)
        opprettTestBot('3', 300, '2025-08-10', false),
        opprettTestBot('4', 175, '2025-08-20', false),

        // Forrige sesong (2024/2025)
        opprettTestBot('5', 400, '2024-10-15', false),
        opprettTestBot('6', 125, '2025-05-20', true),
        opprettTestBot('7', 250, '2025-06-15', false),

        // Eldre sesong (2023/2024)
        opprettTestBot('8', 350, '2023-12-10', false),
    ]

    beforeEach(() => {
        // Mock dagens dato til 25. august 2025
        vi.setSystemTime(new Date('2025-08-25'))
    })

    describe('sesongberegninger', () => {
        it('skal beregne riktig sesongstart for gjeldende sesong', () => {
            const sesongStart = hentGjeldendeSesongStart()
            expect(sesongStart.year()).toBe(2025)
            expect(sesongStart.month()).toBe(7) // August (0-indeksert)
            expect(sesongStart.date()).toBe(1)
        })

        it('skal beregne riktig sesongslutt for gjeldende sesong', () => {
            const sesongSlutt = hentGjeldendeSesongSlutt()
            expect(sesongSlutt.year()).toBe(2026)
            expect(sesongSlutt.month()).toBe(6) // Juli (0-indeksert)
            expect(sesongSlutt.date()).toBe(31)
        })

        it('skal generere riktig sesongtekst', () => {
            const sesongTekst = hentSesongTekst()
            expect(sesongTekst).toBe('2025/2026')
        })

        it('skal identifisere om dato er i sesong', () => {
            const datoISesong = dayjs('2025-10-15') // Gjeldende sesong
            const datoUtenforSesong = dayjs('2025-07-15') // Forrige sesong

            expect(erISesong(datoISesong)).toBe(true)
            expect(erISesong(datoUtenforSesong)).toBe(false)
        })
    })

    describe('filtering av bøter', () => {
        it('skal filtrere bøter for gjeldende sesong', () => {
            const filtrerteBøter = filtrerBoterForSesong(testBoter, false)

            // Skal inneholde bøter fra august 2025 til juli 2026 (bot 1, 3, 4) - bot 2 er fra juli som er forrige sesong
            expect(filtrerteBøter).toHaveLength(3)
            expect(filtrerteBøter.map((b) => b.id).sort()).toEqual(['1', '3', '4'])
        })

        it('skal returnere alle bøter når visAlleSesonger er true', () => {
            const filtrerteBøter = filtrerBoterForSesong(testBoter, true)
            expect(filtrerteBøter).toHaveLength(testBoter.length)
        })

        it('skal filtrere bøter for spesifikk sesong', () => {
            const filtrerteBøter = filtrerBoterForSpesifikkSesong(testBoter, '2024/2025')

            // Skal inneholde bøter fra august 2024 til juli 2025 (bot 5, 6, 7, 2)
            expect(filtrerteBøter).toHaveLength(4)
            expect(filtrerteBøter.map((b) => b.id).sort()).toEqual(['2', '5', '6', '7'])
        })
    })

    describe('grunnleggende beregninger', () => {
        it('skal beregne sum som må betales (ubetalte bøter før forrige måned)', () => {
            const sum = beregnSumMaaBetales(testBoter)

            // Skal inkludere bot 2 (200), 5 (400), 7 (250), 8 (350)
            // Bot 1 og 6 er betalt, bot 3 og 4 er fra denne måneden
            expect(sum).toBe(1200)
        })

        it('skal beregne sum av nye bøter (ubetalte bøter fra denne måneden)', () => {
            const sum = beregnSumNyeBoter(testBoter)

            // Skal inkludere bot 3 (300) og 4 (175) - begge fra august 2025
            expect(sum).toBe(475)
        })

        it('skal beregne total sum av alle bøter', () => {
            const sum = beregnSum(testBoter)

            // Sum av alle bøter: 100+200+300+175+400+125+250+350 = 1900
            expect(sum).toBe(1900)
        })

        it('skal beregne sum av betalte bøter', () => {
            const sum = beregnSumBetalt(testBoter)

            // Skal inkludere bot 1 (100) og 6 (125)
            expect(sum).toBe(225)
        })
    })

    describe('sesongavhengige beregninger', () => {
        it('skal beregne sum som må betales for gjeldende sesong', () => {
            const sum = beregnSumMaaBetalesForSesong(testBoter, false)

            // Fra gjeldende sesong: ingen bøter skal betales (bot 1 er betalt, bot 3 og 4 er fra denne måneden)
            expect(sum).toBe(0)
        })

        it('skal beregne sum av nye bøter for gjeldende sesong', () => {
            const sum = beregnSumNyeBoterForSesong(testBoter, false)

            // Fra gjeldende sesong denne måneden: bot 3 (300), 4 (175)
            expect(sum).toBe(475)
        })

        it('skal beregne total sum for gjeldende sesong', () => {
            const sum = beregnSumForSesong(testBoter, false)

            // Fra gjeldende sesong: 100+300+175 = 575 (bot 2 er ikke i gjeldende sesong)
            expect(sum).toBe(575)
        })

        it('skal beregne sum betalt for gjeldende sesong', () => {
            const sum = beregnSumBetaltForSesong(testBoter, false)

            // Fra gjeldende sesong: bot 1 (100)
            expect(sum).toBe(100)
        })

        it('skal beregne sum som må betales for alle sesonger', () => {
            const sum = beregnSumMaaBetalesForSesong(testBoter, true)

            // Alle ubetalte bøter før forrige måned
            expect(sum).toBe(1200)
        })
    })

    describe('spesifikk sesong beregninger', () => {
        it('skal beregne sum som må betales for spesifikk sesong', () => {
            const sum = beregnSumMaaBetalesForSpesifikkSesong(testBoter, '2024/2025')

            // Fra 2024/2025 sesong: bot 5 (400), 7 (250), 2 (200) - bot 6 er betalt
            expect(sum).toBe(850)
        })
    })

    describe('fleksibel sesongvalg funksjon', () => {
        it('skal beregne for alle sesonger når visAlleSesonger er true', () => {
            const sum = beregnBelopForSesongvalg(testBoter, true, '')
            expect(sum).toBe(1200) // Alle ubetalte før forrige måned
        })

        it('skal beregne for alle sesonger når valgtSesong er "alle"', () => {
            const sum = beregnBelopForSesongvalg(testBoter, false, 'alle')
            expect(sum).toBe(1200)
        })

        it('skal beregne for gjeldende sesong når valgtSesong er tom', () => {
            const sum = beregnBelopForSesongvalg(testBoter, false, '')
            expect(sum).toBe(0) // Kun gjeldende sesong - ingen bøter å betale
        })

        it('skal beregne for spesifikk sesong', () => {
            const sum = beregnBelopForSesongvalg(testBoter, false, '2024/2025')
            expect(sum).toBe(850)
        })
    })

    describe('tilgjengelige sesonger', () => {
        it('skal returnere sorterte tilgjengelige sesonger', () => {
            const sesonger = hentTilgjengeligeSesonger(testBoter)

            expect(sesonger).toEqual(['2025/2026', '2024/2025', '2023/2024'])
        })

        it('skal returnere tom array for tomme bøter', () => {
            const sesonger = hentTilgjengeligeSesonger([])
            expect(sesonger).toEqual([])
        })

        it('skal håndtere bøter fra forskjellige måneder riktig', () => {
            const testBoterForSesonger: Bot[] = [
                opprettTestBot('1', 100, '2024-07-31', false), // Forrige sesong
                opprettTestBot('2', 200, '2024-08-01', false), // 2024/2025 sesong
                opprettTestBot('3', 300, '2025-07-31', false), // 2024/2025 sesong
                opprettTestBot('4', 400, '2025-08-01', false), // 2025/2026 sesong
            ]

            const sesonger = hentTilgjengeligeSesonger(testBoterForSesonger)
            expect(sesonger).toEqual(['2025/2026', '2024/2025', '2023/2024'])
        })
    })

    describe('edge cases', () => {
        it('skal håndtere tomme bøter arrays', () => {
            expect(beregnSum([])).toBe(0)
            expect(beregnSumBetalt([])).toBe(0)
            expect(beregnSumMaaBetales([])).toBe(0)
            expect(beregnSumNyeBoter([])).toBe(0)
        })

        it('skal håndtere kun betalte bøter', () => {
            const betalteBoter = testBoter.map((bot) => ({ ...bot, erBetalt: true }))

            expect(beregnSumMaaBetales(betalteBoter)).toBe(0)
            expect(beregnSumNyeBoter(betalteBoter)).toBe(0)
            expect(beregnSumBetalt(betalteBoter)).toBe(1900) // Total sum of all test data
        })

        it('skal håndtere bøter fra fremtiden', () => {
            const fremtidsBøter: Bot[] = [
                opprettTestBot('future1', 500, '2026-01-01', false),
                opprettTestBot('future2', 600, '2026-12-31', false),
            ]

            // Fremtidige bøter skal telles som nye bøter
            expect(beregnSumNyeBoter(fremtidsBøter)).toBe(1100)
            expect(beregnSumMaaBetales(fremtidsBøter)).toBe(0)
        })
    })

    describe('månedsgrense logikk', () => {
        it('skal skille mellom bøter fra forrige måned og denne måneden', () => {
            vi.setSystemTime(new Date('2025-08-25')) // 25. august 2025

            const månedsBoter: Bot[] = [
                opprettTestBot('1', 100, '2025-07-31', false), // Forrige måned - skal betales
                opprettTestBot('2', 200, '2025-08-01', false), // Denne måneden - nye bøter
                opprettTestBot('3', 300, '2025-08-25', false), // I dag - nye bøter
            ]

            expect(beregnSumMaaBetales(månedsBoter)).toBe(100)
            expect(beregnSumNyeBoter(månedsBoter)).toBe(500)
        })
    })
})
