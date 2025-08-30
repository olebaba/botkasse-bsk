'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import SpillerKort from './SpillerKort'
import { useNavbarHeight } from '@/hooks/useNavbarHeight'
import { useScrollToCard } from '@/hooks/useScrollToCard'
import { hentSesongTekst } from '@/lib/botBeregning'
import { sorterSpillere, type Sortering, type Retning } from '@/lib/spillerSortering'
import type { User } from 'lucia'

interface SpillerBøterProps {
    spillere: Spiller[]
    forseelser: Forseelse[]
    bruker?: User
    favorittSpillerId: string | null
    settFavorittSpiller: (spillerId: string | null) => void
    erFavoritt: (spillerId: string) => boolean
    setVippsDialog: (vippsInfo: { spiller: Spiller; valgtSesong: string }) => void
}

const sorteringsvalg = [
    { verdi: 'alfabetisk', tekst: 'Alfabetisk (A-Å)' },
    { verdi: 'antall', tekst: 'Antall bøter' },
    { verdi: 'sum', tekst: 'Total sum bøter' },
    { verdi: 'sumMaaBetales', tekst: 'Beløp må betales neste måned' },
    { verdi: 'sumNyeBoter', tekst: 'Sum av nye bøter denne måneden' },
]

export default function SpillerBøter({
    spillere,
    forseelser,
    bruker,
    favorittSpillerId,
    settFavorittSpiller,
    erFavoritt,
    setVippsDialog,
}: SpillerBøterProps) {
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)
    const [visAlleSesonger, setVisAlleSesonger] = useState(false)
    const [sortering, setSortering] = useState<Sortering>('alfabetisk')
    const [retning, setRetning] = useState<Retning>('stigende')
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
        return sorterSpillere(filtrerteSpillere, sortering, retning, visAlleSesonger)
    }, [filtrerteSpillere, sortering, retning, visAlleSesonger])

    const { cardRefs, scrollToSpiller } = useScrollToCard(sorterteSpillere, navbarHeight)

    useEffect(() => {
        if (merInfoSpiller && cardRefs.current.length > 0) {
            scrollToSpiller(merInfoSpiller)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [merInfoSpiller, scrollToSpiller])

    const handleSorteringChange = (nySortering: Sortering) => {
        setSortering(nySortering)
        // Sett synkende som standard for numeriske verdier (høyeste først)
        if (
            nySortering === 'antall' ||
            nySortering === 'sum' ||
            nySortering === 'sumMaaBetales' ||
            nySortering === 'sumNyeBoter'
        ) {
            setRetning('synkende')
        } else {
            // Alfabetisk sortering bruker stigende som standard
            setRetning('stigende')
        }
    }

    if (spillere.length === 0) return <Loading />

    return (
        <>
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
                        onChange={(e) => handleSorteringChange(e.target.value as Sortering)}
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
                        merInfoOpen={merInfoSpiller?.id === spiller.id}
                        setMerInfoSpiller={setMerInfoSpiller}
                        setSpillerVipps={setVippsDialog}
                        forseelser={forseelser}
                        visAlleSesonger={visAlleSesonger}
                        erFavoritt={erFavoritt(spiller.id)}
                        settFavorittSpiller={settFavorittSpiller}
                        erEgenSpiller={spiller.id === String(bruker?.spiller_id)}
                        bruker={bruker}
                        favorittSpillerId={favorittSpillerId}
                    />
                ))}
            </div>
        </>
    )
}
