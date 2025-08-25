'use client'
import React, { useState } from 'react'
import type { Spiller } from '@/lib/spillereService.ts'

interface SpillerVelgerProps {
    spillere: Spiller[]
    valgteSpillere: string[]
    onSpillerToggleAction: (spillerId: string) => void
    onFjernAlleAction: () => void
}

export default function SpillerVelger({
    spillere,
    valgteSpillere,
    onSpillerToggleAction,
    onFjernAlleAction,
}: SpillerVelgerProps) {
    const [soketerm, setSoketerm] = useState('')

    const filtreteSpillere = spillere.filter(
        (spiller) =>
            spiller.navn.toLowerCase().includes(soketerm.toLowerCase()) ||
            spiller.draktnummer?.toString().includes(soketerm),
    )

    const handleVelgAlleFiltrerte = () => {
        const nyeSpillere = filtreteSpillere
            .filter((spiller) => !valgteSpillere.includes(spiller.id))
            .map((spiller) => spiller.id)

        nyeSpillere.forEach((spillerId) => onSpillerToggleAction(spillerId))
    }

    return (
        <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Velg spillere ({valgteSpillere.length} valgt)</label>

            <div className="mb-3">
                <input
                    type="text"
                    placeholder="Søk etter spiller..."
                    value={soketerm}
                    onChange={(e) => setSoketerm(e.target.value)}
                    className="border rounded px-3 py-2 w-full mb-2"
                />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <button
                    type="button"
                    onClick={handleVelgAlleFiltrerte}
                    className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 sm:flex-none"
                >
                    Velg alle ({filtreteSpillere.length})
                </button>
                <button
                    type="button"
                    onClick={onFjernAlleAction}
                    className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 flex-1 sm:flex-none"
                >
                    Fjern alle
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto border rounded p-3 bg-gray-50">
                {filtreteSpillere.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-4">Ingen spillere funnet</div>
                ) : (
                    filtreteSpillere.map((spiller) => (
                        <label
                            key={spiller.id}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded"
                        >
                            <input
                                type="checkbox"
                                checked={valgteSpillere.includes(spiller.id)}
                                onChange={() => onSpillerToggleAction(spiller.id)}
                                className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            <span className="text-sm flex-1">
                                {spiller.navn}
                                {spiller.draktnummer && (
                                    <span className="text-gray-500 ml-1">#{spiller.draktnummer}</span>
                                )}
                            </span>
                        </label>
                    ))
                )}
            </div>
        </div>
    )
}
