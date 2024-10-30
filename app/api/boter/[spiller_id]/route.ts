import {NextResponse} from "next/server";
import {sql} from "@vercel/postgres";
import dayjs from "@/lib/dayjs.ts";
import type {Dayjs} from "dayjs";

type Params = {
    spiller_id: string,
}

export async function POST(request: Request, props: { params: Promise<Params> }) {
    const params = await props.params;
    const {beløp, dato, forseelsesId}: { beløp: number, dato: string, forseelsesId: number } = await request.json();
    const spiller_id = parseInt(params.spiller_id, 10);

    if (!spiller_id || !beløp || !dato || !forseelsesId) {
        return NextResponse.json({error: 'Alle felter må fylles ut.'}, {status: 400});
    }

    try {
        await sql`
            INSERT INTO bøter (spiller_id, beløp, dato, forseelse_id, er_betalt)
            VALUES (${spiller_id}, ${beløp}, ${dato}, ${forseelsesId}, false)
        `;

        await sql`
            UPDATE spillere
            SET total_sum = total_sum + ${beløp}
            WHERE id = ${spiller_id};
        `
        return NextResponse.json({message: 'Bot lagt til'}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Kunne ikke legge til bot.'}, {status: 500});
    }
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params;
    const spillerId = parseInt(params.spiller_id, 10);
    if (isNaN(spillerId)) {
        return new Response('Invalid draktnummer', {status: 400});
    }

    const boter = await hentBoterForSpillerId(spillerId)

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
    spiller_id: string
    belop: number
    dato: Dayjs
    forseelseId: string
    erBetalt: boolean
}

async function hentBoterForSpillerId(spiller_id: number): Promise<Bot[]> {
    const {rows} = await sql`
        SELECT id, bøter.spiller_id, beløp, dato, forseelse_id, er_betalt
        FROM bøter
        WHERE spiller_id = ${spiller_id}
    `;
    return rows.map((row) => ({
        id: row.id,
        spiller_id: row.spiller_id,
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
