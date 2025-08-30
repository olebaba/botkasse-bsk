import { describe, it, expect } from 'vitest'
import dayjs from './dayjs'
import { beregnSumForSesong, beregnSumMaaBetalesForSesong, beregnSumNyeBoterForSesong } from './botBeregning'
import { sorterSpillere } from './spillerSortering'
import type { Spiller } from './spillereService'
import type { Bot } from '@/app/api/boter/[spiller_id]/route'

// Hjelpefunksjon for å lage testdata
const lagTestBot = (belop: number, dato: string, erBetalt: boolean = false): Bot => ({
    id: Math.random().toString(),
    spillerId: '1',
    belop,
    dato: dayjs(dato),
    forseelseId: '1',
    erBetalt,
})

const lagTestSpiller = (navn: string, boter: Bot[]): Spiller => ({
    id: Math.random().toString(),
    navn,
    boter,
    visNavn: true,
})

describe('Spillersortering', () => {
    const testSpillere: Spiller[] = [
        lagTestSpiller('Charlie', [
            lagTestBot(100, '2024-01-15'),
            lagTestBot(200, '2024-02-15'),
            lagTestBot(50, '2024-03-15'),
        ]),
        lagTestSpiller('Alice', [lagTestBot(300, '2024-01-15'), lagTestBot(150, '2024-02-15')]),
        lagTestSpiller('Bob', [lagTestBot(75, '2024-01-15')]),
        lagTestSpiller('David', [
            lagTestBot(200, '2024-01-15'),
            lagTestBot(100, '2024-02-15'),
            lagTestBot(80, '2024-03-15'),
            lagTestBot(90, '2024-04-15'),
        ]),
    ]

    describe('Alfabetisk sortering', () => {
        it('skal sortere spillere alfabetisk stigende', () => {
            const sortert = sorterSpillere(testSpillere, 'alfabetisk', 'stigende')
            const navn = sortert.map((s) => s.navn)
            expect(navn).toEqual(['Alice', 'Bob', 'Charlie', 'David'])
        })

        it('skal sortere spillere alfabetisk synkende', () => {
            const sortert = sorterSpillere(testSpillere, 'alfabetisk', 'synkende')
            const navn = sortert.map((s) => s.navn)
            expect(navn).toEqual(['David', 'Charlie', 'Bob', 'Alice'])
        })
    })

    describe('Antall bøter sortering', () => {
        it('skal sortere etter antall bøter stigende', () => {
            const sortert = sorterSpillere(testSpillere, 'antall', 'stigende')
            const antall = sortert.map((s) => ({ navn: s.navn, antall: s.boter.length }))

            expect(antall[0].antall).toBe(1) // Bob
            expect(antall[1].antall).toBe(2) // Alice
            expect(antall[2].antall).toBe(3) // Charlie
            expect(antall[3].antall).toBe(4) // David
        })

        it('skal sortere etter antall bøter synkende', () => {
            const sortert = sorterSpillere(testSpillere, 'antall', 'synkende')
            const antall = sortert.map((s) => ({ navn: s.navn, antall: s.boter.length }))

            expect(antall[0].antall).toBe(4) // David
            expect(antall[1].antall).toBe(3) // Charlie
            expect(antall[2].antall).toBe(2) // Alice
            expect(antall[3].antall).toBe(1) // Bob
        })
    })

    describe('Sum sortering', () => {
        it('skal sortere etter total sum stigende', () => {
            const sortert = sorterSpillere(testSpillere, 'sum', 'stigende', true)
            const sums = sortert.map((s) => ({
                navn: s.navn,
                sum: beregnSumForSesong(s.boter, true),
            }))

            // Bob: 75, Charlie: 350, Alice: 450, David: 470
            expect(sums[0].navn).toBe('Bob')
            expect(sums[0].sum).toBe(75)
            expect(sums[3].navn).toBe('David')
            expect(sums[3].sum).toBe(470)
        })

        it('skal sortere etter total sum synkende', () => {
            const sortert = sorterSpillere(testSpillere, 'sum', 'synkende', true)
            const sums = sortert.map((s) => ({
                navn: s.navn,
                sum: beregnSumForSesong(s.boter, true),
            }))

            // David: 470, Alice: 450, Charlie: 350, Bob: 75
            expect(sums[0].navn).toBe('David')
            expect(sums[0].sum).toBe(470)
            expect(sums[3].navn).toBe('Bob')
            expect(sums[3].sum).toBe(75)
        })
    })

    describe('Datumbasert sortering', () => {
        it('skal sortere etter beløp som må betales', () => {
            const sortert = sorterSpillere(testSpillere, 'sumMaaBetales', 'stigende', true)
            const beloep = sortert.map((s) => ({
                navn: s.navn,
                maaBetales: beregnSumMaaBetalesForSesong(s.boter, true),
            }))

            // Verifiser at sorteringen er stigende
            for (let i = 1; i < beloep.length; i++) {
                expect(beloep[i].maaBetales).toBeGreaterThanOrEqual(beloep[i - 1].maaBetales)
            }
        })

        it('skal sortere etter nye bøter', () => {
            const sortert = sorterSpillere(testSpillere, 'sumNyeBoter', 'stigende', true)
            const nyeBoter = sortert.map((s) => ({
                navn: s.navn,
                nyeBoter: beregnSumNyeBoterForSesong(s.boter, true),
            }))

            // Verifiser at sorteringen er stigende
            for (let i = 1; i < nyeBoter.length; i++) {
                expect(nyeBoter[i].nyeBoter).toBeGreaterThanOrEqual(nyeBoter[i - 1].nyeBoter)
            }
        })
    })

    describe('Konsistens i sortering', () => {
        it('skal gi samme resultat ved gjentatte sorteringer', () => {
            const sortert1 = sorterSpillere(testSpillere, 'sum', 'stigende', true)
            const sortert2 = sorterSpillere(testSpillere, 'sum', 'stigende', true)

            expect(sortert1.map((s) => s.navn)).toEqual(sortert2.map((s) => s.navn))
        })

        it('skal invertere rekkefølgen når retning endres', () => {
            const stigende = sorterSpillere(testSpillere, 'antall', 'stigende')
            const synkende = sorterSpillere(testSpillere, 'antall', 'synkende')

            const navnStigende = stigende.map((s) => s.navn)
            const navnSynkende = synkende.map((s) => s.navn)

            expect(navnSynkende).toEqual(navnStigende.reverse())
        })

        it('skal håndtere alle sorteringstyper uten feil', () => {
            const sorteringstyper: Array<'alfabetisk' | 'antall' | 'sum' | 'sumMaaBetales' | 'sumNyeBoter'> = [
                'alfabetisk',
                'antall',
                'sum',
                'sumMaaBetales',
                'sumNyeBoter',
            ]

            sorteringstyper.forEach((type) => {
                expect(() => {
                    sorterSpillere(testSpillere, type, 'stigende', true)
                    sorterSpillere(testSpillere, type, 'synkende', true)
                }).not.toThrow()
            })
        })

        it('skal returnere korrekt antall spillere etter sortering', () => {
            const sortert = sorterSpillere(testSpillere, 'sum', 'stigende')
            expect(sortert).toHaveLength(testSpillere.length)
        })

        it('skal ikke mutere original array', () => {
            const original = [...testSpillere]
            sorterSpillere(testSpillere, 'sum', 'synkende')
            expect(testSpillere).toEqual(original)
        })
    })
})
