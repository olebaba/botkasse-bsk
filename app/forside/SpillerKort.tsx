import React, { useMemo, useCallback, useState } from 'react'
import {
    beregnSumBetaltForSesong,
    beregnSumMaaBetalesForSesong,
    beregnSumNyeBoterForSesong,
    beregnSum,
    hentTilgjengeligeSesonger,
    filtrerBoterForSpesifikkSesong,
    hentSesongTekst,
} from '@/lib/botBeregning'
import { ListBoter } from '@/komponenter/boter/ListBoter'
import type { Spiller } from '@/lib/spillereService'
import type { Forseelse } from '@/app/api/boter/typer/route'
import dayjs from '@/lib/dayjs.ts'

interface SpillerKortProps {
    spiller: Spiller
    cardRef: (el: HTMLDivElement | null) => void
    merInfoOpen: boolean
    setMerInfoSpiller: (s: Spiller | undefined) => void
    setSpillerVipps: (s: Spiller) => void
    forseelser: Forseelse[]
    visAlleSesonger: boolean
}

const SpillerKort: React.FC<SpillerKortProps> = ({
    spiller,
    cardRef,
    merInfoOpen,
    setMerInfoSpiller,
    setSpillerVipps,
    forseelser,
    visAlleSesonger,
}) => {
    const [valgdSesong, setValgdSesong] = useState<string>('')

    const tilgjengeligeSesonger = useMemo(() => {
        return hentTilgjengeligeSesonger(spiller.boter || [])
    }, [spiller.boter])

    const botStatistikk = useMemo(() => {
        const boter = spiller.boter
        if (!boter) return { maaBetales: 0, nyeBoter: 0, alleBetalt: false, sumAlle: 0, sumBetalt: 0 }

        const maaBetales = beregnSumMaaBetalesForSesong(boter, visAlleSesonger)

        return {
            maaBetales,
            nyeBoter: beregnSumNyeBoterForSesong(boter, visAlleSesonger),
            alleBetalt: maaBetales === 0, // Alle påkrevde bøter er betalt hvis summen som må betales er 0
            sumAlle: beregnSum(boter), // Alltid vis alle bøter uansett sesong
            sumBetalt: beregnSumBetaltForSesong(boter, visAlleSesonger),
        }
    }, [spiller.boter, visAlleSesonger])

    const valgdSesongStatistikk = useMemo(() => {
        if (!valgdSesong || !spiller.boter) return null

        const filtrerteBoter = filtrerBoterForSpesifikkSesong(spiller.boter, valgdSesong)
        return {
            sumAlle: filtrerteBoter.reduce((sum, bot) => sum + Number(bot.belop), 0),
            sumBetalt: filtrerteBoter.filter((bot) => bot.erBetalt).reduce((sum, bot) => sum + Number(bot.belop), 0),
            antallBoter: filtrerteBoter.length,
        }
    }, [spiller.boter, valgdSesong])

    const getKortKlasser = useCallback(() => {
        const base = 'rounded shadow border p-4 flex flex-col gap-2 transition-all duration-600'
        const bakgrunn = botStatistikk.alleBetalt ? 'bg-green-100' : 'bg-red-200'
        const ring = merInfoOpen ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300 cursor-pointer'

        return `${base} ${bakgrunn} ${ring}`
    }, [botStatistikk.alleBetalt, merInfoOpen])

    const getStatusKnappKlasser = useCallback(() => {
        const base = 'text-xs px-2 py-1 rounded mt-2 md:mt-0'
        const variant = merInfoOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'

        return `${base} ${variant}`
    }, [merInfoOpen])

    const handleToggleInfo = useCallback(() => {
        setMerInfoSpiller(merInfoOpen ? undefined : spiller)
    }, [merInfoOpen, setMerInfoSpiller, spiller])

    const handleVippsBetaling = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            setSpillerVipps(spiller)
        },
        [setSpillerVipps, spiller],
    )

    const denneMaaneden = dayjs().format('MMMM')
    const nesteManed = dayjs().add(1, 'month').format('MMMM')

    return (
        <div ref={cardRef} className={getKortKlasser()}>
            <div
                className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between cursor-pointer"
                onClick={handleToggleInfo}
                tabIndex={0}
                role="button"
                aria-pressed={merInfoOpen}
                aria-expanded={merInfoOpen}
            >
                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                    <h3 className="font-semibold text-lg">{spiller.navn}</h3>
                    <div className="flex flex-col md:flex-row md:gap-4">
                        <span>
                            <span className="font-medium">Må betales innen slutten av {nesteManed}:</span>{' '}
                            {botStatistikk.maaBetales} kr
                        </span>
                        <span>
                            <span className="font-medium">Nye bøter i {denneMaaneden}:</span> {botStatistikk.nyeBoter}{' '}
                            kr
                        </span>
                    </div>
                </div>
                <span className={getStatusKnappKlasser()}>{merInfoOpen ? 'Åpen' : 'Trykk for mer info'}</span>
            </div>

            {merInfoOpen && (
                <div className="mt-2 bg-yellow-50 rounded p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-2 space-y-1">
                        <p>
                            <span className="font-medium">Sum alle bøter:</span> {botStatistikk.sumAlle} kroner
                        </p>
                        <p>
                            <span className="font-medium">Betalt denne sesongen:</span> {botStatistikk.sumBetalt} kroner
                        </p>

                        {tilgjengeligeSesonger.length > 0 && (
                            <div className="mt-3 space-y-2">
                                <div className="flex items-center gap-2">
                                    <label htmlFor={`sesong-${spiller.id}`} className="font-medium text-sm">
                                        Vis sesong:
                                    </label>
                                    <select
                                        id={`sesong-${spiller.id}`}
                                        className="px-2 py-1 rounded border border-gray-300 text-sm"
                                        value={valgdSesong}
                                        onChange={(e) => setValgdSesong(e.target.value)}
                                    >
                                        <option value="">Gjeldende sesong</option>
                                        {tilgjengeligeSesonger.map((sesong) => (
                                            <option key={sesong} value={sesong}>
                                                {sesong} {sesong === hentSesongTekst() ? '(gjeldende)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {valgdSesongStatistikk && (
                                    <div className="bg-blue-50 rounded p-2 text-sm space-y-1">
                                        <p>
                                            <span className="font-medium">Sesong {valgdSesong}:</span>
                                        </p>
                                        <p>• Antall bøter: {valgdSesongStatistikk.antallBoter}</p>
                                        <p>• Sum bøter: {valgdSesongStatistikk.sumAlle} kroner</p>
                                        <p>• Betalt: {valgdSesongStatistikk.sumBetalt} kroner</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        className="bg-vipps-orange hover:bg-vipps-orange-dark text-white rounded px-3 py-2 mb-2 transition-colors"
                        onClick={handleVippsBetaling}
                        type="button"
                    >
                        Betal bøter i Vipps
                    </button>

                    <ListBoter
                        forseelser={forseelser}
                        erBotsjef={false}
                        spiller={spiller}
                        visAlleSesonger={visAlleSesonger}
                        valgdSesong={valgdSesong}
                    />
                </div>
            )}
        </div>
    )
}

export default SpillerKort
