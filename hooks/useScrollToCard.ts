import { useRef, useCallback } from 'react'
import type { Spiller } from '@/lib/spillereService'

export const useScrollToCard = (spillere: Spiller[], navbarHeight: number) => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([])
    const spillereRef = useRef(spillere)
    spillereRef.current = spillere

    const scrollToSpiller = useCallback(
        (spiller: Spiller) => {
            // Find the spiller in the current spillere array at scroll time
            const idx = spillereRef.current.findIndex((s) => s === spiller)
            if (idx !== -1 && cardRefs.current[idx]) {
                const el = cardRefs.current[idx]
                const rect = el?.getBoundingClientRect()
                const scrollTop = (window.scrollY ?? 0) + (rect?.top ?? 0) - (navbarHeight + 10)
                window.scrollTo({ top: scrollTop, behavior: 'smooth' })
            }
        },
        [navbarHeight],
    )

    return { cardRefs, scrollToSpiller }
}
