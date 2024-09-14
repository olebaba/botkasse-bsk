import {NextResponse} from "next/server";
import {sql} from "@vercel/postgres";

type Params = {
    draktnummer: string,
}
export async function GET(_request: Request, {params}: { params: Params }) {
    // Hent draktnummer fra params og konverter til number
    const draktnummer = parseInt(params.draktnummer, 10);
    if (isNaN(draktnummer)) {
        return new Response('Invalid draktnummer', { status: 400 });
    }

    // Hent summer
    const betaltMaaned = await hentSumForSisteMaaned(draktnummer);
    const betaltSesong = await hentSumForSesong(draktnummer);
    const totalSum = await hentUtestaaendeSum(draktnummer);

    return NextResponse.json({
        betaltMaaned,
        betaltSesong,
        totalSum
    });
}

// Henter total bøtesum for den siste måneden
async function hentSumForSisteMaaned(draktnummer: number): Promise<number | null> {
    const { rows } = await sql`
    SELECT SUM(beløp) AS total_sum_måned
    FROM bøter
    WHERE draktnummer = ${draktnummer}
    AND dato >= (CURRENT_DATE - INTERVAL '1 month')
    AND er_betalt = false
  `;
    return rows[0]?.total_sum_måned || 0;
}

// Henter total bøtesum for hele sesongen
async function hentSumForSesong(draktnummer: number): Promise<number | null> {
    const { rows } = await sql`
    SELECT SUM(beløp) AS total_sum_sesong
    FROM bøter
    WHERE draktnummer = ${draktnummer}
    AND dato >= '2024-09-01'  -- Tilpass sesongens startdato
    AND er_betalt = false
  `;
    return rows[0]?.total_sum_sesong || 0;
}

// Henter utestående bøter (ikke betalt)
async function hentUtestaaendeSum(draktnummer: number): Promise<number | null> {
    const { rows } = await sql`
    SELECT SUM(beløp) AS utestaaende_sum
    FROM bøter
    WHERE draktnummer = ${draktnummer}
    AND er_betalt = false
  `;
    return rows[0]?.utestaaende_sum || 0;
}
