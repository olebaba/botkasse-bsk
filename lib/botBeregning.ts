import dayjs from '@/lib/dayjs.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

const SESONG_START_AUGUST_MAANED = 7

interface SesongPeriode {
    start: dayjs.Dayjs
    slutt: dayjs.Dayjs
}

// === SESONG UTILITETER ===
export const hentGjeldendeSesongStart = (): dayjs.Dayjs => {
    const naa = dayjs()
    const aar = naa.year()

    if (naa.month() < SESONG_START_AUGUST_MAANED) {
        return dayjs()
            .year(aar - 1)
            .month(SESONG_START_AUGUST_MAANED)
            .date(1)
            .startOf('day')
    }

    return dayjs().year(aar).month(SESONG_START_AUGUST_MAANED).date(1).startOf('day')
}

export const hentGjeldendeSesongSlutt = (): dayjs.Dayjs => {
    const sesongStart = hentGjeldendeSesongStart()
    return sesongStart.add(1, 'year').subtract(1, 'day').endOf('day')
}

export const hentSesongTekst = (): string => {
    const sesongStart = hentGjeldendeSesongStart()
    const startAar = sesongStart.year()
    return `${startAar}/${startAar + 1}`
}

export const erISesong = (dato: dayjs.Dayjs, sesongStart?: dayjs.Dayjs, sesongSlutt?: dayjs.Dayjs): boolean => {
    const start = sesongStart || hentGjeldendeSesongStart()
    const slutt = sesongSlutt || hentGjeldendeSesongSlutt()

    return (dato.isAfter(start) || dato.isSame(start)) && (dato.isBefore(slutt) || dato.isSame(slutt))
}

const lagSesongPeriodeForSpesifikkSesong = (sesongTekst: string): SesongPeriode => {
    const [startAarStr] = sesongTekst.split('/')
    const startAar = parseInt(startAarStr, 10)

    return {
        start: dayjs().year(startAar).month(SESONG_START_AUGUST_MAANED).date(1).startOf('day'),
        slutt: dayjs()
            .year(startAar + 1)
            .month(SESONG_START_AUGUST_MAANED - 1)
            .endOf('month')
            .endOf('day'),
    }
}

export const hentTilgjengeligeSesonger = (boter: Bot[]): string[] => {
    if (!boter?.length) return []

    const sesonger = new Set<string>()

    boter.forEach((bot) => {
        const botDato = dayjs(bot.dato)
        const aar = botDato.year()

        if (botDato.month() >= SESONG_START_AUGUST_MAANED) {
            sesonger.add(`${aar}/${aar + 1}`)
        } else {
            sesonger.add(`${aar - 1}/${aar}`)
        }
    })

    return Array.from(sesonger).sort().reverse()
}

// === FILTRERINGSFUNKSJONER ===
export const filtrerBoterForSesong = (boter: Bot[], visAlleSesonger: boolean = false): Bot[] => {
    if (visAlleSesonger) return boter

    const sesongStart = hentGjeldendeSesongStart()
    const sesongSlutt = hentGjeldendeSesongSlutt()

    return boter.filter((bot) => erISesong(dayjs(bot.dato), sesongStart, sesongSlutt))
}

export const filtrerBoterForSpesifikkSesong = (boter: Bot[], sesongTekst: string): Bot[] => {
    const { start, slutt } = lagSesongPeriodeForSpesifikkSesong(sesongTekst)

    return boter.filter((bot) => {
        const botDato = dayjs(bot.dato)
        return (botDato.isAfter(start) || botDato.isSame(start)) && (botDato.isBefore(slutt) || botDato.isSame(slutt))
    })
}

// === GRUNNLEGGENDE BEREGNINGSFUNKSJONER ===
const hentForrigeManedSlutt = () => dayjs().subtract(1, 'month').endOf('month')

export const beregnSum = (boter: Bot[]): number => boter.reduce((sum, bot) => sum + Number(bot.belop), 0)

export const beregnSumBetalt = (boter: Bot[]): number =>
    boter.filter((bot) => bot.erBetalt).reduce((sum, bot) => sum + Number(bot.belop), 0)

export const beregnSumMaaBetales = (boter: Bot[]): number => {
    const forrigeManedSlutt = hentForrigeManedSlutt()
    return boter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isBefore(forrigeManedSlutt))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export const beregnSumNyeBoter = (boter: Bot[]): number => {
    const forrigeManedSlutt = hentForrigeManedSlutt()
    return boter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isAfter(forrigeManedSlutt))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export const beregnAntallBoter = (boter: Bot[]): number => boter.length

// === GENERISK BEREGNINGSHJELPER ===
type BeregningsFunksjon = (boter: Bot[]) => number

const beregnForSesong = (
    boter: Bot[],
    beregnFunksjon: BeregningsFunksjon,
    visAlleSesonger: boolean = false,
): number => {
    const filtrerteBoter = filtrerBoterForSesong(boter, visAlleSesonger)
    return beregnFunksjon(filtrerteBoter)
}

const beregnForSpesifikkSesong = (boter: Bot[], beregnFunksjon: BeregningsFunksjon, sesongTekst: string): number => {
    const filtrerteBoter = filtrerBoterForSpesifikkSesong(boter, sesongTekst)
    return beregnFunksjon(filtrerteBoter)
}

// === SESONGAVHENGIGE BEREGNINGSFUNKSJONER ===
export const beregnSumForSesong = (boter: Bot[], visAlleSesonger: boolean = false): number =>
    beregnForSesong(boter, beregnSum, visAlleSesonger)

export const beregnSumBetaltForSesong = (boter: Bot[], visAlleSesonger: boolean = false): number =>
    beregnForSesong(boter, beregnSumBetalt, visAlleSesonger)

export const beregnSumMaaBetalesForSesong = (boter: Bot[], visAlleSesonger: boolean = false): number =>
    beregnForSesong(boter, beregnSumMaaBetales, visAlleSesonger)

export const beregnSumNyeBoterForSesong = (boter: Bot[], visAlleSesonger: boolean = false): number =>
    beregnForSesong(boter, beregnSumNyeBoter, visAlleSesonger)

export const beregnAntallBoterForSesong = (boter: Bot[], visAlleSesonger: boolean = false): number =>
    beregnForSesong(boter, beregnAntallBoter, visAlleSesonger)

export const beregnSumMaaBetalesForSpesifikkSesong = (boter: Bot[], sesongTekst: string): number =>
    beregnForSpesifikkSesong(boter, beregnSumMaaBetales, sesongTekst)

// === FLEKSIBLE BEREGNINGSFUNKSJONER ===
export const beregnBelopForSesongvalg = (
    boter: Bot[],
    visAlleSesonger: boolean = false,
    valgtSesong: string = '',
): number => {
    if (visAlleSesonger || valgtSesong === 'alle') {
        return beregnSumMaaBetales(boter)
    }

    if (valgtSesong === '') {
        return beregnSumMaaBetalesForSesong(boter, false)
    }

    return beregnSumMaaBetalesForSpesifikkSesong(boter, valgtSesong)
}
