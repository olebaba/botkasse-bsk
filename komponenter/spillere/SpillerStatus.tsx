import React from 'react'
import type { Spiller } from '@/lib/spillereService.ts'

interface SpillerStatusProps {
    valgtSpiller: Spiller
    harUbetalteBoter: boolean
    harBetalteBoter: boolean
}

export const SpillerStatus = ({ valgtSpiller, harUbetalteBoter, harBetalteBoter }: SpillerStatusProps) => {
    if (harUbetalteBoter || !harBetalteBoter) return null

    if (!harUbetalteBoter && !harBetalteBoter) {
        return (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <div className="text-gray-600 font-medium">{valgtSpiller.navn} har ingen bøter registrert</div>
            </div>
        )
    }

    if (!harUbetalteBoter && harBetalteBoter) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-800 font-medium">🎉 {valgtSpiller.navn} har ingen ubetalt bøter!</div>
            </div>
        )
    }

    return null
}
