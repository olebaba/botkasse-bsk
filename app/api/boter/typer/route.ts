// app/api/boter/types/route.ts
import { sql } from '@vercel/postgres';

export async function GET() {
    const { rows } = await sql`SELECT DISTINCT type FROM bøter`;
    const botTyper = rows.map(row => row.type);

    return new Response(JSON.stringify(botTyper), { status: 200 });
}
