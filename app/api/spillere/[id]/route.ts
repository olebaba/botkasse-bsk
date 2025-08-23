import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import type { BrukerInfo } from '@/app/api/bruker/route.ts'

export type SpillerInfo = {
    id: string
    navn: string
    visNavn: string
    totalSum: number
}

type Params = {
    id: string
    navn: string
}

export async function GET(_request: Request, props: { params: Promise<Params> }) {
    const params = await props.params
    const brukerId = params.id

    const brukerQuery = await sql<BrukerInfo>`
        SELECT *
        FROM brukere
        WHERE id = ${brukerId}
    `
    const brukerInfo = brukerQuery.rows[0]

    const spillerQuery = await sql<SpillerInfo>`
        SELECT *
        FROM spillere
        WHERE id = ${brukerInfo.spiller_id}
    `
    const spillerInfo: SpillerInfo = spillerQuery.rows[0]

    if (!spillerInfo) {
        console.error(`Fant ikke spiller med id ${brukerId}`)
    }

    return NextResponse.json(spillerInfo)
}

export async function POST(request: Request, props: { params: Promise<Params> }) {
    const params = await props.params
    const id = params.id

    const formData = await request.formData()
    const rawNavnVerdi = formData.get('Navn')
    const navn: string = rawNavnVerdi !== null && typeof rawNavnVerdi === 'string' ? rawNavnVerdi : ''
    const rawMobilnummerVerdi = formData.get('Mobilnummer')
    const mobilnummer: string =
        rawMobilnummerVerdi !== null && typeof rawMobilnummerVerdi === 'string' ? rawMobilnummerVerdi : ''

    const brukerQuery = await sql<BrukerInfo>`
        SELECT *
        FROM brukere
        WHERE id = ${id}
    `
    const brukerInfo = brukerQuery.rows[0]

    if (!brukerInfo) {
        console.error(`Fant ikke bruker med id ${id}`)
        return NextResponse.json(`Bruker med id ${id} ikke funnet.`, {
            status: 404,
        })
    }

    const spillerId = brukerInfo.spiller_id

    try {
        if (navn != '') {
            await sql`
                UPDATE spillere
                SET navn = ${navn}
                WHERE id = ${spillerId}
            `
        }

        if (brukerInfo.brukernavn != mobilnummer && mobilnummer != '') {
            await sql`
                UPDATE brukere
                SET brukernavn = ${mobilnummer}
                WHERE id = ${id}
            `
        }

        return NextResponse.json('Oppdatering vellykket.', { status: 200 })
    } catch (error) {
        console.error('Feil under oppdatering:', error)
        return NextResponse.json('Feil under oppdatering.', { status: 500 })
    }
}
