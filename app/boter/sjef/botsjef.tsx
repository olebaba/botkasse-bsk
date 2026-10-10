'use client'
import { useSpillere } from '@/hooks/useSpillere.ts'
import { useForseelser } from '@/hooks/useForseelser.ts'
import LeggTilBot from '@/app/boter/sjef/legg-til-bot.tsx'
import LeggTilSpiller from '@/app/boter/sjef/legg-til-spiller.tsx'
import { leggTilSpillerIListe } from '@/lib/spillerListe.ts'
import type { Spiller } from '@/lib/spillereService.ts'
import React from 'react'

export const Botsjef = () => {
    const { spillere, setSpillereMedBoter } = useSpillere(true)
    const { forseelser } = useForseelser()

    const handleSpillerLagtTil = (spiller: Spiller) =>
        setSpillereMedBoter((forrige) => leggTilSpillerIListe(forrige, spiller))

    return (
        <>
            <LeggTilBot forseelser={forseelser} spillere={spillere} />
            <LeggTilSpiller onSpillerLagtTil={handleSpillerLagtTil} />
        </>
    )
}
