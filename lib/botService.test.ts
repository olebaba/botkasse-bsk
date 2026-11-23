import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { settBoterBetalt } from './botService'

describe('settBoterBetalt', () => {
    const fetchMock = vi.fn()

    beforeEach(() => {
        fetchMock.mockReset()
        vi.stubGlobal('fetch', fetchMock)
        vi.spyOn(console, 'error').mockImplementation(() => undefined)
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    it('sender botIder og eksplisitt betalingsstatus', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: 'ok' }), { status: 200 }))

        await settBoterBetalt(['1', '2'], false)

        expect(fetchMock).toHaveBeenCalledWith('/api/boter/betal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botIder: ['1', '2'], erBetalt: false }),
        })
    })

    it('kaster feil når serveren svarer med feil', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: 'x' }), { status: 400 }))

        await expect(settBoterBetalt(['1'], true)).rejects.toThrow('Kunne ikke markere bøter som betalt')
    })
})
