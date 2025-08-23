import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import type { Spiller } from '@/lib/spillereService'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

export async function GET(request: NextRequest) {
    const req = request.nextUrl.searchParams
    const medBoter: boolean = req.get('medBoter') == 'true'
    try {
        const spillereQuery = await sql<any>`
            SELECT *, vis_navn
            FROM spillere
        `
        const spillere: Spiller[] = spillereQuery.rows.map((row) => ({
            ...row,
            visNavn: typeof row.vis_navn === 'boolean' ? row.vis_navn : Boolean(row.vis_navn),
        }))

        if (medBoter) {
            const boterForAlleSpillereQuery = await sql`
                SELECT *
                from bøter
            `
            const alleBoter: Bot[] = boterForAlleSpillereQuery.rows.map((row) => ({
                id: row.id,
                spillerId: row.spiller_id,
                belop: Math.round(Number(row.beløp)),
                dato: row.dato,
                forseelseId: row.forseelse_id,
                erBetalt: row.er_betalt,
            }))
            const spillereMedBoter: Spiller[] = spillere.map((s) => {
                return { ...s, boter: alleBoter.filter((bot) => bot.spillerId == s.id), visNavn: s.visNavn }
            })
            return NextResponse.json({ spillere: spillereMedBoter }, { status: 200 })
        }

        return NextResponse.json({ spillere }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ error: 'Feil ved henting av spillere' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const { spiller_id, totalSum, erBetalt } = await request.json()

    try {
        if (!spiller_id || totalSum === undefined || erBetalt === undefined) {
            throw new Error('Draktnummer, totalsum og betalingsstatus kreves.')
        }

        // Oppdater spillerens totalSum og er_betalt felt
        const oppdatertSpiller = await sql`
            UPDATE spillere
            SET total_sum = ${totalSum}
            WHERE id = ${spiller_id}
            RETURNING *;
        `

        return NextResponse.json({ spiller: oppdatertSpiller.rows[0] }, { status: 200 })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Feil ved oppdatering av spiller' }, { status: 500 })
    }
}
