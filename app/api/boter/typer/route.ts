// app/api/boter/types/route.ts
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM forseelser`;
        return new Response(JSON.stringify(rows), { status: 200 });
    } catch (error) {
        return new Response('Feil ved henting av bøtetyper', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { type, standard_belop } = await request.json();

        await sql`
      INSERT INTO forseelser (navn, beløp)
      VALUES (${type}, ${standard_belop})
    `;
        return new Response('Bot-type lagt til', { status: 200 });
    } catch (error) {
        return new Response('Kunne ikke legge til bot-type', { status: 500 });
    }
}
