import { useEffect, useState, useRef } from 'react'

let globalAnimationStarted = false

export const useAnimertTelling = (målVerdi: number, varighet: number = 1500) => {
    const [visningsVerdi, setVisningsVerdi] = useState(0)
    const animasjonsIdRef = useRef<NodeJS.Timeout | null>(null)

    // Start animasjonen umiddelbart ved første hook-kall
    if (!globalAnimationStarted && målVerdi > 0) {
        globalAnimationStarted = true

        const startTid = Date.now()

        const animasjon = () => {
            const forløptTid = Date.now() - startTid
            const fremgang = Math.min(forløptTid / varighet, 1)

            const easedFremgang = 1 - Math.pow(1 - fremgang, 3)
            const nyttTall = Math.floor(målVerdi * easedFremgang)

            setVisningsVerdi(nyttTall)

            if (fremgang < 1) {
                setTimeout(animasjon, 16)
            } else {
                setVisningsVerdi(målVerdi)
            }
        }

        // Start umiddelbart uten timeout
        animasjon()
    }

    useEffect(() => {
        if (animasjonsIdRef.current) {
            clearTimeout(animasjonsIdRef.current)
        }

        const startTid = Date.now()
        const startVerdi = visningsVerdi

        const animasjon = () => {
            const forløptTid = Date.now() - startTid
            const fremgang = Math.min(forløptTid / varighet, 1)

            const easedFremgang = 1 - Math.pow(1 - fremgang, 3)
            const nyttTall = Math.floor(startVerdi + (målVerdi - startVerdi) * easedFremgang)

            setVisningsVerdi(nyttTall)

            if (fremgang < 1) {
                animasjonsIdRef.current = setTimeout(animasjon, 16)
            } else {
                setVisningsVerdi(målVerdi)
            }
        }

        animasjonsIdRef.current = setTimeout(animasjon, 0)

        return () => {
            if (animasjonsIdRef.current) {
                clearTimeout(animasjonsIdRef.current)
            }
        }
    }, [målVerdi, varighet, visningsVerdi])

    return visningsVerdi
}
