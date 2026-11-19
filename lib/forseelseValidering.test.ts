import { describe, it, expect } from 'vitest'
import { MAKS_FORSEELSE_NAVN_LENGDE, validerNyForseelse } from './forseelseValidering'

describe('validerNyForseelse', () => {
    it('godtar gyldig input og trimmer navnet', () => {
        expect(validerNyForseelse({ type: '  For sent  ', standard_belop: 50 })).toEqual({
            ok: true,
            verdi: { navn: 'For sent', belop: 50 },
        })
    })

    it('avviser det som ikke er et objekt', () => {
        expect(validerNyForseelse(null)).toEqual({ ok: false, feil: 'Ugyldig forespørsel.' })
        expect(validerNyForseelse([])).toEqual({ ok: false, feil: 'Ugyldig forespørsel.' })
    })

    it.each([undefined, '', '   ', 5])('avviser navn %o', (type) => {
        expect(validerNyForseelse({ type, standard_belop: 50 })).toEqual({ ok: false, feil: 'Navn må fylles ut.' })
    })

    it('avviser for langt navn', () => {
        const resultat = validerNyForseelse({ type: 'a'.repeat(MAKS_FORSEELSE_NAVN_LENGDE + 1), standard_belop: 50 })
        expect(resultat.ok).toBe(false)
    })

    it.each([undefined, 0, -10, '50', NaN])('avviser beløp %o', (standard_belop) => {
        expect(validerNyForseelse({ type: 'For sent', standard_belop }).ok).toBe(false)
    })
})
