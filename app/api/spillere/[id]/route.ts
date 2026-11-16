import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { krevEierEllerAdmin } from '@/lib/auth/apiAuth.ts'
import { validerProfilOppdatering } from '@/lib/brukerValidering.ts'

type BrukerInfo = {
    id: string
    brukernavn: string
    spiller_id: string
}

export type SpillerInfo = {
    id: string
    navn: string
    visNavn: string
    totalSum: number
}

type Params = {
    id: string
}

const PG_UNIK_BRUDD = '23505'

const pgFeilkode = (error: unknown) => (error as { code?: string })?.code

const ikkeFunnet = () => NextResponse.json({ error: 'Fant ikke bruker.' }, { status: 404 })

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params
    const brukerId = params.id

    const auth = await krevEierEllerAdmin(brukerId)
    if ('error' in auth) return auth.error

    try {
        const brukerQuery = await sql<BrukerInfo>`
            SELECT id, brukernavn, spiller_id
            FROM brukere
            WHERE id = ${brukerId}
        `
        const brukerInfo = brukerQuery.rows[0]

        if (!brukerInfo) {
            return ikkeFunnet()
        }

        const spillerQuery = await sql<SpillerInfo>`
            SELECT id, navn, vis_navn, total_sum
            FROM spillere
            WHERE id = ${brukerInfo.spiller_id}
        `
        const spillerInfo: SpillerInfo | undefined = spillerQuery.rows[0]

        if (!spillerInfo) {
            return NextResponse.json({ error: 'Fant ikke spiller.' }, { status: 404 })
        }

        return NextResponse.json(spillerInfo)
    } catch (error) {
        console.error('Feil ved henting av spillerinfo', pgFeilkode(error))
        return NextResponse.json({ error: 'Kunne ikke hente spillerinfo.' }, { status: 500 })
    }
}

export async function POST(request: Request, props: { params: Promise<Params> }) {
    const params = await props.params
    const id = params.id

    const auth = await krevEierEllerAdmin(id)
    if ('error' in auth) return auth.error

    if (auth.user.type === 'gjest') {
        return NextResponse.json({ error: 'Gjester kan ikke endre profilen.' }, { status: 403 })
    }

    let formData: FormData
    try {
        formData = await request.formData()
    } catch {
        return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
    }

    const resultat = validerProfilOppdatering({
        navn: formData.get('Navn'),
        mobilnummer: formData.get('Mobilnummer'),
    })
    if (!resultat.ok) {
        return NextResponse.json({ error: resultat.feil }, { status: 400 })
    }

    const { navn, mobilnummer } = resultat.verdi

    try {
        // Ett statement slik at navn og brukernavn enten oppdateres sammen eller ikke i det hele tatt.
        const { rowCount } = await sql`
            WITH oppdatert_bruker AS (
                UPDATE brukere
                SET brukernavn = COALESCE(${mobilnummer}, brukernavn)
                WHERE id = ${id}
                RETURNING spiller_id
            )
            UPDATE spillere
            SET navn = COALESCE(${navn}, navn)
            WHERE id = (SELECT spiller_id FROM oppdatert_bruker)
        `
        if (rowCount === 0) {
            return ikkeFunnet()
        }

        return NextResponse.json('Oppdatering vellykket.', { status: 200 })
    } catch (error) {
        if (pgFeilkode(error) === PG_UNIK_BRUDD) {
            return NextResponse.json(
                { error: 'Kunne ikke oppdatere profilen. Prøv et annet mobilnummer.' },
                { status: 409 },
            )
        }
        console.error('Feil under oppdatering', pgFeilkode(error))
        return NextResponse.json({ error: 'Feil under oppdatering.' }, { status: 500 })
    }
}
