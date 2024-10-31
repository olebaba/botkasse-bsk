import dayjs from "@/lib/dayjs.ts";
import type {Bot} from "@/app/api/boter/[spiller_id]/route.ts";

function beregnSumForrigeMaaned(boter: Bot[], betalt: boolean): number {
    const endOfLastMonth = dayjs().subtract(1, "month").endOf("month");

    return boter
        .filter(bot =>
            bot.erBetalt == betalt &&
            dayjs(bot.dato).isBefore(endOfLastMonth)
        )
        .reduce((sum, bot) => sum + Number(bot.belop), 0);
}

export function beregnSumMaaBetales(boter: Bot[]): number {
    const betaltForrigeMaaned = beregnSumForrigeMaaned(boter, true)
    const ubetaltForrigeMaaned = beregnSumForrigeMaaned(boter, false)
    return ubetaltForrigeMaaned - betaltForrigeMaaned
}

export function beregnSumNyeBoter(boter: Bot[]): number {
    const endOfLastMonth = dayjs().subtract(1, "month").endOf("month");
    return boter
        .filter(bot => !bot.erBetalt && dayjs(bot.dato).isAfter(endOfLastMonth))
        .reduce((sum, bot) => sum + Number(bot.belop), 0);
}

export function beregnSum(boter: Bot[]): number {
    return boter.reduce((sum, bot) => sum + Number(bot.belop), 0);
}