import { useState, useEffect } from 'react'
import type { ForseelseStatistikk } from '@/app/api/statistikk/[forseelse_id]/route'
import { hentForseelseStatistikk } from '@/lib/statistikkService.ts'

export const useForseelseStatistikk = (forseelseId: string | null) => {
    const [statistikk, setStatistikk] = useState<ForseelseStatistikk | null>(null)
    const [laster, setLaster] = useState(false)
    const [feil, setFeil] = useState<string | null>(null)

    useEffect(() => {
        if (!forseelseId) {
            return
        }

        const hentStatistikk = async () => {
            try {
                setLaster(true)
                const data = await hentForseelseStatistikk(forseelseId)
                setStatistikk(data)
                setFeil(null)
            } catch (error) {
                setFeil(error instanceof Error ? error.message : 'Ukjent feil')
                setStatistikk(null)
            } finally {
                setLaster(false)
            }
        }

        hentStatistikk()
    }, [forseelseId])

    return { statistikk, laster, feil }
}
