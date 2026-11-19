import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { krevAdmin } from '@/lib/auth/apiAuth.ts'
import { validerBetalingsEndring } from '@/lib/botValidering.ts'
import { pgFeilkode } from '@/lib/pgFeil.ts'

export async function POST(request: Request) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
    }

    const resultat = validerBetalingsEndring(body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { botIder, erBetalt } = resultat.verdi
    try {
        const { rowCount } = await sql.query('UPDATE bøter SET er_betalt = $1 WHERE id = ANY($2::int[])', [
            erBetalt,
            botIder,
        ])
        if (rowCount === 0) {
            return NextResponse.json({ error: 'Fant ingen av de valgte bøtene.' }, { status: 404 })
        }
        return NextResponse.json(
            { message: erBetalt ? 'Bøter markert som betalt' : 'Bøter markert som ubetalt' },
            { status: 200 },
        )
    } catch (error) {
        console.error('Feil ved markering av bøter', pgFeilkode(error))
        return NextResponse.json({ error: 'Klarte ikke markere bøter som betalt' }, { status: 500 })
    }
}
