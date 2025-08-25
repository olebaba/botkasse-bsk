import { sql } from '@vercel/postgres'
import { NextResponse } from 'next/server'

export interface ForseelseStatistikk {
    forseelseId: string
    forseelseNavn: string
    antallBoter: number
    totaltBelop: number
    innsamletBelop: number
    spillerMedFlestBoter: {
        navn: string
        antallBoter: number
    } | null
}

type Params = {
    forseelse_id: string
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params
    const forseelseId = parseInt(params.forseelse_id, 10)

    if (isNaN(forseelseId)) {
        return NextResponse.json({ error: 'Ugyldig forseelse ID' }, { status: 400 })
    }

    try {
        // Hent statistikk for spesifikk forseelse
        const forseelseStatistikkQuery = await sql`
            SELECT 
                f.id as forseelse_id,
                f.navn as forseelse_navn,
                COUNT(b.id) as antall_boter,
                COALESCE(SUM(b.beløp), 0) as totalt_belop,
                COALESCE(SUM(CASE WHEN b.er_betalt = true THEN b.beløp ELSE 0 END), 0) as innsamlet_belop
            FROM forseelser f
            LEFT JOIN bøter b ON f.id = b.forseelse_id
            WHERE f.id = ${forseelseId}
            GROUP BY f.id, f.navn
        `

        if (forseelseStatistikkQuery.rows.length === 0) {
            return NextResponse.json({ error: 'Forseelse ikke funnet' }, { status: 404 })
        }

        const row = forseelseStatistikkQuery.rows[0]

        // Finn spilleren med flest bøter for denne forseelsen
        const spillerMedFlestBoterQuery = await sql`
            SELECT s.navn, COUNT(b.id) as antall_boter
            FROM spillere s
            JOIN bøter b ON s.id = b.spiller_id
            WHERE b.forseelse_id = ${forseelseId}
            GROUP BY s.id, s.navn
            ORDER BY antall_boter DESC
            LIMIT 1
        `

        const spillerMedFlestBoter =
            spillerMedFlestBoterQuery.rows[0]?.antall_boter > 0
                ? {
                      navn: spillerMedFlestBoterQuery.rows[0].navn,
                      antallBoter: parseInt(spillerMedFlestBoterQuery.rows[0].antall_boter),
                  }
                : null

        const statistikk: ForseelseStatistikk = {
            forseelseId: row.forseelse_id,
            forseelseNavn: row.forseelse_navn,
            antallBoter: parseInt(row.antall_boter),
            totaltBelop: Math.round(Number(row.totalt_belop)),
            innsamletBelop: Math.round(Number(row.innsamlet_belop)),
            spillerMedFlestBoter,
        }

        return NextResponse.json(statistikk, { status: 200 })
    } catch (error) {
        console.error('Feil ved henting av statistikk:', error)
        return NextResponse.json({ error: 'Kunne ikke hente statistikk' }, { status: 500 })
    }
}
