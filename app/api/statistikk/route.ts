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

export async function GET() {
    try {
        // Hent statistikk per forseelse
        const forseelseStatistikkQuery = await sql`
            SELECT 
                f.id as forseelse_id,
                f.navn as forseelse_navn,
                COUNT(b.id) as antall_boter,
                COALESCE(SUM(b.beløp), 0) as totalt_belop,
                COALESCE(SUM(CASE WHEN b.er_betalt = true THEN b.beløp ELSE 0 END), 0) as innsamlet_belop
            FROM forseelser f
            LEFT JOIN bøter b ON f.id = b.forseelse_id
            GROUP BY f.id, f.navn
            ORDER BY antall_boter DESC
        `

        const statistikk: ForseelseStatistikk[] = []

        for (const row of forseelseStatistikkQuery.rows) {
            // Finn spilleren med flest bøter for denne forseelsen
            const spillerMedFlestBoterQuery = await sql`
                SELECT s.navn, COUNT(b.id) as antall_boter
                FROM spillere s
                JOIN bøter b ON s.id = b.spiller_id
                WHERE b.forseelse_id = ${row.forseelse_id}
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

            statistikk.push({
                forseelseId: row.forseelse_id,
                forseelseNavn: row.forseelse_navn,
                antallBoter: parseInt(row.antall_boter),
                totaltBelop: Math.round(Number(row.totalt_belop)),
                innsamletBelop: Math.round(Number(row.innsamlet_belop)),
                spillerMedFlestBoter,
            })
        }

        return NextResponse.json(statistikk, { status: 200 })
    } catch (error) {
        console.error('Feil ved henting av statistikk:', error)
        return NextResponse.json({ error: 'Kunne ikke hente statistikk' }, { status: 500 })
    }
}
