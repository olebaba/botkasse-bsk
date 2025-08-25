'use client'
import React, { useState } from 'react'
import type { Spiller } from '@/lib/spillereService.ts'
import SpillerCombobox from '@/komponenter/spillere/SpillerCombobox.tsx'

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
    const [søkeTerm, setSøkeTerm] = useState('')

    const filtrerteSpillere = spillere.filter(
        (spiller) =>
            spiller.navn.toLowerCase().includes(søkeTerm.toLowerCase()) ||
            spiller.draktnummer?.toString().includes(søkeTerm),
    )

    const handleVelgAlleFiltrerte = () => {
        const nyeSpillere = filtrerteSpillere
            .filter((spiller) => !valgteSpillere.includes(spiller.id))
            .map((spiller) => spiller.id)

        nyeSpillere.forEach((spillerId) => onSpillerToggleAction(spillerId))
    }

    const handleSpillerValgFraCombobox = (spiller: Spiller | undefined) => {
        if (spiller && !valgteSpillere.includes(spiller.id)) {
            onSpillerToggleAction(spiller.id)
        }
    }

    const valgteSpillerObjekter = spillere.filter((spiller) => valgteSpillere.includes(spiller.id))

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Velg spillere ({valgteSpillere.length} valgt)</h3>
            </div>

            <SpillerCombobox
                spillere={spillere.filter((spiller) => !valgteSpillere.includes(spiller.id))}
                onSpillerValgAction={handleSpillerValgFraCombobox}
                placeholder="Søk og legg til spiller..."
                label="Legg til spiller"
            />

            {valgteSpillere.length > 0 && (
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-gray-700 font-semibold">
                            Valgte spillere ({valgteSpillere.length})
                        </label>
                        <button
                            type="button"
                            onClick={onFjernAlleAction}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Fjern alle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 border border-gray-200 rounded-lg p-4 bg-gray-50">
                        {valgteSpillerObjekter.map((spiller) => (
                            <div
                                key={spiller.id}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                            >
                                <span className="text-sm font-medium">
                                    {spiller.navn}
                                    {spiller.draktnummer && (
                                        <span className="text-gray-500 ml-2 font-normal">#{spiller.draktnummer}</span>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => onSpillerToggleAction(spiller.id)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                                    title="Fjern spiller"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
                <button
                    type="button"
                    onClick={handleVelgAlleFiltrerte}
                    className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex-1 sm:flex-none"
                >
                    Velg alle ({filtrerteSpillere.length})
                </button>
            </div>
        </div>
    )
}
