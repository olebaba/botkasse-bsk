import { useRef, useCallback } from 'react'
import type { Spiller } from '@/lib/spillereService'

export const useScrollToCard = (spillere: Spiller[], navbarHeight: number) => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    const scrollToSpiller = useCallback((spiller: Spiller) => {
        const idx = spillere.findIndex(s => s === spiller)
        if (idx !== -1 && cardRefs.current[idx]) {
            const el = cardRefs.current[idx]
            const rect = el?.getBoundingClientRect()
            const scrollTop = (window.scrollY ?? 0) + (rect?.top ?? 0) - navbarHeight - 16
            window.scrollTo({ top: scrollTop, behavior: 'smooth' })
        }
    }, [spillere, navbarHeight])

    return { cardRefs, scrollToSpiller }
}
