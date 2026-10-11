'use client'
import { useSpillere } from '@/hooks/useSpillere.ts'
import { useForseelser } from '@/hooks/useForseelser.ts'
import LeggTilBot from '@/app/boter/sjef/legg-til-bot.tsx'
import LeggTilSpiller from '@/app/boter/sjef/legg-til-spiller.tsx'
import AdministrerSpillere from '@/app/boter/sjef/administrer-spillere.tsx'
import { fjernSpillerFraListe, leggTilSpillerIListe, oppdaterSpillerIListe } from '@/lib/spillerListe.ts'
import type { Spiller } from '@/lib/spillereService.ts'
import React, { useState } from 'react'

export const Botsjef = () => {
    const { spillere, setSpillereMedBoter } = useSpillere(true)
    const { forseelser } = useForseelser()
    const [botSkjemaNokkel, setBotSkjemaNokkel] = useState(0)

    const handleSpillerLagtTil = (spiller: Spiller) =>
        setSpillereMedBoter((forrige) => leggTilSpillerIListe(forrige, spiller))

    const handleSpillerOppdatert = (gammelId: string, spiller: Spiller) => {
        setSpillereMedBoter((forrige) => oppdaterSpillerIListe(forrige, gammelId, spiller))
        if (gammelId !== spiller.id) setBotSkjemaNokkel((nokkel) => nokkel + 1)
    }

    const handleSpillerSlettet = (spillerId: string) => {
        setSpillereMedBoter((forrige) => fjernSpillerFraListe(forrige, spillerId))
        setBotSkjemaNokkel((nokkel) => nokkel + 1)
    }

    return (
        <>
            <LeggTilBot key={botSkjemaNokkel} forseelser={forseelser} spillere={spillere} />
            <LeggTilSpiller onSpillerLagtTil={handleSpillerLagtTil} />
            <AdministrerSpillere
                spillere={spillere}
                onSpillerOppdatert={handleSpillerOppdatert}
                onSpillerSlettet={handleSpillerSlettet}
            />
        </>
    )
}
