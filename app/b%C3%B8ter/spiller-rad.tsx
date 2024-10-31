import type {Spiller} from "@/lib/spillereService.ts";
import TabellData from "@/komponenter/TabellData.tsx";
import React from "react";
import {beregnSumNyeBoter, beregnSumMaaBetales} from "@/lib/botBeregning.ts";
import Laster from "@/ikoner/laster.tsx";

interface SpillerRadProps {
    spiller: Spiller,
    onClick: () => void,
    visNavn?: boolean
}

export const SpillerRad = ({spiller, onClick, visNavn}: SpillerRadProps) => {
    const boter = spiller.boter
    if (!boter) return <Laster />


    const maaBetales = beregnSumMaaBetales(boter)
    const nyeBoter = beregnSumNyeBoter(boter)

    return (
        <tr onClick={onClick}>
            <TabellData verdi={visNavn ? spiller.navn : spiller.id} erNok={false}/>
            <TabellData verdi={maaBetales} erNok={true}/>
            <TabellData verdi={nyeBoter} erNok={true}/>
        </tr>
    )
}