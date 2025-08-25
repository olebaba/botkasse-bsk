import { useState, useEffect } from 'react'
import type { ForseelseStatistikk } from '@/app/api/statistikk/route'

const useGlobalStatistikk = () => {
    const [statistikk, setStatistikk] = useState<ForseelseStatistikk[] | null>(null)
    const [laster, setLaster] = useState(true)
    const [feil, setFeil] = useState<string | null>(null)

    useEffect(() => {
        const hentStatistikk = async () => {
            try {
                setLaster(true)
                const response = await fetch('/api/statistikk')

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
    }, [])

    return { statistikk, laster, feil }
}

export { useGlobalStatistikk }
export default useGlobalStatistikk
