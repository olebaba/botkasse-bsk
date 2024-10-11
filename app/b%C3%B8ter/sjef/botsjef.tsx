'use client'
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import LeggTilBot from "@/app/b%C3%B8ter/sjef/legg-til-bot.tsx";
import {MarkerBetalt} from "@/app/b%C3%B8ter/sjef/marker-betalt.tsx";
import React from "react";

export const Botsjef = () => {
    const {spillereMedBoter: spillere} = useSpillere()
    const {forseelser} = useForseelser()

    return (
        <>
            <LeggTilBot forseelser={forseelser} spillere={spillere}/>
            <MarkerBetalt forseelser={forseelser} spillere={spillere}/>
        </>
    )
}