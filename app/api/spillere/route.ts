import { sql } from '@vercel/postgres'
import { NextRequest, NextResponse } from 'next/server'
import type { Spiller } from '@/lib/spillereService'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'
import dayjs from '@/lib/dayjs'
import { krevAdmin, krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { PG_FREMMEDNOKKEL_BRUDD, PG_UNIK_BRUDD, pgFeilkode } from '@/lib/pgFeil.ts'
import {
    finnSletteBlokkering,
    parseDraktnummerParam,
    sletteBlokkeringMelding,
    validerNySpiller,
    validerSpillerOppdatering,
    validerSumOppdatering,
} from '@/lib/spillerValidering.ts'

interface SpillerRow {
    id: number
    navn: string
    vis_navn: boolean
    draktnummer?: number
}

interface SletteKontrollRow {
    finnes: boolean
    antall_boter: number
    har_bruker: boolean
}

interface BotRow {
    id: number
    spiller_id: number
    beløp: number | string
    dato: string
    forseelse_id: number
    er_betalt: boolean
    kommentar?: string
}

const tilSpiller = (row: SpillerRow): Spiller => ({
    id: String(row.id),
    navn: row.navn,
    visNavn: row.vis_navn,
    draktnummer: row.id, // ID er draktnummeret
    boter: [],
})

const ugyldigForesporsel = () => NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })

const ikkeFunnet = (spillerId: number) =>
    NextResponse.json({ error: `Fant ikke spiller med draktnummer ${spillerId}.` }, { status: 404 })

const lesJson = async (request: Request): Promise<unknown | undefined> => {
    try {
        return await request.json()
    } catch {
        return undefined
    }
}

export async function GET(request: NextRequest) {
    const auth = await krevInnlogget()
    if ('error' in auth) return auth.error

    const req = request.nextUrl.searchParams
    const medBoter: boolean = req.get('medBoter') == 'true'
    try {
        const spillereQuery = await sql<SpillerRow>`
            SELECT *, vis_navn
            FROM spillere
        `
        const spillere: Spiller[] = spillereQuery.rows.map(tilSpiller)

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
                kommentar: row.kommentar,
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

export async function POST(request: Request) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    const body = await lesJson(request)
    if (body === undefined) {
        return ugyldigForesporsel()
    }

    const resultat = validerNySpiller(body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { draktnummer, navn } = resultat.verdi
    try {
        const { rows } = await sql<SpillerRow>`
            INSERT INTO spillere (id, navn, vis_navn, total_sum)
            VALUES (${draktnummer}, ${navn}, true, 0)
            RETURNING id, navn, vis_navn
        `
        return NextResponse.json({ spiller: tilSpiller(rows[0]) }, { status: 201 })
    } catch (error) {
        if (pgFeilkode(error) === PG_UNIK_BRUDD) {
            return NextResponse.json({ error: `Draktnummer ${draktnummer} er allerede i bruk.` }, { status: 409 })
        }
        console.error('Feil ved oppretting av spiller', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke legge til spiller.' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    const body = await lesJson(request)
    if (body === undefined) {
        return ugyldigForesporsel()
    }

    const resultat = validerSpillerOppdatering(body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { spillerId, navn, visNavn, nyttDraktnummer = spillerId } = resultat.verdi

    try {
        const { rows, rowCount } = await sql<SpillerRow>`
            UPDATE spillere
            SET id = ${nyttDraktnummer}, navn = ${navn}, vis_navn = ${visNavn}
            WHERE id = ${spillerId}
            RETURNING id, navn, vis_navn
        `
        if (rowCount === 0) {
            return ikkeFunnet(spillerId)
        }
        return NextResponse.json({ spiller: tilSpiller(rows[0]) }, { status: 200 })
    } catch (error) {
        if (pgFeilkode(error) === PG_UNIK_BRUDD) {
            return NextResponse.json({ error: `Draktnummer ${nyttDraktnummer} er allerede i bruk.` }, { status: 409 })
        }
        console.error('Feil ved oppdatering av spiller', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke oppdatere spiller.' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    const body = await lesJson(request)
    if (body === undefined) {
        return ugyldigForesporsel()
    }

    const resultat = validerSumOppdatering(body)
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { spillerId, totalSum } = resultat.verdi
    try {
        const { rows, rowCount } = await sql`
            UPDATE spillere
            SET total_sum = ${totalSum}
            WHERE id = ${spillerId}
            RETURNING *
        `
        if (rowCount === 0) {
            return ikkeFunnet(spillerId)
        }
        return NextResponse.json({ spiller: rows[0] }, { status: 200 })
    } catch (error) {
        console.error('Feil ved oppdatering av totalsum', pgFeilkode(error))
        return NextResponse.json({ error: 'Feil ved oppdatering av spiller' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    const auth = await krevAdmin()
    if ('error' in auth) return auth.error

    const resultat = parseDraktnummerParam(request.nextUrl.searchParams.get('spiller_id'))
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const spillerId = resultat.verdi
    try {
        // Ett statement (ikke sjekk, så slett) for å unngå kappløp med nye bøter eller brukerkoblinger.
        const { rowCount } = await sql`
            DELETE FROM spillere s
            WHERE s.id = ${spillerId}
              AND NOT EXISTS (SELECT 1 FROM bøter b WHERE b.spiller_id = s.id)
              AND NOT EXISTS (SELECT 1 FROM brukere u WHERE u.spiller_id = s.id)
            RETURNING s.id
        `
        if (rowCount === 1) {
            return NextResponse.json({ message: 'Spiller slettet.' }, { status: 200 })
        }

        const { rows } = await sql<SletteKontrollRow>`
            SELECT EXISTS (SELECT 1 FROM spillere WHERE id = ${spillerId}) AS finnes,
                   (SELECT COUNT(*) FROM bøter WHERE spiller_id = ${spillerId})::int AS antall_boter,
                   EXISTS (SELECT 1 FROM brukere WHERE spiller_id = ${spillerId}) AS har_bruker
        `
        const { finnes, antall_boter: antallBoter, har_bruker: harBruker } = rows[0]
        if (!finnes) {
            return ikkeFunnet(spillerId)
        }

        const blokkering = finnSletteBlokkering(antallBoter, harBruker)
        if (blokkering === null) {
            return NextResponse.json({ error: 'Spilleren kunne ikke slettes, prøv igjen.' }, { status: 409 })
        }
        return NextResponse.json({ error: sletteBlokkeringMelding[blokkering] }, { status: 409 })
    } catch (error) {
        if (pgFeilkode(error) === PG_FREMMEDNOKKEL_BRUDD) {
            return NextResponse.json({ error: sletteBlokkeringMelding.har_boter }, { status: 409 })
        }
        console.error('Feil ved sletting av spiller', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke slette spiller.' }, { status: 500 })
    }
}
