import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function GET() {
    try {
        const result = await sql`SELECT utgift, beløp, dato FROM utgifter ORDER BY dato DESC`;
        return NextResponse.json(result.rows, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kunne ikke hente utgifter.' }, { status: 500 });
    }
}

