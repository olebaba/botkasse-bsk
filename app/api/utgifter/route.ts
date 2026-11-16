import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { krevInnlogget } from '@/lib/auth/apiAuth.ts'
import type { Utgift } from '@/lib/utgiftService.ts'

interface UtgiftRow {
    utgift: string
    beløp: string
    dato: string
}

const pgFeilkode = (error: unknown) => (error as { code?: string })?.code

export async function GET() {
    const auth = await krevInnlogget()
    if ('error' in auth) return auth.error

    try {
        const result = await sql<UtgiftRow>`SELECT utgift, beløp, dato FROM utgifter ORDER BY dato DESC`
        const utgifter: Utgift[] = result.rows.map((row) => ({
            utgift: row.utgift,
            beløp: Math.round(Number(row.beløp)),
            dato: row.dato,
        }))
        return NextResponse.json(utgifter, { status: 200 })
    } catch (error) {
        console.error('Feil ved henting av utgifter', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke hente utgifter.' }, { status: 500 })
    }
}
