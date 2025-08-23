'use client'
import React, { Fragment, useEffect, useState } from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import VippsDialog from '@/komponenter/vippsDialog.tsx'
import type { User } from 'lucia'
import { useSpillerInfo } from '@/hooks/useSpillerInfo.ts'
import {beregnSum, beregnSumMaaBetales, beregnSumNyeBoter} from '@/lib/botBeregning.ts'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import dayjs from '@/lib/dayjs.ts'
import {ListBoter} from "@/komponenter/ListBoter.tsx";

export default function SpillerBøter({
    spillere,
    forseelser,
    bruker,
}: {
    spillere: Spiller[]
    forseelser: Forseelse[]
    bruker?: User
}) {
    const [sortertSpillere, setSortertSpillere] = useState<Spiller[]>(spillere)
    const { spillerInfo } = useSpillerInfo(bruker && bruker?.type != 'gjest' ? (bruker?.id ?? '') : '')
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)
    const aar = dayjs().year()
    const nesteAar = dayjs().add(1, 'year').year()
    const [visAlleSesonger, setVisAlleSesonger] = useState(false)

    const sorterMaaBetales = () => {
        setSortertSpillere(
            sortertSpillere.toSorted((a, b) => beregnSumMaaBetales(b.boter) - beregnSumMaaBetales(a.boter)),
        )
    }
    const sorterNyeBoter = () => {
        setSortertSpillere(sortertSpillere.toSorted((a, b) => beregnSumNyeBoter(b.boter) - beregnSumNyeBoter(a.boter)))
    }
    const sorterAlfabetisk = (felt: 'navn' | 'id') => {
        setSortertSpillere(sortertSpillere.toSorted((a, b) => a[felt].localeCompare(b[felt])))
    }

    useEffect(() => {
        setSortertSpillere(spillere)
    }, [spillere])

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
                {spillere.map((spiller) => {
                    const boter = spiller.boter
                    const maaBetales = boter ? beregnSumMaaBetales(boter) : 0
                    const nyeBoter = boter ? beregnSumNyeBoter(boter) : 0
                    const merInfoOpen = merInfoSpiller === spiller
                    return (
                        <div key={spiller.id} className="bg-white rounded shadow border p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <div className="font-semibold text-lg">{spiller.navn}</div>
                                <button
                                    className="text-blue-600 underline text-sm"
                                    onClick={() => setMerInfoSpiller(merInfoOpen ? undefined : spiller)}
                                >
                                    {merInfoOpen ? 'Skjul info' : 'Vis mer info'}
                                </button>
                            </div>
                            <div className="flex flex-col gap-1">
                                <div><span className="font-medium">Må betales:</span> {maaBetales} kr</div>
                                <div><span className="font-medium">Nye bøter:</span> {nyeBoter} kr</div>
                            </div>
                            {merInfoOpen && (
                                <div className="mt-2 bg-yellow-50 rounded p-2">
                                    <div className="mb-2 font-semibold">
                                        <p>Sum alle bøter: {boter ? beregnSum(boter) : 0} kroner.</p>
                                        <p>Betalt denne sesongen: {boter ? beregnSum(boter.filter((b) => b.erBetalt)) : 0} kroner.</p>
                                    </div>
                                    <button
                                        className="bg-vipps-orange hover:bg-vipps-orange-dark text-white rounded px-3 py-2 mb-2"
                                        onClick={() => setSpillerVipps(spiller)}
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
