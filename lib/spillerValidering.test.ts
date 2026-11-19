import { describe, it, expect } from 'vitest'
import {
    MAKS_DRAKTNUMMER,
    MAKS_NAVN_LENGDE,
    finnSletteBlokkering,
    parseDraktnummerParam,
    sletteBlokkeringMelding,
    validerDraktnummer,
    validerNavn,
    validerNySpiller,
    validerSpillerOppdatering,
    validerSumOppdatering,
    validerVisNavn,
} from './spillerValidering'

const DRAKTNUMMER_FEIL = 'Draktnummer må være et positivt heltall.'
const NYTT_DRAKTNUMMER_FEIL = 'Nytt draktnummer må være et positivt heltall.'
const UGYLDIG_FORESPORSEL = 'Ugyldig forespørsel.'

describe('Konstanter', () => {
    it('har forventede grenseverdier', () => {
        expect(MAKS_DRAKTNUMMER).toBe(2147483647)
        expect(MAKS_NAVN_LENGDE).toBe(100)
    })
})

describe('validerDraktnummer', () => {
    it('godtar positivt heltall', () => {
        expect(validerDraktnummer(7)).toEqual({ ok: true, verdi: 7 })
    })

    it('godtar høyeste tillatte draktnummer', () => {
        expect(validerDraktnummer(MAKS_DRAKTNUMMER)).toEqual({ ok: true, verdi: MAKS_DRAKTNUMMER })
    })

    it.each([
        ['0', 0],
        ['-1', -1],
        ['1.5', 1.5],
        ["'7' (tekst)", '7'],
        ['NaN', NaN],
        ['2147483648', 2147483648],
        ['null', null],
        ['undefined', undefined],
        ['Infinity', Infinity],
        ['objekt', {}],
    ])('avviser %s', (_beskrivelse, verdi) => {
        expect(validerDraktnummer(verdi)).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })
})

describe('validerNavn', () => {
    it('returnerer trimmet navn', () => {
        expect(validerNavn(' Ola ')).toEqual({ ok: true, verdi: 'Ola' })
    })

    it('godtar navn på nøyaktig 100 tegn', () => {
        const navn = 'a'.repeat(100)
        expect(validerNavn(navn)).toEqual({ ok: true, verdi: navn })
    })

    it.each([
        ['tom streng', ''],
        ['bare mellomrom', '   '],
        ['ikke tekst (tall)', 5],
        ['null', null],
        ['undefined', undefined],
    ])('avviser %s med «Navn må fylles ut.»', (_beskrivelse, verdi) => {
        expect(validerNavn(verdi)).toEqual({ ok: false, feil: 'Navn må fylles ut.' })
    })

    it('avviser navn lengre enn 100 tegn', () => {
        expect(validerNavn('a'.repeat(101))).toEqual({
            ok: false,
            feil: 'Navn kan ikke være lengre enn 100 tegn.',
        })
    })

    it('teller lengde etter trimming', () => {
        const navn = `  ${'a'.repeat(100)}  `
        expect(validerNavn(navn)).toEqual({ ok: true, verdi: 'a'.repeat(100) })
    })
})

describe('validerVisNavn', () => {
    it('godtar true og false', () => {
        expect(validerVisNavn(true)).toEqual({ ok: true, verdi: true })
        expect(validerVisNavn(false)).toEqual({ ok: true, verdi: false })
    })

    it.each([
        ["'true' (tekst)", 'true'],
        ['1', 1],
        ['null', null],
        ['undefined', undefined],
    ])('avviser %s', (_beskrivelse, verdi) => {
        expect(validerVisNavn(verdi)).toEqual({ ok: false, feil: 'Vis spiller må være sann eller usann.' })
    })
})

describe('validerNySpiller', () => {
    it('godtar gyldig spiller og trimmer navn', () => {
        expect(validerNySpiller({ draktnummer: 7, navn: ' Ola ' })).toEqual({
            ok: true,
            verdi: { draktnummer: 7, navn: 'Ola' },
        })
    })

    it.each([
        ['null', null],
        ['tom liste', []],
        ['tekst', 'x'],
        ['tall', 5],
        ['undefined', undefined],
    ])('avviser %s som ugyldig forespørsel', (_beskrivelse, data) => {
        expect(validerNySpiller(data)).toEqual({ ok: false, feil: UGYLDIG_FORESPORSEL })
    })

    it('avviser draktnummer 0', () => {
        expect(validerNySpiller({ draktnummer: 0, navn: 'Ola' })).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })

    it('avviser draktnummer som tekst', () => {
        expect(validerNySpiller({ draktnummer: '7', navn: 'Ola' })).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })

    it('avviser manglende navn', () => {
        expect(validerNySpiller({ draktnummer: 7 })).toEqual({ ok: false, feil: 'Navn må fylles ut.' })
    })

    it('returnerer draktnummer-feil først når begge er ugyldige', () => {
        expect(validerNySpiller({ draktnummer: -1, navn: '' })).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })
})

describe('validerSpillerOppdatering', () => {
    it('godtar gyldig oppdatering og trimmer navn', () => {
        expect(validerSpillerOppdatering({ spiller_id: 7, navn: ' Ola ', visNavn: false })).toEqual({
            ok: true,
            verdi: { spillerId: 7, navn: 'Ola', visNavn: false },
        })
    })

    it.each([
        ['null', null],
        ['tom liste', []],
        ['tekst', 'x'],
    ])('avviser %s som ugyldig forespørsel', (_beskrivelse, data) => {
        expect(validerSpillerOppdatering(data)).toEqual({ ok: false, feil: UGYLDIG_FORESPORSEL })
    })

    it('avviser spiller_id som tekst', () => {
        expect(validerSpillerOppdatering({ spiller_id: '7', navn: 'Ola', visNavn: true })).toEqual({
            ok: false,
            feil: DRAKTNUMMER_FEIL,
        })
    })

    it('avviser manglende spiller_id', () => {
        expect(validerSpillerOppdatering({ navn: 'Ola', visNavn: true })).toEqual({
            ok: false,
            feil: DRAKTNUMMER_FEIL,
        })
    })

    it('avviser tomt navn', () => {
        expect(validerSpillerOppdatering({ spiller_id: 7, navn: '  ', visNavn: true })).toEqual({
            ok: false,
            feil: 'Navn må fylles ut.',
        })
    })

    it('avviser manglende visNavn', () => {
        expect(validerSpillerOppdatering({ spiller_id: 7, navn: 'Ola' })).toEqual({
            ok: false,
            feil: 'Vis spiller må være sann eller usann.',
        })
    })

    it("avviser visNavn som 'true'", () => {
        expect(validerSpillerOppdatering({ spiller_id: 7, navn: 'Ola', visNavn: 'true' })).toEqual({
            ok: false,
            feil: 'Vis spiller må være sann eller usann.',
        })
    })

    it('returnerer feil i rekkefølgen spiller_id, navn, visNavn', () => {
        expect(validerSpillerOppdatering({ spiller_id: 0, navn: '', visNavn: 'x' })).toEqual({
            ok: false,
            feil: DRAKTNUMMER_FEIL,
        })
        expect(validerSpillerOppdatering({ spiller_id: 7, navn: '', visNavn: 'x' })).toEqual({
            ok: false,
            feil: 'Navn må fylles ut.',
        })
    })

    describe('nyttDraktnummer', () => {
        const gyldig = { spiller_id: 7, navn: 'Ola', visNavn: true }

        it('beholder nyttDraktnummer når det er et annet tall enn spiller_id', () => {
            expect(validerSpillerOppdatering({ ...gyldig, nyttDraktnummer: 70 })).toStrictEqual({
                ok: true,
                verdi: { spillerId: 7, navn: 'Ola', visNavn: true, nyttDraktnummer: 70 },
            })
        })

        it('utelater nyttDraktnummer når det er likt spiller_id', () => {
            expect(validerSpillerOppdatering({ ...gyldig, nyttDraktnummer: 7 })).toStrictEqual({
                ok: true,
                verdi: { spillerId: 7, navn: 'Ola', visNavn: true },
            })
        })

        it('utelater nyttDraktnummer når det ikke er oppgitt', () => {
            expect(validerSpillerOppdatering(gyldig)).toStrictEqual({
                ok: true,
                verdi: { spillerId: 7, navn: 'Ola', visNavn: true },
            })
        })

        it('godtar høyeste tillatte draktnummer', () => {
            expect(validerSpillerOppdatering({ ...gyldig, nyttDraktnummer: MAKS_DRAKTNUMMER })).toStrictEqual({
                ok: true,
                verdi: { spillerId: 7, navn: 'Ola', visNavn: true, nyttDraktnummer: MAKS_DRAKTNUMMER },
            })
        })

        it.each([
            ['0', 0],
            ['-1', -1],
            ['1.5', 1.5],
            ["'70' (tekst)", '70'],
            ['NaN', NaN],
            ['2147483648', 2147483648],
            ['null', null],
            ['Infinity', Infinity],
            ['objekt', {}],
        ])('avviser nyttDraktnummer %s', (_beskrivelse, verdi) => {
            expect(validerSpillerOppdatering({ ...gyldig, nyttDraktnummer: verdi })).toEqual({
                ok: false,
                feil: NYTT_DRAKTNUMMER_FEIL,
            })
        })

        it('returnerer feil for nyttDraktnummer etter spiller_id, navn og visNavn', () => {
            expect(validerSpillerOppdatering({ spiller_id: 7, navn: '', visNavn: true, nyttDraktnummer: 0 })).toEqual({
                ok: false,
                feil: 'Navn må fylles ut.',
            })
            expect(validerSpillerOppdatering({ spiller_id: 7, navn: 'Ola', nyttDraktnummer: 0 })).toEqual({
                ok: false,
                feil: 'Vis spiller må være sann eller usann.',
            })
        })
    })
})

describe('parseDraktnummerParam', () => {
    it('parser gyldig tall', () => {
        expect(parseDraktnummerParam('12')).toEqual({ ok: true, verdi: 12 })
    })

    it.each([
        ['12abc', '12abc'],
        ['tom streng', ''],
        ['null', null],
        ['0', '0'],
        ['1.5', '1.5'],
        ['-3', '-3'],
        ['2147483648', '2147483648'],
    ])('avviser %s', (_beskrivelse, verdi) => {
        expect(parseDraktnummerParam(verdi)).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })
})

describe('finnSletteBlokkering', () => {
    it('returnerer null når spilleren verken har bøter eller bruker', () => {
        expect(finnSletteBlokkering(0, false)).toBeNull()
    })

    it("returnerer 'har_boter' når spilleren har bøter", () => {
        expect(finnSletteBlokkering(2, false)).toBe('har_boter')
    })

    it("prioriterer 'har_boter' foran 'har_bruker'", () => {
        expect(finnSletteBlokkering(2, true)).toBe('har_boter')
    })

    it("returnerer 'har_bruker' når spilleren bare har bruker", () => {
        expect(finnSletteBlokkering(0, true)).toBe('har_bruker')
    })
})

describe('sletteBlokkeringMelding', () => {
    it('har norske meldinger for begge blokkeringer', () => {
        expect(sletteBlokkeringMelding.har_boter).toBe(
            'Spilleren har bøter og kan ikke slettes. Skjul spilleren i stedet.',
        )
        expect(sletteBlokkeringMelding.har_bruker).toBe('Spilleren er koblet til en brukerkonto og kan ikke slettes.')
    })
})

describe('validerSumOppdatering', () => {
    const gyldig = { spiller_id: 7, totalSum: 150, erBetalt: false }

    it('godtar gyldig input', () => {
        expect(validerSumOppdatering(gyldig)).toEqual({
            ok: true,
            verdi: { spillerId: 7, totalSum: 150, erBetalt: false },
        })
    })

    it('avviser det som ikke er et objekt', () => {
        expect(validerSumOppdatering(null)).toEqual({ ok: false, feil: UGYLDIG_FORESPORSEL })
        expect(validerSumOppdatering([])).toEqual({ ok: false, feil: UGYLDIG_FORESPORSEL })
    })

    it('avviser ugyldig draktnummer', () => {
        expect(validerSumOppdatering({ ...gyldig, spiller_id: 0 })).toEqual({ ok: false, feil: DRAKTNUMMER_FEIL })
    })

    it.each([undefined, '150', NaN, Infinity])('avviser totalsum %s', (totalSum) => {
        expect(validerSumOppdatering({ ...gyldig, totalSum })).toEqual({ ok: false, feil: 'Totalsum må være et tall.' })
    })

    it('avviser betalingsstatus som ikke er boolsk', () => {
        expect(validerSumOppdatering({ ...gyldig, erBetalt: 'false' })).toEqual({
            ok: false,
            feil: 'Betalingsstatus må være sann eller usann.',
        })
    })
})
