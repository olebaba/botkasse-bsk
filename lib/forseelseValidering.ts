import { validerBelop } from '@/lib/botValidering.ts'
import type { Valideringsresultat } from '@/lib/spillerValidering.ts'

export const MAKS_FORSEELSE_NAVN_LENGDE = 100

export type NyForseelse = { navn: string; belop: number }

export const validerNyForseelse = (data: unknown): Valideringsresultat<NyForseelse> => {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return { ok: false, feil: 'Ugyldig forespørsel.' }
    }
    const { type, standard_belop } = data as Record<string, unknown>

    const navn = typeof type === 'string' ? type.trim() : ''
    if (navn === '') {
        return { ok: false, feil: 'Navn må fylles ut.' }
    }
    if (navn.length > MAKS_FORSEELSE_NAVN_LENGDE) {
        return { ok: false, feil: `Navn kan ikke være lengre enn ${MAKS_FORSEELSE_NAVN_LENGDE} tegn.` }
    }

    const belop = validerBelop(standard_belop)
    if (!belop.ok) return belop

    return { ok: true, verdi: { navn, belop: belop.verdi } }
}
