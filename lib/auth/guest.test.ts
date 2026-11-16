import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('next/headers', () => ({ cookies: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@node-rs/argon2', () => ({ hash: vi.fn() }))
vi.mock('@/lib/auth/authConfig.ts', () => ({
    lucia: {
        createSession: vi.fn(),
        createSessionCookie: vi.fn(),
    },
}))

import { sql } from '@vercel/postgres'
import { cookies } from 'next/headers'
import { hash } from '@node-rs/argon2'
import { lucia } from '@/lib/auth/authConfig.ts'
import { guest } from '@/lib/auth/guest.ts'

const lagFormData = (kode: string | null) => {
    const formData = new FormData()
    if (kode !== null) formData.set('Skriv inn kode', kode)
    return formData
}

beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('GJESTEKODE', 'Hemmelig')
})

afterEach(() => {
    vi.unstubAllEnvs()
})

describe('guest', () => {
    it('avviser feil kode', async () => {
        const resultat = await guest(lagFormData('feil'))

        expect(resultat).toEqual({ error: 'Feil kode oppgitt.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('avviser manglende kode', async () => {
        const resultat = await guest(lagFormData(null))

        expect(resultat).toEqual({ error: 'Feil kode oppgitt.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('avviser tom kode når GJESTEKODE er tom', async () => {
        vi.stubEnv('GJESTEKODE', '')

        const resultat = await guest(lagFormData(''))

        expect(resultat).toEqual({ error: 'Feil kode oppgitt.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('avviser når GJESTEKODE mangler', async () => {
        vi.stubEnv('GJESTEKODE', undefined as unknown as string)

        const resultat = await guest(lagFormData(''))

        expect(resultat).toEqual({ error: 'Feil kode oppgitt.' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('godtar riktig kode uavhengig av store og små bokstaver', async () => {
        vi.mocked(hash).mockResolvedValue('passordhash')
        vi.mocked(sql).mockResolvedValue({ rows: [{ id: 'gjest-id' }] } as never)
        vi.mocked(lucia.createSession).mockResolvedValue({ id: 'sesjon-id' } as never)
        vi.mocked(lucia.createSessionCookie).mockReturnValue({
            name: 'auth_session',
            value: 'sesjon-id',
            attributes: {},
        } as never)
        const sett = vi.fn()
        vi.mocked(cookies).mockResolvedValue({ set: sett } as never)

        await guest(lagFormData('hEMMELIG'))

        expect(sql).toHaveBeenCalledTimes(1)
        expect(lucia.createSession).toHaveBeenCalledWith('gjest-id', {})
        expect(sett).toHaveBeenCalledWith(
            'auth_session',
            'sesjon-id',
            expect.objectContaining({ maxAge: 60 * 60 * 24 * 365 }),
        )
    })
})
