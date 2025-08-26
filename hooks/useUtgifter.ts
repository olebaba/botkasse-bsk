import { useState, useEffect } from 'react'

interface Utgift {
    utgift: string
    beløp: number
    dato: string
}

export const useUtgifter = () => {
    const [utgifter, setUtgifter] = useState<Utgift[]>([])
    const [laster, setLaster] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const hentUtgifter = async () => {
            try {
                setLaster(true)
                const response = await fetch('/api/utgifter')
                if (!response.ok) {
                    throw new Error('Kunne ikke hente utgifter')
                }
                const data = await response.json()
                setUtgifter(data)
            } catch (error) {
                setError('Feil ved henting av utgifter')
                console.error('Feil ved henting av utgifter:', error)
            } finally {
                setLaster(false)
            }
        }

        hentUtgifter()
    }, [])

    return { utgifter, laster, error }
}
