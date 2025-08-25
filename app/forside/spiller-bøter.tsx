'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import VippsDialog from '@/komponenter/ui/vippsDialog.tsx'
import type { User } from 'lucia'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import SpillerKort from './SpillerKort'
import { useNavbarHeight } from '@/hooks/useNavbarHeight'
import { useScrollToCard } from '@/hooks/useScrollToCard'
import {
    beregnSumMaaBetalesForSesong,
    beregnSumNyeBoterForSesong,
    beregnSumForSesong,
    hentSesongTekst,
} from '@/lib/botBeregning'

interface SpillerBøterProps {
    spillere: Spiller[]
    forseelser: Forseelse[]
    bruker?: User
}

const sorteringsvalg = [
    { verdi: 'alfabetisk', tekst: 'Alfabetisk (A-Å)' },
    { verdi: 'antall', tekst: 'Antall bøter' },
    { verdi: 'sum', tekst: 'Total sum bøter' },
    { verdi: 'sumMaaBetales', tekst: 'Beløp må betales neste måned' },
    { verdi: 'sumNyeBoter', tekst: 'Sum av nye bøter denne måneden' },
]

type Sortering = 'alfabetisk' | 'antall' | 'sum' | 'sumMaaBetales' | 'sumNyeBoter'
type Retning = 'stigende' | 'synkende'

export default function SpillerBøter({ spillere, forseelser }: SpillerBøterProps) {
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)
    const [visAlleSesonger, setVisAlleSesonger] = useState(false)
    const [sortering, setSortering] = useState<Sortering>('sumMaaBetales')
    const [retning, setRetning] = useState<Retning>('synkende')
    const navbarHeight = useNavbarHeight()

    const sesongTekst = useMemo(() => {
        return hentSesongTekst()
    }, [])

    const getKnappKlasser = useCallback((erAktiv: boolean) => {
        const base = 'px-4 py-2 rounded whitespace-nowrap transition-colors'
        const variant = erAktiv ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        return `${base} ${variant}`
    }, [])

    const filtrerteSpillere: Spiller[] = visAlleSesonger ? spillere : spillere.filter((spiller) => spiller.visNavn)

    const sorterteSpillere = useMemo(() => {
        const spillereKopi = [...filtrerteSpillere]
        spillereKopi.sort((a, b) => {
            let sammenligning = 0
            if (sortering === 'alfabetisk') {
                sammenligning = a.navn.localeCompare(b.navn, 'no')
            } else if (sortering === 'antall') {
                sammenligning = a.boter.length - b.boter.length
            } else if (sortering === 'sum') {
                const sumA = beregnSumForSesong(a.boter, visAlleSesonger)
                const sumB = beregnSumForSesong(b.boter, visAlleSesonger)
                sammenligning = sumA - sumB
            } else if (sortering === 'sumMaaBetales') {
                const sumA = beregnSumMaaBetalesForSesong(a.boter, visAlleSesonger)
                const sumB = beregnSumMaaBetalesForSesong(b.boter, visAlleSesonger)
                sammenligning = sumA - sumB
            } else if (sortering === 'sumNyeBoter') {
                const sumA = beregnSumNyeBoterForSesong(a.boter, visAlleSesonger)
                const sumB = beregnSumNyeBoterForSesong(b.boter, visAlleSesonger)
                sammenligning = sumA - sumB
            }
            return retning === 'stigende' ? sammenligning : -sammenligning
        })
        return spillereKopi
    }, [filtrerteSpillere, sortering, retning, visAlleSesonger])

    const { cardRefs, scrollToSpiller } = useScrollToCard(sorterteSpillere, navbarHeight)

    useEffect(() => {
        if (merInfoSpiller && cardRefs.current.length > 0) {
            scrollToSpiller(merInfoSpiller)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merInfoSpiller, scrollToSpiller])

    if (spillere.length === 0) return <Loading />

    return (
        <>
            <VippsDialog tittel="Betal i vipps" spiller={spillerVipps} setSpiller={setSpillerVipps} />

            <div className="mb-4 flex gap-2 flex-wrap">
                <button
                    className={getKnappKlasser(!visAlleSesonger)}
                    onClick={() => setVisAlleSesonger(false)}
                    type="button"
                >
                    Gjeldende sesong {sesongTekst}
                </button>
                <button
                    className={getKnappKlasser(visAlleSesonger)}
                    onClick={() => setVisAlleSesonger(true)}
                    type="button"
                >
                    Alle sesonger
                </button>
                <div className="flex gap-2 items-center">
                    <label htmlFor="sortering" className="text-sm">
                        Sorter:
                    </label>
                    <select
                        id="sortering"
                        className="px-2 py-1 rounded border border-gray-300 text-sm"
                        value={sortering}
                        onChange={(e) => setSortering(e.target.value as Sortering)}
                    >
                        {sorteringsvalg.map((valg) => (
                            <option key={valg.verdi} value={valg.verdi}>
                                {valg.tekst}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="px-2 py-1 rounded border border-gray-300 text-sm"
                        onClick={() => setRetning((r) => (r === 'stigende' ? 'synkende' : 'stigende'))}
                        title={retning === 'stigende' ? 'Sorter synkende' : 'Sorter stigende'}
                    >
                        {retning === 'stigende' ? '↑' : '↓'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {sorterteSpillere.map((spiller, idx) => (
                    <SpillerKort
                        key={spiller.id}
                        spiller={spiller}
                        cardRef={(el) => {
                            cardRefs.current[idx] = el
                        }}
                        merInfoOpen={merInfoSpiller === spiller}
                        setMerInfoSpiller={setMerInfoSpiller}
                        setSpillerVipps={setSpillerVipps}
                        forseelser={forseelser}
                        visAlleSesonger={visAlleSesonger}
                    />
                ))}
            </div>
        </>
    )
}
