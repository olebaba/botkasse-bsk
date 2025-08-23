import type { Spiller } from '@/lib/spillereService.ts'
import TabellData from '@/komponenter/TabellData.tsx'
import React, { useState } from 'react'
import { beregnSumNyeBoter, beregnSumMaaBetales } from '@/lib/botBeregning.ts'
import Laster from '@/ikoner/laster.tsx'
import Image from 'next/image'
import dropdown_down from '@/ikoner/dropdown-down.svg'
import dropdown_up from '@/ikoner/dropdown-up.svg'

interface SpillerRadProps {
    spiller: Spiller
    onClick: () => void
    /**
     * Om raden for spilleren skal vises eller ikke
     */
    visRad?: boolean
}

export const SpillerRad = ({ spiller, onClick, visRad }: SpillerRadProps) => {
    if (visRad === false) return null
    const [pil, setPil] = useState<string>(dropdown_down)
    const boter = spiller.boter
    if (!boter) return <Laster />

    const maaBetales = beregnSumMaaBetales(boter)
    const nyeBoter = beregnSumNyeBoter(boter)

    return (
        <tr
            onClick={() => {
                onClick()
                setPil(pil == dropdown_down ? dropdown_up : dropdown_down)
            }}
        >
            <td className="border-y">
                <Image className="mx-auto" alt={'Vis mer info om spilleren'} src={pil} />
            </td>
            <TabellData verdi={spiller.navn} erNok={false} />
            <TabellData verdi={maaBetales} erNok={true} />
            <TabellData verdi={nyeBoter} erNok={true} />
        </tr>
    )
}
