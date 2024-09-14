import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

// Håndter GET-forespørsler
export async function GET() {
    try {
        // Hent alle spillere og deres data fra databasen
        const spillere = await sql`SELECT * FROM spillere;`;
        return NextResponse.json({ spillere: spillere.rows }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Feil ved henting av spillere' }, { status: 500 });
    }
}

// Håndter PATCH-forespørsler for å oppdatere en spillers data
export async function PATCH(request: Request) {
    const { draktnummer, total_sum, er_betalt } = await request.json();

    try {
        if (!draktnummer || total_sum === undefined || er_betalt === undefined) {
            throw new Error('Draktnummer, totalsum og betalingsstatus kreves.');
        }

        // Oppdater spillerens total_sum og er_betalt felt
        const oppdatertSpiller = await sql`
      UPDATE spillere 
      SET total_sum = ${total_sum}, betalt_alle = ${er_betalt} 
      WHERE draktnummer = ${draktnummer}
      RETURNING *;
    `;

        return NextResponse.json({ spiller: oppdatertSpiller.rows[0] }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Feil ved oppdatering av spiller' }, { status: 500 });
    }
}
