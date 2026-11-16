import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextResponse } from 'next/server'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/auth/apiAuth.ts', () => ({ krevAdmin: vi.fn(), krevInnlogget: vi.fn() }))

import { sql } from '@vercel/postgres'
import { krevInnlogget } from '@/lib/auth/apiAuth.ts'
import { GET } from '@/app/api/utgifter/route.ts'
import { pgFeil, stilleFeillogg } from '@/app/api/spillere/testHjelpere.ts'

beforeEach(() => {
    vi.clearAllMocks()
})

describe('GET /api/utgifter', () => {
    it('returnerer 401 når ikke innlogget', async () => {
        vi.mocked(krevInnlogget).mockResolvedValue({ error: NextResponse.json({ error: 'x' }, { status: 401 }) })

        const respons = await GET()

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'x' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer utgifter med beløp som heltall', async () => {
        vi.mocked(krevInnlogget).mockResolvedValue({ user: { id: '1', type: 'bruker' } as never })
        vi.mocked(sql).mockResolvedValueOnce({
            rows: [{ utgift: 'Baller', beløp: '150.00', dato: '2026-11-01' }],
            rowCount: 1,
        } as never)

        const respons = await GET()

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual([{ utgift: 'Baller', beløp: 150, dato: '2026-11-01' }])
        expect(sql).toHaveBeenCalledTimes(1)
    })

    it('returnerer 500 med feilmelding ved databasefeil', async () => {
        vi.mocked(krevInnlogget).mockResolvedValue({ user: { id: '1', type: 'bruker' } as never })
        const feillogg = stilleFeillogg()
        vi.mocked(sql).mockRejectedValueOnce(pgFeil('42P01'))

        const respons = await GET()

        expect(respons.status).toBe(500)
        expect(await respons.json()).toEqual({ error: 'Kunne ikke hente utgifter.' })
        expect(feillogg).toHaveBeenCalledWith('Feil ved henting av utgifter', '42P01')
        feillogg.mockRestore()
    })
})
