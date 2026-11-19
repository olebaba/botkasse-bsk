import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import type { Dayjs } from 'dayjs'
import { krevAdmin, krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { validerNyBot } from '@/lib/botValidering.ts'
import { PG_FREMMEDNOKKEL_BRUDD, pgFeilkode } from '@/lib/pgFeil.ts'

type Params = {
    spiller_id: string
}

export async function POST(request: Request, props: { params: Promise<Params> }) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    const params = await props.params
    let body: unknown
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
    }

    const resultat = validerNyBot(params.spiller_id, body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { spillerId, belop, dato, forseelsesId, kommentar } = resultat.verdi
    try {
        // Ett statement slik at boten og summen enten lagres sammen eller ikke i det hele tatt.
        await sql`
            WITH ny_bot AS (
                INSERT INTO bøter (spiller_id, beløp, dato, forseelse_id, er_betalt, kommentar)
                VALUES (${spillerId}, ${belop}, ${dato}, ${forseelsesId}, false, ${kommentar})
                RETURNING id
            )
            UPDATE spillere
            SET total_sum = total_sum + ${belop}
            WHERE id = ${spillerId}
        `
        return NextResponse.json({ message: 'Bot lagt til' }, { status: 200 })
    } catch (error) {
        if (pgFeilkode(error) === PG_FREMMEDNOKKEL_BRUDD) {
            return NextResponse.json({ error: 'Fant ikke spilleren eller forseelsen.' }, { status: 404 })
        }
        console.error('Feil ved oppretting av bot', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke legge til bot.' }, { status: 500 })
    }
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const auth = await krevInnlogget()
    if ('error' in auth) return auth.error

    const params = await props.params
    const spillerId = parseInt(params.spiller_id, 10)
    if (isNaN(spillerId)) {
        return new Response('Invalid draktnummer', { status: 400 })
    }

    const boter = await hentBoterForSpillerId(spillerId)
    return NextResponse.json({ boter })
}

export interface Bot {
    id: string
    spillerId: string
    belop: number
    dato: Dayjs
    forseelseId: string
    erBetalt: boolean
    kommentar?: string
}

async function hentBoterForSpillerId(spiller_id: number): Promise<Bot[]> {
    const { rows } = await sql`
        SELECT id, bøter.spiller_id, beløp, dato, forseelse_id, er_betalt, kommentar
        FROM bøter
        WHERE spiller_id = ${spiller_id}
    `
    return rows.map((row) => ({
        id: row.id,
        spillerId: row.spiller_id,
        belop: row.beløp,
        dato: row.dato,
        forseelseId: row.forseelse_id,
        erBetalt: row.er_betalt,
        kommentar: row.kommentar,
    }))
}
