'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react'
import type { Spiller } from '@/lib/spillereService.ts'

interface SpillerComboboxProps {
    spillere: Spiller[]
    valgtSpiller?: Spiller
    onSpillerValgAction: (spiller: Spiller | undefined) => void
    placeholder?: string
    label?: string
    className?: string
}

export default function SpillerCombobox({
    spillere,
    valgtSpiller,
    onSpillerValgAction,
    placeholder = 'Søk og velg spiller...',
    label = 'Velg spiller',
    className = '',
}: SpillerComboboxProps) {
    const [søkeTerm, setSøkeTerm] = useState('')
    const [erÅpen, setErÅpen] = useState(false)
    const [fokusertIndeks, setFokusertIndeks] = useState(-1)
    const inputRef = useRef<HTMLInputElement>(null)
    const listeRef = useRef<HTMLUListElement>(null)

    const filtrerteSpillere = useMemo(() => {
        if (!søkeTerm) return spillere
        return spillere.filter(
            (spiller) =>
                spiller.navn.toLowerCase().includes(søkeTerm.toLowerCase()) ||
                spiller.draktnummer?.toString().includes(søkeTerm),
        )
    }, [spillere, søkeTerm])

    const displayVerdi = valgtSpiller
        ? `${valgtSpiller.navn}${valgtSpiller.draktnummer ? ` (#${valgtSpiller.draktnummer})` : ''}`
        : søkeTerm

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const verdi = e.target.value
        setSøkeTerm(verdi)
        setErÅpen(true)
        setFokusertIndeks(-1)

        if (!verdi && valgtSpiller) {
            onSpillerValgAction(undefined)
        }
    }

    const handleSpillerValg = (spiller: Spiller) => {
        onSpillerValgAction(spiller)
        setSøkeTerm('')
        setErÅpen(false)
        setFokusertIndeks(-1)
    }

    const handleInputFocus = () => {
        setErÅpen(true)
    }

    const handleInputBlur = () => {
        // Kort delay for å tillate klikk på liste-elementer
        setTimeout(() => {
            setErÅpen(false)
            setFokusertIndeks(-1)
            if (!valgtSpiller) {
                setSøkeTerm('')
            }
        }, 150)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!erÅpen) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setFokusertIndeks((prev) => (prev < filtrerteSpillere.length - 1 ? prev + 1 : prev))
                break
            case 'ArrowUp':
                e.preventDefault()
                setFokusertIndeks((prev) => (prev > 0 ? prev - 1 : -1))
                break
            case 'Enter':
                e.preventDefault()
                if (fokusertIndeks >= 0 && filtrerteSpillere[fokusertIndeks]) {
                    handleSpillerValg(filtrerteSpillere[fokusertIndeks])
                }
                break
            case 'Escape':
                setErÅpen(false)
                setFokusertIndeks(-1)
                inputRef.current?.blur()
                break
        }
    }

    useEffect(() => {
        if (fokusertIndeks >= 0 && listeRef.current) {
            const element = listeRef.current.children[fokusertIndeks] as HTMLElement
            element?.scrollIntoView({ block: 'nearest' })
        }
    }, [fokusertIndeks])

    return (
        <div className={`relative ${className}`}>
            <label className="block text-gray-700 font-semibold mb-2">{label}</label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={displayVerdi}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    autoComplete="off"
                />

                {erÅpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filtrerteSpillere.length > 0 ? (
                            <ul ref={listeRef} className="py-1">
                                {filtrerteSpillere.map((spiller, indeks) => (
                                    <li
                                        key={spiller.id}
                                        className={`px-4 py-3 cursor-pointer transition-colors ${
                                            indeks === fokusertIndeks ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-50'
                                        } ${
                                            valgtSpiller?.id === spiller.id
                                                ? 'bg-blue-100 text-blue-900 font-medium'
                                                : ''
                                        }`}
                                        onMouseDown={() => handleSpillerValg(spiller)}
                                        onMouseEnter={() => setFokusertIndeks(indeks)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">{spiller.navn}</span>
                                            <span className="text-gray-500 text-sm">#{spiller.draktnummer}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="px-4 py-3 text-gray-500 text-center">Ingen spillere funnet</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
