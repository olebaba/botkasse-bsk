export const MAKS_DRAKTNUMMER = 2147483647
export const MAKS_NAVN_LENGDE = 100

export type Valideringsresultat<T> = { ok: true; verdi: T } | { ok: false; feil: string }

const DRAKTNUMMER_FEIL = 'Draktnummer må være et positivt heltall.'
const NYTT_DRAKTNUMMER_FEIL = 'Nytt draktnummer må være et positivt heltall.'
const UGYLDIG_FORESPORSEL = 'Ugyldig forespørsel.'

const lesObjekt = (data: unknown): Record<string, unknown> | null =>
    typeof data === 'object' && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : null

export const validerDraktnummer = (verdi: unknown): Valideringsresultat<number> => {
    if (typeof verdi === 'number' && Number.isInteger(verdi) && verdi > 0 && verdi <= MAKS_DRAKTNUMMER) {
        return { ok: true, verdi }
    }
    return { ok: false, feil: DRAKTNUMMER_FEIL }
}

export const validerNavn = (verdi: unknown): Valideringsresultat<string> => {
    const navn = typeof verdi === 'string' ? verdi.trim() : ''
    if (navn === '') {
        return { ok: false, feil: 'Navn må fylles ut.' }
    }
    if (navn.length > MAKS_NAVN_LENGDE) {
        return { ok: false, feil: `Navn kan ikke være lengre enn ${MAKS_NAVN_LENGDE} tegn.` }
    }
    return { ok: true, verdi: navn }
}

export const validerVisNavn = (verdi: unknown): Valideringsresultat<boolean> =>
    typeof verdi === 'boolean' ? { ok: true, verdi } : { ok: false, feil: 'Vis spiller må være sann eller usann.' }

export type NySpiller = { draktnummer: number; navn: string }

export const validerNySpiller = (data: unknown): Valideringsresultat<NySpiller> => {
    const objekt = lesObjekt(data)
    if (!objekt) {
        return { ok: false, feil: UGYLDIG_FORESPORSEL }
    }

    const draktnummer = validerDraktnummer(objekt.draktnummer)
    if (!draktnummer.ok) return draktnummer

    const navn = validerNavn(objekt.navn)
    if (!navn.ok) return navn

    return { ok: true, verdi: { draktnummer: draktnummer.verdi, navn: navn.verdi } }
}

export type SpillerOppdatering = { spillerId: number; navn: string; visNavn: boolean; nyttDraktnummer?: number }

export const validerSpillerOppdatering = (data: unknown): Valideringsresultat<SpillerOppdatering> => {
    const objekt = lesObjekt(data)
    if (!objekt) {
        return { ok: false, feil: UGYLDIG_FORESPORSEL }
    }

    const spillerId = validerDraktnummer(objekt.spiller_id)
    if (!spillerId.ok) return spillerId

    const navn = validerNavn(objekt.navn)
    if (!navn.ok) return navn

    const visNavn = validerVisNavn(objekt.visNavn)
    if (!visNavn.ok) return visNavn

    const oppdatering = { spillerId: spillerId.verdi, navn: navn.verdi, visNavn: visNavn.verdi }
    if (objekt.nyttDraktnummer === undefined) {
        return { ok: true, verdi: oppdatering }
    }

    const nyttDraktnummer = validerDraktnummer(objekt.nyttDraktnummer)
    if (!nyttDraktnummer.ok) return { ok: false, feil: NYTT_DRAKTNUMMER_FEIL }

    if (nyttDraktnummer.verdi === spillerId.verdi) {
        return { ok: true, verdi: oppdatering }
    }
    return { ok: true, verdi: { ...oppdatering, nyttDraktnummer: nyttDraktnummer.verdi } }
}

export type SumOppdatering = { spillerId: number; totalSum: number; erBetalt: boolean }

export const validerSumOppdatering = (data: unknown): Valideringsresultat<SumOppdatering> => {
    const objekt = lesObjekt(data)
    if (!objekt) {
        return { ok: false, feil: UGYLDIG_FORESPORSEL }
    }

    const spillerId = validerDraktnummer(objekt.spiller_id)
    if (!spillerId.ok) return spillerId

    const { totalSum, erBetalt } = objekt
    if (typeof totalSum !== 'number' || !Number.isFinite(totalSum)) {
        return { ok: false, feil: 'Totalsum må være et tall.' }
    }
    if (typeof erBetalt !== 'boolean') {
        return { ok: false, feil: 'Betalingsstatus må være sann eller usann.' }
    }

    return { ok: true, verdi: { spillerId: spillerId.verdi, totalSum, erBetalt } }
}

export const parseDraktnummerParam = (verdi: string | null): Valideringsresultat<number> => {
    if (verdi === null || !/^\d+$/.test(verdi)) {
        return { ok: false, feil: DRAKTNUMMER_FEIL }
    }
    return validerDraktnummer(Number(verdi))
}

export type SletteBlokkering = 'har_boter' | 'har_bruker'

export const finnSletteBlokkering = (antallBoter: number, harBruker: boolean): SletteBlokkering | null => {
    if (antallBoter > 0) return 'har_boter'
    if (harBruker) return 'har_bruker'
    return null
}

export const sletteBlokkeringMelding: Record<SletteBlokkering, string> = {
    har_boter: 'Spilleren har bøter og kan ikke slettes. Skjul spilleren i stedet.',
    har_bruker: 'Spilleren er koblet til en brukerkonto og kan ikke slettes.',
}
