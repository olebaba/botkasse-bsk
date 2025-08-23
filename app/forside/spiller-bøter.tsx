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
                {sortertSpillere.map((spiller, idx) => {
                    const boter = spiller.boter
                    const maaBetales = boter ? beregnSumMaaBetales(boter) : 0
                    const nyeBoter = boter ? beregnSumNyeBoter(boter) : 0
                    const merInfoOpen = merInfoSpiller === spiller
                    return (
                        <div
                            key={spiller.id}
                            ref={el => { cardRefs.current[idx] = el || null }}
                            className={`bg-white rounded shadow border p-4 flex flex-col gap-2 transition-all duration-200 ${merInfoOpen ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:ring-1 hover:ring-blue-300 cursor-pointer'}`}
                        >
                            <div
                                className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between cursor-pointer"
                                onClick={() => setMerInfoSpiller(merInfoOpen ? undefined : spiller)}
                                tabIndex={0}
                                role="button"
                                aria-pressed={merInfoOpen}
                            >
                                <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                    <div className="font-semibold text-lg">{spiller.navn}</div>
                                    <div><span className="font-medium">Må betales:</span> {maaBetales} kr</div>
                                    <div><span className="font-medium">Nye bøter:</span> {nyeBoter} kr</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded mt-2 md:mt-0 ${merInfoOpen ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>{merInfoOpen ? 'Åpen' : 'Trykk for mer info'}</span>
                            </div>
                            {merInfoOpen && (
                                <div className="mt-2 bg-yellow-50 rounded p-2" onClick={e => e.stopPropagation()}>
                                    <div className="mb-2 font-semibold">
                                        <p>Sum alle bøter: {boter ? beregnSum(boter) : 0} kroner.</p>
                                        <p>Betalt denne sesongen: {boter ? beregnSum(boter.filter((b) => b.erBetalt)) : 0} kroner.</p>
                                    </div>
                                    <button
                                        className="bg-vipps-orange hover:bg-vipps-orange-dark text-white rounded px-3 py-2 mb-2"
                                        onClick={e => { e.stopPropagation(); setSpillerVipps(spiller) }}
                                    >
                                        Betal bøter i Vipps
                                    </button>
                                    <ListBoter forseelser={forseelser} erBotsjef={false} spiller={spiller} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </>
    )
}
