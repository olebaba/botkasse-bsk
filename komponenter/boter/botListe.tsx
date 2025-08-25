import React, { useState } from 'react'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import dayjs from '@/lib/dayjs.ts'
import Header from '@/komponenter/ui/Header'

interface BotListeProps {
    forseelser: Forseelse[]
}

export const BotListe = ({ forseelser }: BotListeProps) => {
    const sorterOppdatert = () => {
        return forseelser.toSorted((a: Forseelse, b: Forseelse) => b.oppdatert.localeCompare(a.oppdatert))
    }

    if (forseelser.length === 0) {
        return (
            <div className="w-full mt-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
                <Header size="medium" text="Ingen forseelser funnet" className="text-gray-500" />
            </div>
        )
    }

    return (
        <div className="w-full mt-6">
            <div className="space-y-3">
                {sorterOppdatert().map((forseelse) => (
                    <ForseelseKort key={forseelse.id} forseelse={forseelse} />
                ))}
            </div>
        </div>
    )
}

interface ForseelseKortProps {
    forseelse: Forseelse
}

const ForseelseKort = ({ forseelse }: ForseelseKortProps) => {
    const [erUtvidet, setErUtvidet] = useState(false)
    const erNy = dayjs(forseelse.oppdatert) > dayjs().subtract(2, 'weeks')

    const firstSpaceIndex = forseelse.navn.indexOf(' ')
    const emoji = firstSpaceIndex > 0 ? forseelse.navn.slice(0, firstSpaceIndex) : forseelse.navn
    const tittel = firstSpaceIndex > 0 ? forseelse.navn.slice(firstSpaceIndex + 1) : ''

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
            <div className="p-4 cursor-pointer" onClick={() => setErUtvidet(!erUtvidet)}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="text-2xl flex-shrink-0">{emoji}</div>
                            <Header size="small" text={tittel} className="text-gray-900 flex-1" as="h3" />
                            {erNy && (
                                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 flex-shrink-0">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></div>
                                    Ny
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg px-3 py-2 border border-red-200">
                            <div className="flex items-baseline">
                                <div className="text-xl font-bold text-red-800">
                                    {forseelse.beløp.toLocaleString('nb-NO')}
                                </div>
                                <div className="ml-1 text-sm text-red-600 font-medium">kr</div>
                            </div>
                        </div>

                        <button
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            aria-label={erUtvidet ? 'Skjul detaljer' : 'Vis detaljer'}
                        >
                            <svg
                                className={`w-5 h-5 transition-transform duration-200 ${erUtvidet ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {erUtvidet && (
                <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="pt-3 space-y-3">
                        <div className="text-gray-600 leading-relaxed">{forseelse.beskrivelse}</div>
                        <div className="text-sm text-gray-500">
                            Sist oppdatert: {dayjs(forseelse.oppdatert).format('DD.MM.YYYY')}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
