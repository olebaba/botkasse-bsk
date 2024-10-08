import {NextResponse} from "next/server";
import {sql} from "@vercel/postgres";
import dayjs from "@/app/lib/dayjs.ts";
import type {Dayjs} from "dayjs";

type Params = {
    draktnummer: string,
}

export async function POST(request: Request, {params}: { params: Params }) {
    const {beløp, dato, forseelsesId}: { beløp: number, dato: string, forseelsesId: number } = await request.json();
    const draktnummer = parseInt(params.draktnummer, 10);

    if (!draktnummer || !beløp || !dato || !forseelsesId) {
        return NextResponse.json({error: 'Alle felter må fylles ut.'}, {status: 400});
    }

    try {
        await sql`
            INSERT INTO bøter (draktnummer, beløp, dato, forseelse_id, er_betalt)
            VALUES (${draktnummer}, ${beløp}, ${dato}, ${forseelsesId}, false)
        `;

        await sql`
            UPDATE spillere
            SET total_sum = total_sum + ${beløp}
            WHERE draktnummer = ${draktnummer};
        `
        return NextResponse.json({message: 'Bot lagt til'}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Kunne ikke legge til bot.'}, {status: 500});
    }
}

export async function GET(_request: Request, {params}: { params: Params }) {
    // Hent draktnummer fra params og konverter til number
    const draktnummer = parseInt(params.draktnummer, 10);
    if (isNaN(draktnummer)) {
        return new Response('Invalid draktnummer', {status: 400});
    }

    const boter = await hentBoterForDraktnummer(draktnummer)

    // Beregn summer
    const betaltMaaned = beregnSumForSisteMaaned(boter);
    const betaltSesong = beregnSumForSesong(boter);
    const totalSum = beregnUtestaaendeSum(boter);
    const betaltAlle = boter.every(bot => bot.erBetalt)

    return NextResponse.json({
        boter,
        betaltMaaned,
        betaltSesong,
        totalSum,
        betaltAlle
    });
}

export interface Bot {
    id: string
    draktnummer: string
    belop: number
    dato: Dayjs
    forseelseId: string
    erBetalt: boolean
}

async function hentBoterForDraktnummer(draktnummer: number): Promise<Bot[]> {
    const {rows} = await sql`
        SELECT id, bøter.draktnummer, beløp, dato, forseelse_id, er_betalt
        FROM bøter
        WHERE draktnummer = ${draktnummer}
    `;
    return rows.map((row) => ({
        id: row.id,
        draktnummer: row.draktnummer,
        belop: row.beløp,
        dato: row.dato,
        forseelseId: row.forseelse_id,
        erBetalt: row.er_betalt
    }));
}

// Beregner total bøtesum for siste måned
function beregnSumForSisteMaaned(boter: Bot[]): number {
    const oneMonthAgo = dayjs().subtract(1, "month")

    return boter
        .filter(bot => bot.erBetalt && dayjs(bot.dato).isAfter(oneMonthAgo))
        .reduce((sum, bot) => sum + Number(bot.belop), 0);
}

// Beregner total bøtesum for hele sesongen
function beregnSumForSesong(boter: Bot[]): number {
    const sesongStart = dayjs('2024-09-01');

    return boter
        .filter(bot => bot.erBetalt && dayjs(bot.dato).isAfter(sesongStart))
        .reduce((sum, bot) => sum + Number(bot.belop), 0);
}

// Beregner utestående bøtesum (ikke betalt)
function beregnUtestaaendeSum(boter: Bot[]): number {
    return boter
        .filter(bot => !bot.erBetalt)
        .reduce((sum, bot) => sum + Number(bot.belop), 0);
}
