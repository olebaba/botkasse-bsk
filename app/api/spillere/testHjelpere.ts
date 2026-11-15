import { vi } from 'vitest'
import { NextResponse } from 'next/server'
import { krevAdmin } from '@/lib/auth/apiAuth.ts'

export const somAdmin = () => vi.mocked(krevAdmin).mockResolvedValue({ user: { id: '1', type: 'admin' } as never })

export const uten = (status: number) =>
    vi.mocked(krevAdmin).mockResolvedValue({ error: NextResponse.json({ error: 'x' }, { status }) })

export const lagRequest = (metode: string, body?: unknown, url = 'http://localhost/api/spillere') =>
    new Request(url, {
        method: metode,
        headers: { 'Content-Type': 'application/json' },
        body: typeof body === 'string' ? body : JSON.stringify(body),
    })

export const pgFeil = (kode: string) => Object.assign(new Error('databasefeil'), { code: kode })

export const stilleFeillogg = () => vi.spyOn(console, 'error').mockImplementation(() => undefined)

export const sqlTekst = (kall: unknown[]) => (kall[0] as TemplateStringsArray).join('?').replace(/\s+/g, ' ').trim()
