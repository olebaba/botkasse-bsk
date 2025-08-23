'use client'
import React, { Fragment, useEffect, useState } from 'react'
import { type Spiller } from '@/lib/spillereService.ts'
import VippsDialog from '@/komponenter/vippsDialog.tsx'
import type { User } from 'lucia'
import { useSpillerInfo } from '@/hooks/useSpillerInfo.ts'
import { SpillerRad } from '@/app/forside/spiller-rad.tsx'
import { SpillerMerInfo } from '@/app/forside/spiller-mer-info.tsx'
import { beregnSumMaaBetales, beregnSumNyeBoter } from '@/lib/botBeregning.ts'
import Loading from '@/app/loading.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'

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

    const kolonner = [
        {
            id: 'draktnummer',
            navn: 'Spiller',
            sortering: () => sorterAlfabetisk('id'),
        },
        { id: 'maaBetales', navn: 'Må betales', sortering: sorterMaaBetales },
        { id: 'nyeBoter', navn: 'Nye bøter', sortering: sorterNyeBoter },
    ]

    if (bruker) {
        kolonner[0] = {
            id: 'navn',
            navn: 'Spiller',
            sortering: () => sorterAlfabetisk('navn'),
        }
        spillere.sort((a, b) => {
            if (a.id === spillerInfo?.id) return -1
            if (b.id === spillerInfo?.id) return 1
            return 0
        })
    }

    useEffect(() => {
        setSortertSpillere(spillere)
    }, [spillere])

    if (spillere.length == 0) return <Loading />

    return (
        <>
            <VippsDialog tittel="Betal i vipps" spiller={spillerVipps} setSpiller={setSpillerVipps} />
            <div>
                <table className="w-full bg-white border border-gray-200 shadow-lg text-lg md:text-base">
                    <thead className="bg-gray-50">
                        <tr className="hover:bg-gray-50">
                            <th>⇅</th>
                            {kolonner.map((kolonne) => {
                                return (
                                    <th
                                        key={kolonne.id}
                                        className="py-2 px-4 left font-semibold text-gray-700 border-b text-center"
                                        onClick={kolonne.sortering}
                                    >
                                        {kolonne.navn}
                                    </th>
                                )
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {sortertSpillere.map((spiller) => (
                            <Fragment key={spiller.id}>
                                <SpillerRad
                                    spiller={spiller}
                                    visNavn={bruker != undefined}
                                    onClick={() => {
                                        if (merInfoSpiller == spiller) setMerInfoSpiller(undefined)
                                        else setMerInfoSpiller(spiller)
                                    }}
                                />
                                {spiller == merInfoSpiller && (
                                    <SpillerMerInfo
                                        spiller={spiller}
                                        kolonner={kolonner}
                                        forseelser={forseelser}
                                        setSpillerVipps={setSpillerVipps}
                                    />
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    )
}
