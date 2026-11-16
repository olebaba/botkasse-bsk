import { cookies } from 'next/headers'
import { hash } from '@node-rs/argon2'
import { sql } from '@vercel/postgres'
import { redirect } from 'next/navigation'
import { type ActionResult, type Bruker, lucia } from '@/lib/auth/authConfig.ts'

const PG_UNIK_BRUDD = '23505'
const REGISTRERING_AVVIST = 'Kunne ikke registrere bruker. Ta kontakt med admin.'

const pgFeilkode = (error: unknown) => (error as { code?: string })?.code

const feilmeldingFra = (error: unknown) => {
    const melding = (error as { error?: unknown } | null)?.error
    return typeof melding === 'string' ? melding : undefined
}

export async function signup(formData: FormData): Promise<ActionResult> {
    'use server'

    try {
        const { brukernavn, passord } = validerBrukernavnOgPassord(formData)

        await sjekkBrukerFinnes(brukernavn)
        const spiller = await sjekkDraktnummer(formData)
        await sjekkSpillerHarIkkeBruker(spiller.id)

        const passwordHash = await hash(passord, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        })

        const registrertBruker = await sql<Bruker>`
            INSERT INTO brukere (brukernavn, passord, spiller_id, type)
            VALUES (${brukernavn}, ${passwordHash}, ${spiller.id}, 'bruker')
            RETURNING *
        `
        const typedBruker = registrertBruker.rows[0]

        const session = await lucia.createSession(typedBruker.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        const cookieStore = await cookies()
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    } catch (e) {
        if (pgFeilkode(e) === PG_UNIK_BRUDD) {
            console.error('Signup feil:', PG_UNIK_BRUDD)
            return { error: REGISTRERING_AVVIST }
        }
        const melding = feilmeldingFra(e)
        if (melding) {
            return { error: melding }
        }
        console.error('Signup feil:', pgFeilkode(e))
        return { error: 'Registrering feilet, prøv igjen senere' }
    }

    redirect('/minside')
}

async function sjekkBrukerFinnes(brukernavn: string) {
    const eksisterendeBruker = await sql<Bruker>`
        SELECT *
        FROM brukere
        WHERE brukernavn = ${brukernavn}
    `
    if (eksisterendeBruker.rows[0]) {
        throw { error: 'Bruker finnes allerede' }
    }
}

async function sjekkSpillerHarIkkeBruker(spillerId: string) {
    const eksisterendeBruker = await sql`
        SELECT 1
        FROM brukere
        WHERE spiller_id = ${spillerId}
    `
    if (eksisterendeBruker.rows[0]) {
        throw { error: REGISTRERING_AVVIST }
    }
}

function validerBrukernavnOgPassord(formData: FormData): {
    brukernavn: string
    passord: string
} {
    const feilmelding = { error: 'Ugyldig brukernavn eller passord' }
    const brukernavn = formData.get('brukernavn')
    if (
        typeof brukernavn !== 'string' ||
        brukernavn.length < 5 ||
        brukernavn.length > 13 ||
        !/^\d+$/.test(brukernavn)
    ) {
        throw feilmelding
    }
    const passord = formData.get('passord')
    if (typeof passord !== 'string' || passord.length < 6 || passord.length > 255) {
        throw feilmelding
    }

    return { brukernavn, passord }
}

async function sjekkDraktnummer(formData: FormData): Promise<{ id: string; navn: string }> {
    const draktnummer = formData.get('draktnummer')
    if (typeof draktnummer !== 'string') {
        throw { error: 'Draktnummer er ikke gyldig' }
    }
    const eksisterendeSpiller = await sql<{ id: string; navn: string }>`
        SELECT id, navn
        FROM spillere
        WHERE id = ${draktnummer}
    `
    const spiller = eksisterendeSpiller.rows[0]

    if (spiller == undefined) {
        throw { error: 'Draktnummer finnes ikke. Ta kontakt med admin.' }
    }
    return spiller
}
