import { useRef, useState, useEffect } from 'react'

export const useAnimatedHeight = (isOpen: boolean, dependencies: any[]) => {
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
    }, [isOpen, ...dependencies])

    return { ref, height }
}
