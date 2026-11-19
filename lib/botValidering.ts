import dayjs from '@/lib/dayjs.ts'
import { parseDraktnummerParam, type Valideringsresultat } from '@/lib/spillerValidering.ts'

export const MAKS_BELOP = 1_000_000
export const MAKS_KOMMENTAR_LENGDE = 500
export const MAKS_ANTALL_BOTER = 500

const MAKS_ID = 2147483647
const UGYLDIG_FORESPORSEL = 'Ugyldig forespørsel.'
const DATOFORMAT = 'YYYY-MM-DD'

const lesObjekt = (data: unknown): Record<string, unknown> | null =>
    typeof data === 'object' && data !== null && !Array.isArray(data) ? (data as Record<string, unknown>) : null

const lesHeltallsId = (verdi: unknown): number | null => {
    const tall = typeof verdi === 'string' && /^\d+$/.test(verdi) ? Number(verdi) : verdi
    return typeof tall === 'number' && Number.isInteger(tall) && tall > 0 && tall <= MAKS_ID ? tall : null
}

export const validerBelop = (verdi: unknown): Valideringsresultat<number> => {
    if (typeof verdi === 'number' && Number.isFinite(verdi) && verdi > 0 && verdi <= MAKS_BELOP) {
        return { ok: true, verdi }
    }
    return { ok: false, feil: 'Beløp må være et positivt tall.' }
}

export const validerDato = (verdi: unknown): Valideringsresultat<string> => {
    if (typeof verdi === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(verdi)) {
        const dato = dayjs(verdi)
        if (dato.isValid() && dato.format(DATOFORMAT) === verdi) {
            return { ok: true, verdi }
        }
    }
    return { ok: false, feil: 'Dato må være en gyldig dato på formen ÅÅÅÅ-MM-DD.' }
}

export const validerForseelsesId = (verdi: unknown): Valideringsresultat<number> => {
    const id = lesHeltallsId(verdi)
    return id === null ? { ok: false, feil: 'Forseelse må være et heltall.' } : { ok: true, verdi: id }
}

export const validerKommentar = (verdi: unknown): Valideringsresultat<string | null> => {
    if (verdi === undefined || verdi === null) {
        return { ok: true, verdi: null }
    }
    if (typeof verdi !== 'string') {
        return { ok: false, feil: 'Kommentar må være tekst.' }
    }
    const kommentar = verdi.trim()
    if (kommentar.length > MAKS_KOMMENTAR_LENGDE) {
        return { ok: false, feil: `Kommentar kan ikke være lengre enn ${MAKS_KOMMENTAR_LENGDE} tegn.` }
    }
    return { ok: true, verdi: kommentar === '' ? null : kommentar }
}

export type NyBot = {
    spillerId: number
    belop: number
    dato: string
    forseelsesId: number
    kommentar: string | null
}

export const validerNyBot = (spillerIdParam: string | null, data: unknown): Valideringsresultat<NyBot> => {
    const objekt = lesObjekt(data)
    if (!objekt) {
        return { ok: false, feil: UGYLDIG_FORESPORSEL }
    }

    const spillerId = parseDraktnummerParam(spillerIdParam)
    if (!spillerId.ok) return spillerId

    const belop = validerBelop(objekt.beløp)
    if (!belop.ok) return belop

    const dato = validerDato(objekt.dato)
    if (!dato.ok) return dato

    const forseelsesId = validerForseelsesId(objekt.forseelsesId)
    if (!forseelsesId.ok) return forseelsesId

    const kommentar = validerKommentar(objekt.kommentar)
    if (!kommentar.ok) return kommentar

    return {
        ok: true,
        verdi: {
            spillerId: spillerId.verdi,
            belop: belop.verdi,
            dato: dato.verdi,
            forseelsesId: forseelsesId.verdi,
            kommentar: kommentar.verdi,
        },
    }
}

export type BetalingsEndring = { botIder: number[]; erBetalt: boolean }

export const validerBetalingsEndring = (data: unknown): Valideringsresultat<BetalingsEndring> => {
    const objekt = lesObjekt(data)
    if (!objekt) {
        return { ok: false, feil: UGYLDIG_FORESPORSEL }
    }

    const { botIder, erBetalt } = objekt
    if (!Array.isArray(botIder) || botIder.length === 0) {
        return { ok: false, feil: 'Ingen bøter valgt.' }
    }
    if (botIder.length > MAKS_ANTALL_BOTER) {
        return { ok: false, feil: `Du kan velge maks ${MAKS_ANTALL_BOTER} bøter om gangen.` }
    }

    const ider = botIder.map(lesHeltallsId)
    if (ider.some((id) => id === null)) {
        return { ok: false, feil: 'Bot-id må være et heltall.' }
    }

    if (typeof erBetalt !== 'boolean') {
        return { ok: false, feil: 'Betalingsstatus må være sann eller usann.' }
    }

    return { ok: true, verdi: { botIder: [...new Set(ider as number[])], erBetalt } }
}
