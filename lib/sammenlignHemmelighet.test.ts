import { describe, it, expect } from 'vitest'
import { erLikHemmelighet } from '@/lib/sammenlignHemmelighet.ts'

describe('erLikHemmelighet', () => {
    it('returnerer true ved lik verdi', () => {
        expect(erLikHemmelighet('hemmelig', 'hemmelig')).toBe(true)
    })

    it('returnerer false ved ulik verdi med samme lengde', () => {
        expect(erLikHemmelighet('hemmeliG', 'hemmelig')).toBe(false)
    })

    it('returnerer false ved ulik lengde', () => {
        expect(erLikHemmelighet('hemmelig', 'hemmelig!')).toBe(false)
        expect(erLikHemmelighet('hemmelig!', 'hemmelig')).toBe(false)
    })

    it('returnerer false når hemmeligheten mangler eller er tom', () => {
        expect(erLikHemmelighet('', '')).toBe(false)
        expect(erLikHemmelighet('', 'hemmelig')).toBe(false)
        expect(erLikHemmelighet('hemmelig', '')).toBe(false)
        expect(erLikHemmelighet('hemmelig', undefined)).toBe(false)
    })
})
