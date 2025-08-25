import React, { useState, useEffect, useRef } from 'react'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import { useForseelseStatistikk } from '@/hooks/useForseelseStatistikk'
import dayjs from '@/lib/dayjs.ts'
import Header from '@/komponenter/ui/Header'
import {
    hentKortAnimasjonsklasser,
    hentEmojiAnimasjonsklasser,
    hentDotAnimasjonsklasser,
    hentTekstKlasser,
} from '@/lib/animasjoner'

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
    const [bounceAnimation, setBounceAnimation] = useState(false)
    const [pingAnimation, setPingAnimation] = useState(false)
    const forseelseStatistikk = useForseelseStatistikk(erUtvidet ? forseelse.id : null)
    const erNy = dayjs(forseelse.oppdatert) > dayjs().subtract(2, 'weeks')
    const bounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const pingTimeout = useRef<NodeJS.Timeout | null>(null)

    const firstSpaceIndex = forseelse.navn.indexOf(' ')
    const emoji = firstSpaceIndex > 0 ? forseelse.navn.slice(0, firstSpaceIndex) : forseelse.navn
    const tittel = firstSpaceIndex > 0 ? forseelse.navn.slice(firstSpaceIndex + 1) : ''

    useEffect(() => {
        if (erNy) {
            setBounceAnimation(true)
            setPingAnimation(true)

            if (bounceTimeout.current) {
                clearTimeout(bounceTimeout.current)
            }
            if (pingTimeout.current) {
                clearTimeout(pingTimeout.current)
            }

            bounceTimeout.current = setTimeout(() => {
                setBounceAnimation(false)
            }, 3000)

            pingTimeout.current = setTimeout(() => {
                setPingAnimation(false)
            }, 3000)
        }
    }, [erNy])

    return (
        <div
            className={`rounded-lg shadow-sm border transition-all duration-200 overflow-hidden hover:shadow-md relative ${hentKortAnimasjonsklasser(erNy)}`}
        >
            {erNy && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20 animate-pulse pointer-events-none"></div>
            )}
            <div className="p-4 cursor-pointer relative z-10" onClick={() => setErUtvidet(!erUtvidet)}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-3 mb-1">
                            <div
                                className={`text-2xl flex-shrink-0 relative ${hentEmojiAnimasjonsklasser(erNy, bounceAnimation)}`}
                            >
                                {emoji}
                                {erNy && (
                                    <div
                                        className={`absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg ${hentDotAnimasjonsklasser(pingAnimation)}`}
                                    ></div>
                                )}
                            </div>
                            <Header size="small" text={tittel} className={`flex-1 ${hentTekstKlasser(erNy)}`} as="h3" />
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
                    <div className="pt-3 space-y-4">
                        <div className="text-gray-600 leading-relaxed">{forseelse.beskrivelse}</div>
                        <div className="text-sm text-gray-500">
                            Sist oppdatert: {dayjs(forseelse.oppdatert).format('DD.MM.YYYY')}
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <Header size="small" text="Statistikk" className="text-gray-800 mb-3" as="h4" />
                            {forseelseStatistikk.laster ? (
                                <div className="text-center text-gray-500 py-2">Laster statistikk...</div>
                            ) : forseelseStatistikk.feil ? (
                                <div className="text-center text-red-500 py-2">Kunne ikke laste statistikk</div>
                            ) : forseelseStatistikk.statistikk ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-white rounded-lg p-3 border border-blue-200">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-blue-700">
                                                {forseelseStatistikk.statistikk.antallBoter}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium">Antall bøter</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-red-200">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-red-700">
                                                {forseelseStatistikk.statistikk.totaltBelop.toLocaleString('nb-NO')}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium">Total (kr)</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-green-200">
                                        <div className="text-center">
                                            <div className="text-xl font-bold text-green-700">
                                                {forseelseStatistikk.statistikk.innsamletBelop.toLocaleString('nb-NO')}
                                            </div>
                                            <div className="text-xs text-gray-600 font-medium">Innsamlet (kr)</div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-orange-200">
                                        <div className="text-center">
                                            {forseelseStatistikk.statistikk.spillerMedFlestBoter ? (
                                                <>
                                                    <div className="text-sm font-bold text-orange-700">
                                                        {forseelseStatistikk.statistikk.spillerMedFlestBoter.navn}
                                                    </div>
                                                    <div className="text-xs text-gray-600 font-medium">
                                                        Flest (
                                                        {
                                                            forseelseStatistikk.statistikk.spillerMedFlestBoter
                                                                .antallBoter
                                                        }
                                                        )
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-sm font-bold text-gray-500">-</div>
                                                    <div className="text-xs text-gray-600 font-medium">Ingen bøter</div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 py-2">Ingen statistikk tilgjengelig</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
