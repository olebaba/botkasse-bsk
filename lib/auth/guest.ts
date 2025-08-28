import { type ActionResult, type Bruker, lucia } from '@/lib/auth/authConfig.ts'
import { cookies } from 'next/headers'
import { sql } from '@vercel/postgres'
import { hash } from '@node-rs/argon2'
import { randomUUID } from 'node:crypto'
import { redirect } from 'next/navigation'

export async function guest(formData: FormData): Promise<ActionResult> {
    'use server'
    try {
        const guestCode = formData.get('Skriv inn kode')
        if (guestCode?.toString().toLowerCase() == process.env.GJESTEKODE?.toLowerCase()) {
            const passwordHash = await hash(randomUUID(), {
                memoryCost: 19456,
                timeCost: 2,
                outputLen: 32,
                parallelism: 1,
            })
            const gjestebruker = await sql<Bruker>`
                INSERT INTO brukere (brukernavn, passord, type)
                VALUES (${`guest_${randomUUID()}`}, ${passwordHash}, 'gjest')
                RETURNING *
            `
            const typedBruker = gjestebruker.rows[0]
            const session = await lucia.createSession(typedBruker.id, {})
            const sessionCookie = lucia.createSessionCookie(session.id)

            // Sett varighet på 1 år for gjestebruker
            const ettAar = 60 * 60 * 24 * 365 // sekunder
            sessionCookie.attributes.maxAge = ettAar
            sessionCookie.attributes.expires = new Date(Date.now() + ettAar * 1000)
            ;(await cookies()).set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
        } else {
            return { error: 'Feil kode oppgitt.' }
        }
    } catch (error) {
        console.error(`Klarte ikke lage gjestebruker: ${error}`)
        return { error: 'Klarte ikke lage gjestebruker, kontakt admin.' }
    }
    redirect('/')
}
