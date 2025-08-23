import { useRef, useState, useEffect } from 'react'

export const useAnimatedHeight = (isOpen: boolean, dependencies: any[]) => {
    const ref = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        if (isOpen && ref.current) {
            setHeight(ref.current.scrollHeight)
        } else {
            setHeight(0)
        }
    }, [isOpen, ...dependencies])

    return { ref, height }
}
