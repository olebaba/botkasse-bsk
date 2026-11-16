import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@vercel/postgres', () => ({ sql: vi.fn() }))
vi.mock('@/lib/queries.ts', () => ({ bulkInsert: vi.fn() }))

import { sql } from '@vercel/postgres'
import { GET } from '@/app/api/cron/route.ts'
import dayjs from '@/lib/dayjs.ts'

const lagRequest = (authorization?: string) =>
    new Request('http://localhost/api/cron', {
        headers: authorization === undefined ? {} : { Authorization: authorization },
    })

beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('CRON_SECRET', 'hemmelig')
    vi.mocked(sql).mockResolvedValue({ rows: [] } as never)
})

afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
})

describe('GET /api/cron', () => {
    it('returnerer 401 når Authorization mangler', async () => {
        const respons = await GET(lagRequest())

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'Ikke autorisert' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 401 ved feil hemmelighet', async () => {
        const respons = await GET(lagRequest('Bearer feil'))

        expect(respons.status).toBe(401)
        expect(await respons.json()).toEqual({ error: 'Ikke autorisert' })
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 401 når CRON_SECRET er tom', async () => {
        vi.stubEnv('CRON_SECRET', '')

        const respons = await GET(lagRequest('Bearer '))

        expect(respons.status).toBe(401)
        expect(sql).not.toHaveBeenCalled()
    })

    it('returnerer 401 når CRON_SECRET mangler', async () => {
        vi.stubEnv('CRON_SECRET', undefined as unknown as string)

        const respons = await GET(lagRequest('Bearer undefined'))

        expect(respons.status).toBe(401)
        expect(sql).not.toHaveBeenCalled()
    })

    it('slipper gjennom med riktig hemmelighet', async () => {
        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(dayjs('2026-11-01T12:00:00').toDate())

        const respons = await GET(lagRequest('Bearer hemmelig'))

        expect(respons.status).toBe(200)
        expect(await respons.json()).toEqual({ ok: true })
        expect(sql).toHaveBeenCalledTimes(2)
    })
})
