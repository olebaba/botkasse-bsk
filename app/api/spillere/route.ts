import {sql} from '@vercel/postgres';
import {NextResponse} from 'next/server';
import type {Spiller} from "@/app/lib/spillereService";

export async function GET() {
    try {
        const spillere = await sql`
            SELECT *
            FROM spillere;`;
        const typedSpillere: Spiller[] = spillere.rows.map(row => ({
            id: row.id,
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
    const {spiller_id, totalSum, erBetalt} = await request.json();

    try {
        if (!spiller_id || totalSum === undefined || erBetalt === undefined) {
            throw new Error('Draktnummer, totalsum og betalingsstatus kreves.');
        }

        // Oppdater spillerens totalSum og er_betalt felt
        const oppdatertSpiller = await sql`
            UPDATE spillere
            SET total_sum = ${totalSum}
            WHERE id = ${spiller_id}
            RETURNING *;
        `;

        return NextResponse.json({spiller: oppdatertSpiller.rows[0]}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: 'Feil ved oppdatering av spiller'}, {status: 500});
    }
}
