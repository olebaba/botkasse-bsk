'use client'
import { useState, useEffect } from 'react'

const FAVORITT_SPILLER_KEY = 'favorittSpiller'

export const useFavorittSpiller = () => {
    const [favorittSpillerId, setFavorittSpillerId] = useState<string | null>(null)

    useEffect(() => {
        const lagretFavoritt = localStorage.getItem(FAVORITT_SPILLER_KEY)
        if (lagretFavoritt) {
            setFavorittSpillerId(lagretFavoritt)
        }
    }, [])

    const settFavorittSpiller = (spillerId: string | null) => {
        if (spillerId) {
            localStorage.setItem(FAVORITT_SPILLER_KEY, spillerId)
        } else {
            localStorage.removeItem(FAVORITT_SPILLER_KEY)
        }
        setFavorittSpillerId(spillerId)
    }

    const erFavoritt = (spillerId: string) => {
        return favorittSpillerId === spillerId
    }

    return {
        favorittSpillerId,
        settFavorittSpiller,
        erFavoritt,
    }
}
