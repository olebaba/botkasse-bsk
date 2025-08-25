import { useState, useEffect } from 'react'
import type { ForseelseStatistikk } from '@/app/api/statistikk/[forseelse_id]/route'

export const useForseelseStatistikk = (forseelseId: string | null) => {
    const [statistikk, setStatistikk] = useState<ForseelseStatistikk | null>(null)
    const [laster, setLaster] = useState(false)
    const [feil, setFeil] = useState<string | null>(null)

    useEffect(() => {
        if (!forseelseId) {
            setStatistikk(null)
            setLaster(false)
            setFeil(null)
            return
        }

        const hentStatistikk = async () => {
            try {
                setLaster(true)
                const response = await fetch(`/api/statistikk/${forseelseId}`)

                if (!response.ok) {
                    setFeil('Kunne ikke hente statistikk')
                    setStatistikk(null)
                    return
                }

                const data = await response.json()
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
