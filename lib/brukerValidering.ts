import { validerNavn, type Valideringsresultat } from '@/lib/spillerValidering.ts'

export const MIN_MOBILNUMMER_LENGDE = 5
export const MAKS_MOBILNUMMER_LENGDE = 13

export type ProfilOppdatering = { navn: string | null; mobilnummer: string | null }

const erTom = (verdi: unknown) => verdi === null || verdi === undefined || verdi === ''

export const validerMobilnummer = (verdi: unknown): Valideringsresultat<string> => {
    const mobilnummer = typeof verdi === 'string' ? verdi.trim() : ''
    if (
        !/^\d+$/.test(mobilnummer) ||
        mobilnummer.length < MIN_MOBILNUMMER_LENGDE ||
        mobilnummer.length > MAKS_MOBILNUMMER_LENGDE
    ) {
        return {
            ok: false,
            feil: `Mobilnummer må bestå av ${MIN_MOBILNUMMER_LENGDE} til ${MAKS_MOBILNUMMER_LENGDE} siffer.`,
        }
    }
    return { ok: true, verdi: mobilnummer }
}

export const validerProfilOppdatering = (data: {
    navn: unknown
    mobilnummer: unknown
}): Valideringsresultat<ProfilOppdatering> => {
    let navn: string | null = null
    if (!erTom(data.navn)) {
        const resultat = validerNavn(data.navn)
        if (!resultat.ok) return resultat
        navn = resultat.verdi
    }

    let mobilnummer: string | null = null
    if (!erTom(data.mobilnummer)) {
        const resultat = validerMobilnummer(data.mobilnummer)
        if (!resultat.ok) return resultat
        mobilnummer = resultat.verdi
    }

    return { ok: true, verdi: { navn, mobilnummer } }
}
