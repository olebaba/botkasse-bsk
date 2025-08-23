'use client'
import React, {useEffect, useRef, useState} from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import VippsDialog from '@/komponenter/vippsDialog.tsx'
import type { User } from 'lucia'
import {beregnSum, beregnSumMaaBetales, beregnSumNyeBoter} from '@/lib/botBeregning.ts'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import dayjs from '@/lib/dayjs.ts'
import {ListBoter} from "@/komponenter/ListBoter.tsx";
import SpillerKort from './SpillerKort'

export default function SpillerBøter({
    spillere,
    forseelser,
}: {
    spillere: Spiller[]
    forseelser: Forseelse[]
    bruker?: User
}) {
    const [sortertSpillere, setSortertSpillere] = useState<Spiller[]>(spillere)
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)
    const aar = dayjs().year()
    const nesteAar = dayjs().add(1, 'year').year()
    const [visAlleSesonger, setVisAlleSesonger] = useState(false)

    useEffect(() => {
        setSortertSpillere(spillere)
    }, [spillere])

    const cardRefs = useRef<(HTMLDivElement | null)[]>([])

    const [navbarHeight, setNavbarHeight] = useState(0)
    useEffect(() => {
        const navbar = document.querySelector('nav')
        if (navbar) {
            setNavbarHeight(navbar.getBoundingClientRect().height)
        }
    }, [])

    useEffect(() => {
        if (merInfoSpiller) {
            const idx = sortertSpillere.findIndex(s => s === merInfoSpiller)
            if (idx !== -1 && cardRefs.current[idx]) {
                const el = cardRefs.current[idx]
                const rect = el?.getBoundingClientRect()
                const scrollTop = (window.scrollY ?? 0) + (rect?.top ?? 0) - navbarHeight - 16
                window.scrollTo({ top: scrollTop, behavior: 'smooth' })
            }
        }
    }, [merInfoSpiller, sortertSpillere, navbarHeight])

    if (spillere.length == 0) return <Loading />

    return (
        <>
            <VippsDialog tittel="Betal i vipps" spiller={spillerVipps} setSpiller={setSpillerVipps} />
            <div className="mb-4 flex gap-2 flex-wrap">
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${!visAlleSesonger ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setVisAlleSesonger(false)}
                >
                    Gjeldende sesong {aar}/{nesteAar}
                </button>
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${visAlleSesonger ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setVisAlleSesonger(true)}
                >
                    Alle sesonger
                </button>
            </div>
            <div className="space-y-4">
                {sortertSpillere.map((spiller, idx) => (
                    <SpillerKort
                        key={spiller.id}
                        spiller={spiller}
                        cardRef={el => { cardRefs.current[idx] = el || null }}
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
