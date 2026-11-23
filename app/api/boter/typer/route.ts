import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'
import { krevAdmin, krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { validerNyForseelse } from '@/lib/forseelseValidering.ts'
import { PG_UNIK_BRUDD, pgFeilkode } from '@/lib/pgFeil.ts'

export type Forseelse = {
    id: string
    navn: string
    beløp: number
    beskrivelse: string
    oppdatert: string
}

export async function GET() {
    const auth = await krevInnlogget()
    if ('error' in auth) return auth.error

    try {
        const { rows } = await sql<Forseelse>`SELECT * FROM forseelser`
        return new Response(JSON.stringify(rows), { status: 200 })
    } catch {
        return new Response('Feil ved henting av forseelse', { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
    }

    const resultat = validerNyForseelse(body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { navn, belop } = resultat.verdi
    try {
        await sql`
            INSERT INTO forseelser (navn, beløp)
            VALUES (${navn}, ${belop})
        `
        return NextResponse.json({ message: 'Bot-type lagt til' }, { status: 200 })
    } catch (error) {
        if (pgFeilkode(error) === PG_UNIK_BRUDD) {
            return NextResponse.json({ error: `Forseelsen «${navn}» finnes allerede.` }, { status: 409 })
        }
        console.error('Feil ved oppretting av forseelse', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke legge til forseelse' }, { status: 500 })
    }
}
