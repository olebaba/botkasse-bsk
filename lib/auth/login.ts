import { sql } from '@vercel/postgres'
import { verify } from '@node-rs/argon2'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { type Bruker, lucia, type VercelPostgresError } from '@/lib/auth/authConfig.ts'

export async function login(formData: FormData): Promise<void> {
    'use server'

    const brukernavn = formData.get('brukernavn')
    if (
        typeof brukernavn !== 'string' ||
        brukernavn.length < 3 ||
        brukernavn.length > 31 ||
        !/^[a-z0-9_-]+$/.test(brukernavn)
    ) {
        throw new Error('Ugyldig brukernavn')
    }

    const passord = formData.get('passord')
    if (typeof passord !== 'string' || passord.length < 6 || passord.length > 255) {
        throw new Error('Ugyldig passord')
    }

    try {
        const existingUser = await sql<Bruker>`
            SELECT * FROM brukere WHERE brukernavn = ${brukernavn}
        `

        if (!existingUser.rows.length) {
            throw new Error('Feil brukernavn eller passord')
        }

        const typedBruker: Bruker = existingUser.rows[0]

        if (!typedBruker?.passord) {
            throw new Error('Feil brukernavn eller passord')
        }

        const validPassword = await verify(typedBruker.passord, passord)
        if (!validPassword) {
            throw new Error('Feil brukernavn eller passord')
        }

        const session = await lucia.createSession(typedBruker.id, {})
        const sessionCookie = lucia.createSessionCookie(session.id)
        const cookieStore = await cookies()
        cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)

    } catch (e) {
        console.error('Login feil:', e)
        throw new Error('Pålogging feilet')
    }

    redirect('/minside')
}
