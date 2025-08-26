import { useEffect, useState, useRef } from 'react'

export const useAnimertTelling = (målVerdi: number, varighet: number = 1500) => {
    const [gjeldendeTall, setGjeldendeTall] = useState(0)
    const animasjonsIdRef = useRef<number | null>(null)
    const mountedRef = useRef(false)

    useEffect(() => {
        if (!mountedRef.current) {
            mountedRef.current = true
        }

        // Stopp eksisterende animasjon
        if (animasjonsIdRef.current) {
            cancelAnimationFrame(animasjonsIdRef.current)
        }

        const startTid = Date.now()
        const startVerdi = gjeldendeTall

        const animasjon = () => {
            const forløptTid = Date.now() - startTid
            const fremgang = Math.min(forløptTid / varighet, 1)

            const easedFremgang = 1 - Math.pow(1 - fremgang, 3)
            const nyttTall = Math.floor(startVerdi + (målVerdi - startVerdi) * easedFremgang)

            setGjeldendeTall(nyttTall)

            if (fremgang < 1) {
                animasjonsIdRef.current = requestAnimationFrame(animasjon)
            } else {
                setGjeldendeTall(målVerdi)
                animasjonsIdRef.current = null
            }
        }

        // Start umiddelbart
        animasjonsIdRef.current = requestAnimationFrame(animasjon)

        return () => {
            if (animasjonsIdRef.current) {
                cancelAnimationFrame(animasjonsIdRef.current)
            }
        }
    }, [målVerdi, varighet, gjeldendeTall])

    return gjeldendeTall
}
