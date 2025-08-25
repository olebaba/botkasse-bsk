import dayjs from '@/lib/dayjs.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

export function hentGjeldendeSesongStart(): dayjs.Dayjs {
    const naa = dayjs()
    const aar = naa.year()

    // Hvis vi er før august, tilhører vi forrige sesong
    if (naa.month() < 7) {
        // August er måned 7 (0-indexert)
        return dayjs()
            .year(aar - 1)
            .month(7)
            .date(1)
            .startOf('day')
    }

    return dayjs().year(aar).month(7).date(1).startOf('day')
}

export function hentGjeldendeSesongSlutt(): dayjs.Dayjs {
    const sesongStart = hentGjeldendeSesongStart()
    return sesongStart.add(1, 'year').subtract(1, 'day').endOf('day')
}

export function hentSesongTekst(): string {
    const sesongStart = hentGjeldendeSesongStart()
    const startAar = sesongStart.year()
    const sluttAar = startAar + 1
    return `${startAar}/${sluttAar}`
}

export function erISesong(dato: dayjs.Dayjs, sesongStart?: dayjs.Dayjs, sesongSlutt?: dayjs.Dayjs): boolean {
    const start = sesongStart || hentGjeldendeSesongStart()
    const slutt = sesongSlutt || hentGjeldendeSesongSlutt()

    return (dato.isAfter(start) || dato.isSame(start)) && (dato.isBefore(slutt) || dato.isSame(slutt))
}

export function filtrerBoterForSesong(boter: Bot[], visAlleSesonger: boolean = false): Bot[] {
    if (visAlleSesonger) {
        return boter
    }

    const sesongStart = hentGjeldendeSesongStart()
    const sesongSlutt = hentGjeldendeSesongSlutt()

    return boter.filter((bot) => erISesong(dayjs(bot.dato), sesongStart, sesongSlutt))
}

export function beregnSumMaaBetalesForSesong(boter: Bot[], visAlleSesonger: boolean = false): number {
    const filtrerteBoter = filtrerBoterForSesong(boter, visAlleSesonger)
    const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month')

    return filtrerteBoter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isBefore(endOfLastMonth))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSumNyeBoterForSesong(boter: Bot[], visAlleSesonger: boolean = false): number {
    const filtrerteBoter = filtrerBoterForSesong(boter, visAlleSesonger)
    const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month')
    return filtrerteBoter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isAfter(endOfLastMonth))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSumForSesong(boter: Bot[], visAlleSesonger: boolean = false): number {
    const filtrerteBoter = filtrerBoterForSesong(boter, visAlleSesonger)
    return filtrerteBoter.reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSumBetaltForSesong(boter: Bot[], visAlleSesonger: boolean = false): number {
    const filtrerteBoter = filtrerBoterForSesong(boter, visAlleSesonger)
    return filtrerteBoter.filter((bot) => bot.erBetalt).reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSumMaaBetales(boter: Bot[]): number {
    const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month')

    return boter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isBefore(endOfLastMonth))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSumNyeBoter(boter: Bot[]): number {
    const endOfLastMonth = dayjs().subtract(1, 'month').endOf('month')
    return boter
        .filter((bot) => !bot.erBetalt && dayjs(bot.dato).isAfter(endOfLastMonth))
        .reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function beregnSum(boter: Bot[]): number {
    return boter.reduce((sum, bot) => sum + Number(bot.belop), 0)
}

export function hentTilgjengeligeSesonger(boter: Bot[]): string[] {
    if (!boter || boter.length === 0) return []

    const sesonger = new Set<string>()

    boter.forEach((bot) => {
        const botDato = dayjs(bot.dato)
        const aar = botDato.year()

        // Hvis boten er fra august eller senere, tilhører den sesongen som starter det året
        if (botDato.month() >= 7) {
            sesonger.add(`${aar}/${aar + 1}`)
        } else {
            // Hvis boten er fra før august, tilhører den forrige sesong
            sesonger.add(`${aar - 1}/${aar}`)
        }
    })

    return Array.from(sesonger).sort().reverse() // Nyeste først
}

export function filtrerBoterForSpesifikkSesong(boter: Bot[], sesongTekst: string): Bot[] {
    const [startAarStr, sluttAarStr] = sesongTekst.split('/')
    const startAar = parseInt(startAarStr, 10)
    const sluttAar = parseInt(sluttAarStr, 10)

    const sesongStart = dayjs().year(startAar).month(7).date(1).startOf('day') // August 1st
    const sesongSlutt = dayjs().year(sluttAar).month(6).endOf('month').endOf('day') // July 31st

    return boter.filter((bot) => {
        const botDato = dayjs(bot.dato)
        return (
            (botDato.isAfter(sesongStart) || botDato.isSame(sesongStart)) &&
            (botDato.isBefore(sesongSlutt) || botDato.isSame(sesongSlutt))
        )
    })
}
