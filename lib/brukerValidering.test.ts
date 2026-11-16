import { describe, it, expect } from 'vitest'
import { validerMobilnummer, validerProfilOppdatering } from '@/lib/brukerValidering.ts'

describe('validerMobilnummer', () => {
    it('godtar 5 til 13 siffer', () => {
        expect(validerMobilnummer('12345')).toEqual({ ok: true, verdi: '12345' })
        expect(validerMobilnummer('1234567890123')).toEqual({ ok: true, verdi: '1234567890123' })
    })

    it('trimmer mellomrom rundt nummeret', () => {
        expect(validerMobilnummer(' 91234567 ')).toEqual({ ok: true, verdi: '91234567' })
    })

    it.each(['1234', '12345678901234', '9123 4567', '+4791234567', '9123456a', '', null, 91234567])(
        'avviser %j',
        (verdi) => {
            expect(validerMobilnummer(verdi).ok).toBe(false)
        },
    )
})

describe('validerProfilOppdatering', () => {
    it('godtar navn og mobilnummer', () => {
        expect(validerProfilOppdatering({ navn: ' Ola ', mobilnummer: '91234567' })).toEqual({
            ok: true,
            verdi: { navn: 'Ola', mobilnummer: '91234567' },
        })
    })

    it('behandler tomme og manglende felt som uendret', () => {
        expect(validerProfilOppdatering({ navn: '', mobilnummer: null })).toEqual({
            ok: true,
            verdi: { navn: null, mobilnummer: null },
        })
    })

    it('avviser for langt navn', () => {
        expect(validerProfilOppdatering({ navn: 'a'.repeat(101), mobilnummer: '' }).ok).toBe(false)
    })

    it('avviser navn som bare er mellomrom', () => {
        expect(validerProfilOppdatering({ navn: '   ', mobilnummer: '' }).ok).toBe(false)
    })

    it('avviser ugyldig mobilnummer', () => {
        expect(validerProfilOppdatering({ navn: 'Ola', mobilnummer: '12ab' }).ok).toBe(false)
    })

    it('avviser filer i stedet for tekst', () => {
        expect(validerProfilOppdatering({ navn: new Blob(['x']), mobilnummer: '' }).ok).toBe(false)
    })
})
