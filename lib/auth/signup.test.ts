import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@node-rs/argon2', () => ({ hash: vi.fn(async () => 'hashet') }))
vi.mock('next/headers', () => ({ cookies: vi.fn(async () => ({ set: vi.fn() })) }))
vi.mock('next/navigation', () => ({ redirect: vi.fn() }))
vi.mock('@/lib/auth/authConfig.ts', () => ({
    lucia: {
        createSession: vi.fn(async () => ({ id: 'sesjon' })),
        createSessionCookie: vi.fn(() => ({ name: 'auth', value: 'v', attributes: {} })),
    },
}))

import { sql } from '@vercel/postgres'
import { redirect } from 'next/navigation'
import { signup } from '@/lib/auth/signup.ts'

const skjema = (draktnummer = '7') => {
    const formData = new FormData()
    formData.set('brukernavn', '12345678')
    formData.set('passord', 'hemmelig')
    formData.set('draktnummer', draktnummer)
    return formData
}

const rader = (...rows: object[]) => ({ rows }) as never

const sqlTekster = () => vi.mocked(sql).mock.calls.map(([strenger]) => strenger.join('?'))

beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('signup', () => {
    it('oppretter bruker og sender videre til minside', async () => {
        vi.mocked(sql)
            .mockResolvedValueOnce(rader())
            .mockResolvedValueOnce(rader({ id: '7', navn: 'Ola' }))
            .mockResolvedValueOnce(rader())
            .mockResolvedValueOnce(rader({ id: 'b1' }))

        await signup(skjema())

        expect(sql).toHaveBeenCalledTimes(4)
        expect(redirect).toHaveBeenCalledWith('/minside')
    })

    it('avviser spiller som allerede har en bruker uten å sette inn ny', async () => {
        vi.mocked(sql)
            .mockResolvedValueOnce(rader())
            .mockResolvedValueOnce(rader({ id: '7', navn: 'Ola' }))
            .mockResolvedValueOnce(rader({ '?column?': 1 }))

        const resultat = await signup(skjema())

        expect(resultat).toEqual({ error: 'Kunne ikke registrere bruker. Ta kontakt med admin.' })
        expect(sqlTekster().some((tekst) => tekst.includes('INSERT'))).toBe(false)
        expect(redirect).not.toHaveBeenCalled()
    })

    it('avviser brukernavn som finnes fra før', async () => {
        vi.mocked(sql).mockResolvedValueOnce(rader({ id: 'b1' }))

        const resultat = await signup(skjema())

        expect(resultat).toEqual({ error: 'Bruker finnes allerede' })
        expect(sql).toHaveBeenCalledTimes(1)
    })

    it('svarer pent og logger bare feilkoden ved unikt brudd', async () => {
        vi.mocked(sql)
            .mockResolvedValueOnce(rader())
            .mockResolvedValueOnce(rader({ id: '7', navn: 'Ola' }))
            .mockResolvedValueOnce(rader())
            .mockRejectedValueOnce({ code: '23505', detail: 'Key (spiller_id)=(7) already exists.' })

        const resultat = await signup(skjema())

        expect(resultat).toEqual({ error: 'Kunne ikke registrere bruker. Ta kontakt med admin.' })
        expect(console.error).toHaveBeenCalledWith('Signup feil:', '23505')
        expect(redirect).not.toHaveBeenCalled()
    })

    it('svarer generelt og logger bare feilkoden ved andre databasefeil', async () => {
        vi.mocked(sql).mockRejectedValueOnce({ code: '08006', detail: 'hemmelig' })

        const resultat = await signup(skjema())

        expect(resultat).toEqual({ error: 'Registrering feilet, prøv igjen senere' })
        expect(console.error).toHaveBeenCalledWith('Signup feil:', '08006')
    })

    it('returnerer valideringsfeil for ugyldig draktnummer uten databasekall utover brukersjekk', async () => {
        vi.mocked(sql).mockResolvedValueOnce(rader())
        const formData = skjema()
        formData.delete('draktnummer')

        const resultat = await signup(formData)

        expect(resultat).toEqual({ error: 'Draktnummer er ikke gyldig' })
        expect(sql).toHaveBeenCalledTimes(1)
    })
})
