import { describe, it, expect } from 'vitest'
import dayjs from './dayjs'
import { fjernSpillerFraListe, leggTilSpillerIListe, oppdaterSpillerIListe } from './spillerListe'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

const lagTestBot = (id: string, spillerId: string, belop: number): Bot => ({
    id,
    spillerId,
    belop,
    dato: dayjs('2024-01-15'),
    forseelseId: '1',
    erBetalt: false,
})

const lagTestSpiller = (id: string, navn: string, boter: Bot[] = []): Spiller => ({
    id,
    draktnummer: Number(id),
    navn,
    boter,
    visNavn: true,
})

describe('leggTilSpillerIListe', () => {
    it('legger til ny spiller på slutten uten å mutere input', () => {
        const spillere = [lagTestSpiller('1', 'Ola'), lagTestSpiller('2', 'Kari')]
        const ny = lagTestSpiller('3', 'Per')

        const resultat = leggTilSpillerIListe(spillere, ny)

        expect(resultat).toEqual([spillere[0], spillere[1], ny])
        expect(resultat).not.toBe(spillere)
        expect(spillere).toHaveLength(2)
    })

    it('ignorerer spiller med id som allerede finnes og returnerer samme liste', () => {
        const spillere = [lagTestSpiller('1', 'Ola'), lagTestSpiller('2', 'Kari')]

        const resultat = leggTilSpillerIListe(spillere, lagTestSpiller('2', 'Duplikat'))

        expect(resultat).toBe(spillere)
        expect(resultat).toHaveLength(2)
        expect(resultat[1].navn).toBe('Kari')
    })

    it('legger til i tom liste', () => {
        const ny = lagTestSpiller('7', 'Ola')

        expect(leggTilSpillerIListe([], ny)).toEqual([ny])
    })
})

describe('oppdaterSpillerIListe', () => {
    it('endrer navn og visNavn og beholder bøtene', () => {
        const boter = [lagTestBot('b1', '1', 100), lagTestBot('b2', '1', 50)]
        const spillere = [lagTestSpiller('1', 'Ola', boter), lagTestSpiller('2', 'Kari')]
        const oppdatert: Spiller = { ...lagTestSpiller('1', 'Ola Nordmann'), visNavn: false, boter: [] }

        const resultat = oppdaterSpillerIListe(spillere, '1', oppdatert)

        expect(resultat[0].navn).toBe('Ola Nordmann')
        expect(resultat[0].visNavn).toBe(false)
        expect(resultat[0].id).toBe('1')
        expect(resultat[0].boter).toHaveLength(boter.length)
        expect(resultat[0].boter.map((bot) => bot.id)).toEqual(['b1', 'b2'])
    })

    it('endrer draktnummer fra 7 til 70 og flytter bøtene til ny spillerId', () => {
        const boter = [lagTestBot('b1', '7', 100), lagTestBot('b2', '7', 50), lagTestBot('b3', '7', 25)]
        const spillere = [lagTestSpiller('7', 'Ola', boter), lagTestSpiller('2', 'Kari')]
        const oppdatert: Spiller = { ...lagTestSpiller('70', 'Ola'), boter: [] }

        const resultat = oppdaterSpillerIListe(spillere, '7', oppdatert)

        expect(resultat[0].id).toBe('70')
        expect(resultat[0].draktnummer).toBe(70)
        expect(resultat[0].boter).toHaveLength(3)
        expect(resultat[0].boter.every((bot) => bot.spillerId === '70')).toBe(true)
        expect(resultat[0].boter.map((bot) => bot.belop)).toEqual([100, 50, 25])
    })

    it('beholder samme objektreferanse for andre spillere', () => {
        const spillere = [lagTestSpiller('1', 'Ola', [lagTestBot('b1', '1', 100)]), lagTestSpiller('2', 'Kari')]
        const oppdatert: Spiller = { ...lagTestSpiller('10', 'Ola'), boter: [] }

        const resultat = oppdaterSpillerIListe(spillere, '1', oppdatert)

        expect(resultat[1]).toBe(spillere[1])
        expect(resultat).toHaveLength(2)
    })

    it('muterer ikke input', () => {
        const boter = [lagTestBot('b1', '7', 100)]
        const spillere = [lagTestSpiller('7', 'Ola', boter), lagTestSpiller('2', 'Kari')]
        const snapshot = structuredClone(spillere)
        const originalSpiller = spillere[0]
        const originalBot = boter[0]
        const oppdatert: Spiller = { ...lagTestSpiller('70', 'Nytt navn'), boter: [] }

        const resultat = oppdaterSpillerIListe(spillere, '7', oppdatert)

        expect(resultat).not.toBe(spillere)
        expect(spillere).toEqual(snapshot)
        expect(spillere[0]).toBe(originalSpiller)
        expect(spillere[0].boter[0]).toBe(originalBot)
        expect(originalBot.spillerId).toBe('7')
    })

    it('lar listen være uendret i innhold når gammelId ikke finnes', () => {
        const spillere = [lagTestSpiller('1', 'Ola'), lagTestSpiller('2', 'Kari')]

        const resultat = oppdaterSpillerIListe(spillere, '99', lagTestSpiller('99', 'Ukjent'))

        expect(resultat).toEqual(spillere)
        expect(resultat[0]).toBe(spillere[0])
        expect(resultat[1]).toBe(spillere[1])
    })
})

describe('fjernSpillerFraListe', () => {
    it('fjerner spilleren med gitt id', () => {
        const spillere = [lagTestSpiller('1', 'Ola'), lagTestSpiller('2', 'Kari'), lagTestSpiller('3', 'Per')]

        const resultat = fjernSpillerFraListe(spillere, '2')

        expect(resultat.map((spiller) => spiller.id)).toEqual(['1', '3'])
        expect(resultat[0]).toBe(spillere[0])
        expect(resultat[1]).toBe(spillere[2])
    })

    it('muterer ikke input', () => {
        const spillere = [lagTestSpiller('1', 'Ola'), lagTestSpiller('2', 'Kari')]
        const snapshot = structuredClone(spillere)

        const resultat = fjernSpillerFraListe(spillere, '1')

        expect(resultat).not.toBe(spillere)
        expect(spillere).toHaveLength(2)
        expect(spillere).toEqual(snapshot)
    })

    it('returnerer uendret innhold når id ikke finnes', () => {
        const spillere = [lagTestSpiller('1', 'Ola')]

        expect(fjernSpillerFraListe(spillere, '99')).toEqual(spillere)
    })
})
