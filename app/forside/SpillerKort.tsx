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
import { Knapp } from '@/komponenter/ui/Knapp'
import { Select } from '@/komponenter/ui/Select'
import Header from '@/komponenter/ui/Header'
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
    const [valgtSesong, setValgtSesong] = useState<string>('')

    const tilgjengeligeSesonger = useMemo(() => {
        return hentTilgjengeligeSesonger(spiller.boter || [])
    }, [spiller.boter])

    const botStatistikk = useMemo(() => {
        const boter = spiller.boter
        if (!boter) return { maaBetales: 0, nyeBoter: 0, alleBetalt: false, sumAlle: 0, sumBetalt: 0, antallBoter: 0 }

        const maaBetales = beregnSumMaaBetalesForSesong(boter, visAlleSesonger)

        return {
            maaBetales,
            nyeBoter: beregnSumNyeBoterForSesong(boter, visAlleSesonger),
            alleBetalt: maaBetales === 0,
            sumAlle: beregnSum(boter),
            sumBetalt: beregnSumBetaltForSesong(boter, visAlleSesonger),
            antallBoter: boter.length,
        }
    }, [spiller.boter, visAlleSesonger])

    const sesongStatistikk = useMemo(() => {
        if (!spiller.boter) return { sumAlle: 0, sumBetalt: 0, antallBoter: 0 }

        let filtrerteBoter = spiller.boter

        if (valgtSesong === 'alle') {
            // Vis alle sesonger
        } else if (valgtSesong === '') {
            // Vis gjeldende sesong (default)
            const gjeldendeSesong = hentSesongTekst()
            filtrerteBoter = filtrerBoterForSpesifikkSesong(spiller.boter, gjeldendeSesong)
        } else {
            filtrerteBoter = filtrerBoterForSpesifikkSesong(spiller.boter, valgtSesong)
        }

        return {
            sumAlle: filtrerteBoter.reduce((sum, bot) => sum + Number(bot.belop), 0),
            sumBetalt: filtrerteBoter.filter((bot) => bot.erBetalt).reduce((sum, bot) => sum + Number(bot.belop), 0),
            antallBoter: filtrerteBoter.length,
        }
    }, [spiller.boter, valgtSesong])

    const getKortKlasser = useCallback(() => {
        const base = 'rounded shadow border p-4 flex flex-col gap-2 transition-all duration-600'
        const bakgrunn = botStatistikk.alleBetalt ? 'bg-green-100' : 'bg-red-200'
        const ring = merInfoOpen ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-300 cursor-pointer'

        return `${base} ${bakgrunn} ${ring}`
    }, [botStatistikk.alleBetalt, merInfoOpen])

    const handleToggleInfo = useCallback(() => {
        setMerInfoSpiller(merInfoOpen ? undefined : spiller)
    }, [merInfoOpen, setMerInfoSpiller, spiller])

    const handleVippsBetaling = useCallback(
        (e?: React.MouseEvent) => {
            e?.stopPropagation()
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
                    <Header size="small" text={spiller.navn} as="h3" className="mb-0" />
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
                <Knapp
                    variant="secondary"
                    className="text-xs px-2 py-1 mt-2 md:mt-0"
                    tekst={merInfoOpen ? 'Skjul' : 'Trykk for mer info'}
                />
            </div>

            {merInfoOpen && (
                <div className="mt-2 bg-yellow-50 rounded p-2" onClick={(e) => e.stopPropagation()}>
                    <div className="mb-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <label htmlFor={`sesong-${spiller.id}`} className="font-medium text-sm">
                                Vis sesong:
                            </label>
                            <Select
                                id={`sesong-${spiller.id}`}
                                value={valgtSesong}
                                onChange={(e) => setValgtSesong(e.target.value)}
                            >
                                <option value="">Gjeldende sesong</option>
                                <option value="alle">Alle sesonger</option>
                                {tilgjengeligeSesonger.map((sesong) => (
                                    <option key={sesong} value={sesong}>
                                        {sesong} {sesong === hentSesongTekst() ? '(gjeldende)' : ''}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                            <h4 className="font-semibold text-gray-800 mb-3 text-center">
                                {valgtSesong === 'alle'
                                    ? 'Statistikk for alle sesonger'
                                    : valgtSesong === ''
                                      ? `Statistikk for ${hentSesongTekst()} (gjeldende)`
                                      : `Statistikk for ${valgtSesong}`}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="bg-white rounded-lg p-3 shadow-sm border">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {sesongStatistikk.antallBoter}
                                        </div>
                                        <div className="text-sm text-gray-600 font-medium">Antall bøter</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm border">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">
                                            {sesongStatistikk.sumAlle}
                                        </div>
                                        <div className="text-sm text-gray-600 font-medium">Sum bøter (kr)</div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 shadow-sm border">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {sesongStatistikk.sumBetalt}
                                        </div>
                                        <div className="text-sm text-gray-600 font-medium">Betalt (kr)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Knapp
                        variant="vipps"
                        className="px-3 py-2 mb-2"
                        onClick={handleVippsBetaling}
                        tekst="Betal bøter i Vipps"
                    />

                    <ListBoter
                        forseelser={forseelser}
                        erBotsjef={false}
                        spiller={spiller}
                        visAlleSesonger={visAlleSesonger}
                        valgdSesong={valgtSesong === 'alle' ? '' : valgtSesong}
                    />
                </div>
            )}
        </div>
    )
}

export default SpillerKort
