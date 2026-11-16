import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sql } from '@vercel/postgres'
import { bulkInsert } from '@/lib/queries.ts'

vi.mock('@vercel/postgres', () => ({ sql: { query: vi.fn() } }))

const bot = {
    spiller_id: '1',
    beløp: 50,
    forseelse_id: 7,
    dato: '2026-11-15',
}

describe('bulkInsert', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('setter inn poster i en hvitelistet tabell', async () => {
        await bulkInsert('bøter', [bot])

        expect(sql.query).toHaveBeenCalledTimes(1)
        expect(vi.mocked(sql.query).mock.calls[0].slice(1)).toEqual([[JSON.stringify([bot])]])
    })

    it('avviser tabeller som ikke er hvitelistet', async () => {
        await expect(bulkInsert('brukere' as 'bøter', [bot])).rejects.toThrow('Ugyldig tabell')
        expect(sql.query).not.toHaveBeenCalled()
    })

    it('avviser kolonner som ikke er hvitelistet', async () => {
        const ugyldig = { ...bot, passord: 'hemmelig' }
        await expect(bulkInsert('bøter', [ugyldig])).rejects.toThrow('Ugyldig kolonne')
        expect(sql.query).not.toHaveBeenCalled()
    })

    it('avviser hele batchen hvis én post har ukjent kolonne', async () => {
        const ugyldig = { ...bot, id: 99 }
        await expect(bulkInsert('bøter', [bot, ugyldig])).rejects.toThrow('Ugyldig kolonne')
        expect(sql.query).not.toHaveBeenCalled()
    })

    it('kaller ikke databasen ved tomme poster', async () => {
        await bulkInsert('bøter', [])
        expect(sql.query).not.toHaveBeenCalled()
    })

    it('logger ikke postene', async () => {
        const logg = vi.spyOn(console, 'log').mockImplementation(() => {})

        await bulkInsert('bøter', [bot])

        expect(logg).not.toHaveBeenCalled()
        logg.mockRestore()
    })
})
