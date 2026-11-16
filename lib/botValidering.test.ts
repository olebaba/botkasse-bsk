import { describe, it, expect } from 'vitest'
import {
    MAKS_ANTALL_BOTER,
    MAKS_BELOP,
    MAKS_KOMMENTAR_LENGDE,
    validerBelop,
    validerBetalingsEndring,
    validerDato,
    validerForseelsesId,
    validerKommentar,
    validerNyBot,
} from './botValidering'
import dayjs from './dayjs'

describe('validerBelop', () => {
    it.each([1, 12.5, MAKS_BELOP])('godtar %s', (belop) => {
        expect(validerBelop(belop)).toEqual({ ok: true, verdi: belop })
    })

    it.each([0, -5, NaN, Infinity, MAKS_BELOP + 1, '50', null, undefined])('avviser %s', (belop) => {
        expect(validerBelop(belop)).toEqual({ ok: false, feil: 'Beløp må være et positivt tall.' })
    })
})

describe('validerDato', () => {
    it('godtar en gyldig dato', () => {
        const dato = dayjs().format('YYYY-MM-DD')
        expect(validerDato(dato)).toEqual({ ok: true, verdi: dato })
    })

    it.each(['2024-02-30', '2024-13-01', '01.02.2024', '2024-2-1', '', 'i dag', 20240201, null])(
        'avviser %s',
        (dato) => {
            expect(validerDato(dato).ok).toBe(false)
        },
    )
})

describe('validerForseelsesId', () => {
    it.each([
        [3, 3],
        ['3', 3],
    ])('godtar %s', (id, forventet) => {
        expect(validerForseelsesId(id)).toEqual({ ok: true, verdi: forventet })
    })

    it.each([0, -1, 1.5, '1.5', '', 'abc', NaN, 2147483648, null, undefined])('avviser %s', (id) => {
        expect(validerForseelsesId(id)).toEqual({ ok: false, feil: 'Forseelse må være et heltall.' })
    })
})

describe('validerKommentar', () => {
    it('gir null når kommentar mangler eller er tom', () => {
        expect(validerKommentar(undefined)).toEqual({ ok: true, verdi: null })
        expect(validerKommentar(null)).toEqual({ ok: true, verdi: null })
        expect(validerKommentar('   ')).toEqual({ ok: true, verdi: null })
    })

    it('trimmer kommentaren', () => {
        expect(validerKommentar('  for sent  ')).toEqual({ ok: true, verdi: 'for sent' })
    })

    it('avviser kommentar som ikke er tekst eller er for lang', () => {
        expect(validerKommentar(5).ok).toBe(false)
        expect(validerKommentar('a'.repeat(MAKS_KOMMENTAR_LENGDE + 1)).ok).toBe(false)
    })
})

describe('validerNyBot', () => {
    const gyldig = { beløp: 50, dato: '2024-09-01', forseelsesId: '2', kommentar: 'for sent' }

    it('godtar gyldig input', () => {
        expect(validerNyBot('7', gyldig)).toEqual({
            ok: true,
            verdi: { spillerId: 7, belop: 50, dato: '2024-09-01', forseelsesId: 2, kommentar: 'for sent' },
        })
    })

    it('avviser det som ikke er et objekt', () => {
        expect(validerNyBot('7', null)).toEqual({ ok: false, feil: 'Ugyldig forespørsel.' })
        expect(validerNyBot('7', [])).toEqual({ ok: false, feil: 'Ugyldig forespørsel.' })
    })

    it('avviser ugyldig spiller-id', () => {
        expect(validerNyBot('abc', gyldig)).toEqual({ ok: false, feil: 'Draktnummer må være et positivt heltall.' })
    })

    it.each([{ beløp: 0 }, { dato: '2024-02-30' }, { forseelsesId: 'x' }, { kommentar: 1 }])(
        'avviser ugyldig felt %o',
        (endring) => {
            expect(validerNyBot('7', { ...gyldig, ...endring }).ok).toBe(false)
        },
    )
})

describe('validerBetalingsEndring', () => {
    it('godtar id-er som tall og tekst, og fjerner duplikater', () => {
        expect(validerBetalingsEndring({ botIder: ['1', 2, '1'], erBetalt: true })).toEqual({
            ok: true,
            verdi: { botIder: [1, 2], erBetalt: true },
        })
    })

    it('avviser det som ikke er et objekt', () => {
        expect(validerBetalingsEndring('x')).toEqual({ ok: false, feil: 'Ugyldig forespørsel.' })
    })

    it.each([undefined, 'abc', [], {}])('avviser botIder %o', (botIder) => {
        expect(validerBetalingsEndring({ botIder, erBetalt: true })).toEqual({ ok: false, feil: 'Ingen bøter valgt.' })
    })

    it.each([['abc'], [1.5], [null], [-1], ['1; DROP TABLE bøter']])('avviser ugyldig bot-id %o', (id) => {
        expect(validerBetalingsEndring({ botIder: [1, id], erBetalt: true })).toEqual({
            ok: false,
            feil: 'Bot-id må være et heltall.',
        })
    })

    it('avviser for mange bøter', () => {
        const botIder = Array.from({ length: MAKS_ANTALL_BOTER + 1 }, (_, i) => i + 1)
        expect(validerBetalingsEndring({ botIder, erBetalt: true }).ok).toBe(false)
    })

    it.each([undefined, 'true', 1, null])('avviser erBetalt %o', (erBetalt) => {
        expect(validerBetalingsEndring({ botIder: [1], erBetalt })).toEqual({
            ok: false,
            feil: 'Betalingsstatus må være sann eller usann.',
        })
    })
})
