import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { krevInnlogget } from '@/lib/auth/apiAuth.ts'

export async function GET() {
    const auth = await krevInnlogget()
    if ('error' in auth) return auth.error

    try {
        const result = await sql`SELECT utgift, beløp, dato FROM utgifter ORDER BY dato DESC`
        return NextResponse.json(result.rows, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Kunne ikke hente utgifter.' }, { status: 500 })
    }
}
