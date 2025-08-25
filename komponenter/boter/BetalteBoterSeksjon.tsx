import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import { BetaltBotKort } from '@/komponenter/boter/BotKort.tsx'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

interface BetalteBoterSeksjonProps {
    valgtSpiller: Spiller
    betalteBoter: Bot[]
    visBetalteBøter: boolean
    forseelser: Forseelse[]
    onToggleVis: () => void
    onMarkerUbetalt: (botId: string) => void
}

export const BetalteBoterSeksjon = ({
    valgtSpiller,
    betalteBoter,
    visBetalteBøter,
    forseelser,
    onToggleVis,
    onMarkerUbetalt,
}: BetalteBoterSeksjonProps) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
                <Header size="small" text={`Betalte bøter for ${valgtSpiller.navn}`} />
                <button
                    onClick={onToggleVis}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                    {visBetalteBøter ? 'Skjul' : 'Vis'} betalte bøter ({betalteBoter.length})
                </button>
            </div>

            {visBetalteBøter && (
                <div className="space-y-3">
                    {betalteBoter.map((bot) => {
                        const forseelse = forseelser.find((f) => f.id.toString() === bot.forseelseId)
                        return (
                            <BetaltBotKort
                                key={bot.id}
                                bot={bot}
                                forseelse={forseelse}
                                onMarkerUbetalt={() => onMarkerUbetalt(bot.id)}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
