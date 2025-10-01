import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const { botIder }: { botIder: string[] } = await request.json()

    if (!botIder || botIder.length === 0) {
        return NextResponse.json({ error: 'Ingen bøter valgt' }, { status: 400 })
    }

    try {
        await sql.query('UPDATE bøter SET er_betalt = NOT er_betalt WHERE id = ANY($1::int[])', [botIder.map(Number)])
        return NextResponse.json({ message: 'Bøter markert som betalt' }, { status: 200 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Klarte ikke markere bøter som betalt' }, { status: 500 })
    }
}
