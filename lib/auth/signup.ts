import { cookies } from 'next/headers'
import { hash } from '@node-rs/argon2'
import { sql } from '@vercel/postgres'
import { redirect } from 'next/navigation'
import { type ActionResult, type Bruker, lucia, type VercelPostgresError } from '@/lib/auth/authConfig.ts'
import { validateRequest } from '@/lib/auth/validateRequest.ts'

export async function signup(formData: FormData): Promise<ActionResult> {
    'use server'
    try {
        // Først logg ut eksisterende session (inkludert gjest)
        const { session: eksisterendeSession } = await validateRequest()
        if (eksisterendeSession) {
            await lucia.invalidateSession(eksisterendeSession.id)
            const blankCookie = lucia.createBlankSessionCookie()
            ;(await cookies()).set(blankCookie.name, blankCookie.value, blankCookie.attributes)
        }

        let brukernavn, passord

        try {
            ;({ brukernavn, passord } = validerBrukernavnOgPassord(formData))
        } catch (error) {
            console.error(error)
            return error as ActionResult
        }
        const passwordHash = await hash(passord, {
            memoryCost: 19456,
            timeCost: 2,
            outputLen: 32,
            parallelism: 1,
        })

        try {
            await sjekkBrukerFinnes(brukernavn)
        } catch (error) {
            console.error(error)
            return error as ActionResult
        }
        let spiller
        try {
            spiller = await sjekkDraktnummer(formData)
        } catch (error) {
            console.error(error)
            return error as ActionResult
        }

        const registrertBruker = await sql<Bruker>`
            INSERT INTO brukere (brukernavn, passord, spiller_id, type)
            VALUES (${brukernavn}, ${passwordHash}, ${spiller.id}, 'bruker')
            RETURNING *
        `
        const typedBruker = registrertBruker.rows[0]

        const session = await lucia.createSession(typedBruker.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    } catch (e) {
        const maybeVercelPostgresError = (typeof e === 'object' ? e : {}) as Partial<VercelPostgresError>

        console.error(maybeVercelPostgresError)
        return { error: 'En feil skjedde ved registrering, prøv igjen senere' }
    }
    redirect(`/minside`)
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
