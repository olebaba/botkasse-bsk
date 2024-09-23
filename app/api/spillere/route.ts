import {sql} from '@vercel/postgres';
import {NextResponse} from 'next/server';
import type {Spiller} from "@/app/lib/spillereService";

// Håndter GET-forespørsler
export async function GET() {
    try {
        const spillere = await sql`
            SELECT *
            FROM spillere;`;
        const typedSpillere: Spiller[] = spillere.rows.map(row => ({
            draktnummer: row.draktnummer,
            totalSum: row.total_sum,
            betaltSesong: row.betalt_sesong,
            betaltMaaned: row.betalt_maaned,
            utestaaende: row.utestaaende,
            betaltAlle: row.betalt_alle,
        }))
        return NextResponse.json({spillere: typedSpillere}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Feil ved henting av spillere'}, {status: 500});
    }
}

// Håndter PATCH-forespørsler for å oppdatere en spillers data
export async function PATCH(request: Request) {
    const {draktnummer, totalSum, erBetalt} = await request.json();

    try {
        if (!draktnummer || totalSum === undefined || erBetalt === undefined) {
            throw new Error('Draktnummer, totalsum og betalingsstatus kreves.');
        }

        // Oppdater spillerens totalSum og er_betalt felt
        const oppdatertSpiller = await sql`
            UPDATE spillere
            SET total_sum   = ${totalSum},
                betalt_alle = ${erBetalt}
            WHERE draktnummer = ${draktnummer}
            RETURNING *;
        `;

        return NextResponse.json({spiller: oppdatertSpiller.rows[0]}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Feil ved oppdatering av spiller'}, {status: 500});
    }
}
