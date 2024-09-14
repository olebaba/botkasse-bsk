import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { draktnummer, beløp, dato, type } = await request.json();

    if (!draktnummer || !beløp || !dato || !type) {
        return NextResponse.json({ error: 'Alle felter må fylles ut.' }, { status: 400 });
    }

    try {
        await sql`
      INSERT INTO bøter (draktnummer, beløp, dato, type, er_betalt)
      VALUES (${draktnummer}, ${beløp}, ${dato}, ${type}, false)
    `;
        return NextResponse.json({ message: 'Bot lagt til' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kunne ikke legge til bot.' }, { status: 500 });
    }
}
