import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import type { Spiller } from '@/lib/spillereService'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'
import dayjs from '@/lib/dayjs'

interface SpillerRow {
    id: number
    navn: string
    vis_navn: boolean
    draktnummer?: number
}

interface BotRow {
    id: number
    spiller_id: number
    beløp: number | string
    dato: string
    forseelse_id: number
    er_betalt: boolean
}

export async function GET(request: NextRequest) {
    const req = request.nextUrl.searchParams
    const medBoter: boolean = req.get('medBoter') == 'true'
    try {
        const spillereQuery = await sql<SpillerRow>`
            SELECT *, vis_navn
            FROM spillere
        `
        const spillere: Spiller[] = spillereQuery.rows.map((row) => ({
            id: String(row.id),
            navn: row.navn,
            visNavn: row.vis_navn,
            draktnummer: row.id, // ID er draktnummeret
            boter: [],
        }))

        if (medBoter) {
            const boterForAlleSpillereQuery = await sql<BotRow>`
                SELECT *
                from bøter
            `
            const alleBoter: Bot[] = boterForAlleSpillereQuery.rows.map((row) => ({
                id: String(row.id),
                spillerId: String(row.spiller_id),
                belop: Math.round(Number(row.beløp)),
                dato: dayjs(row.dato),
                forseelseId: String(row.forseelse_id),
                erBetalt: row.er_betalt,
            }))
            const spillereMedBoter: Spiller[] = spillere.map((s) => {
                return { ...s, boter: alleBoter.filter((bot) => bot.spillerId == s.id) }
            })
            return NextResponse.json({ spillere: spillereMedBoter }, { status: 200 })
        }

        return NextResponse.json({ spillere }, { status: 200 })
    } catch {
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
    } catch {
        return NextResponse.json({ error: 'Feil ved oppdatering av spiller' }, { status: 500 })
    }
}
