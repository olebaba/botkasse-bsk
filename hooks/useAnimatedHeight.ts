import { useRef, useState, useEffect } from 'react'

export const useAnimatedHeight = <T = unknown>(isOpen: boolean, dependencies: T[]) => {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (ref.current) {
            if (isOpen) {
                // Force a reflow to ensure accurate measurement
                ref.current.style.height = 'auto'
                setHeight(ref.current.scrollHeight)
            } else {
                setHeight(0)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, ...dependencies])

    return { ref, height }
}
