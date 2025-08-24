'use client'
import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import VippsDialog from '@/komponenter/vippsDialog.tsx'
import type { User } from 'lucia'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import dayjs from '@/lib/dayjs.ts'
import SpillerKort from './SpillerKort'
import { useNavbarHeight } from '@/hooks/useNavbarHeight'
import { useScrollToCard } from '@/hooks/useScrollToCard'

interface SpillerBøterProps {
    spillere: Spiller[]
    forseelser: Forseelse[]
    bruker?: User
}

export default function SpillerBøter({ spillere, forseelser }: SpillerBøterProps) {
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)
    const [visAlleSesonger, setVisAlleSesonger] = useState(false)
    const navbarHeight = useNavbarHeight()
    const { cardRefs, scrollToSpiller } = useScrollToCard(spillere, navbarHeight)

    const sesongTekst = useMemo(() => {
        const aar = dayjs().year()
        const nesteAar = dayjs().add(1, 'year').year()
        return `${aar}/${nesteAar}`
    }, [])

    const getKnappKlasser = useCallback((erAktiv: boolean) => {
        const base = 'px-4 py-2 rounded whitespace-nowrap transition-colors'
        const variant = erAktiv
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        return `${base} ${variant}`
    }, [])

    useEffect(() => {
        if (merInfoSpiller) {
            scrollToSpiller(merInfoSpiller)
        }
    }, [merInfoSpiller, scrollToSpiller])

    if (spillere.length === 0) return <Loading />

    const filtrerteSpillere: Spiller[] = visAlleSesonger
        ? spillere
        : spillere.filter((spiller) => spiller.visNavn)


    return (
        <>
            <VippsDialog
                tittel="Betal i vipps"
                spiller={spillerVipps}
                setSpiller={setSpillerVipps}
            />

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
            </div>

            <div className="space-y-4">
                {filtrerteSpillere.map((spiller, idx) => (
                    <SpillerKort
                        key={spiller.id}
                        spiller={spiller}
                        cardRef={el => { cardRefs.current[idx] = el }}
                        merInfoOpen={merInfoSpiller === spiller}
                        setMerInfoSpiller={setMerInfoSpiller}
                        setSpillerVipps={setSpillerVipps}
                        forseelser={forseelser}
                    />
                ))}
            </div>
        </>
    )
}
