import { useState, useEffect } from 'react'
import { hentUtgifter, type Utgift } from '@/lib/utgiftService.ts'

export const useUtgifter = () => {
    const [utgifter, setUtgifter] = useState<Utgift[]>([])
    const [laster, setLaster] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const hent = async () => {
            try {
                setLaster(true)
                setUtgifter(await hentUtgifter())
            } catch (error) {
                setError('Feil ved henting av utgifter')
                console.error('Feil ved henting av utgifter:', error)
            } finally {
                setLaster(false)
            }
        }

        hent()
    }, [])

    return { utgifter, laster, error }
}
