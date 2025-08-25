import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import { UbetaltBotKort } from '@/komponenter/boter/BotKort.tsx'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

interface UbetalteBoterSeksjonProps {
    valgtSpiller: Spiller
    ubetalteBoter: Bot[]
    valgteBoter: Set<string>
    totalBelop: number
    erAlleValgt: boolean
    forseelser: Forseelse[]
    onBotToggle: (botId: string) => void
    onVelgToggle: () => void
    onMarkerBetalt: () => void
}

export const UbetalteBoterSeksjon = ({
    valgtSpiller,
    ubetalteBoter,
    valgteBoter,
    totalBelop,
    erAlleValgt,
    forseelser,
    onBotToggle,
    onVelgToggle,
    onMarkerBetalt,
}: UbetalteBoterSeksjonProps) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
            <div className="flex items-center justify-between">
                <Header size="small" text={`Ubetalte bøter for ${valgtSpiller.navn}`} />
                <button
                    onClick={onVelgToggle}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                >
                    {erAlleValgt ? 'Fjern alle' : 'Velg alle'}
                </button>
            </div>

            <div className="space-y-3">
                {ubetalteBoter.map((bot) => {
                    const forseelse = forseelser.find((f) => f.id.toString() === bot.forseelseId)
                    return (
                        <UbetaltBotKort
                            key={bot.id}
                            bot={bot}
                            forseelse={forseelse}
                            erValgt={valgteBoter.has(bot.id)}
                            onToggle={() => onBotToggle(bot.id)}
                        />
                    )
                })}
            </div>

            {valgteBoter.size > 0 && (
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                            <div className="font-semibold text-gray-900">
                                {valgteBoter.size} {valgteBoter.size === 1 ? 'bot' : 'bøter'} valgt
                            </div>
                            <div className="text-lg font-bold text-blue-600">Total: {totalBelop} kr</div>
                        </div>
                        <Knapp
                            tekst={`Marker ${valgteBoter.size === 1 ? 'bot' : 'bøter'} som betalt`}
                            onClick={onMarkerBetalt}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
