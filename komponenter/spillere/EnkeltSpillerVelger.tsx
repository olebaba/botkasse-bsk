'use client'
import React from 'react'
import type { Spiller } from '@/lib/spillereService.ts'

interface EnkeltSpillerVelgerProps {
    spillere: Spiller[]
    valgtSpillerId?: string
    onSpillerValg: (spillerId: string | undefined) => void
}

const EnkeltSpillerVelger: React.FC<EnkeltSpillerVelgerProps> = ({ spillere, valgtSpillerId, onSpillerValg }) => {
    return (
        <div>
            <label htmlFor="spiller-select" className="block text-sm font-medium text-gray-700 mb-2">
                Velg spiller
            </label>
            <select
                id="spiller-select"
                value={valgtSpillerId ?? ''}
                onChange={(e) => onSpillerValg(e.target.value || undefined)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Ingen valgt</option>
                {spillere.map((spiller) => (
                    <option key={spiller.id} value={spiller.id}>
                        {spiller.navn}
                        {spiller.draktnummer ? ` (#${spiller.draktnummer})` : ''}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default EnkeltSpillerVelger
