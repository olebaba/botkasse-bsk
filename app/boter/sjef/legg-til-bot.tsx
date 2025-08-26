'use client'
import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import AlertBanner from '@/komponenter/ui/AlertBanner.tsx'
import SpillerVelger from '@/komponenter/spillere/SpillerVelger.tsx'
import BotSkjemaInputs from '@/komponenter/boter/BotSkjemaInputs.tsx'
import { useBotSkjema } from '@/hooks/useBotSkjema.ts'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'

export default function LeggTilBot({ spillere, forseelser }: { spillere: Spiller[]; forseelser: Forseelse[] }) {
    const {
        valgteSpillere,
        belop,
        dato,
        melding,
        erKampdag,
        setBelop,
        setDato,
        setErKampdag,
        handleSpillerToggle,
        handleFjernAlle,
        handleForseelseEndring,
        handleLeggTilBoter,
    } = useBotSkjema()

    return (
        <div className="container mx-auto p-4 mt-28">
            <Header size="medium" text="Legg til bot for spillere" />
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}
            <div>
                <SpillerVelger
                    spillere={spillere}
                    valgteSpillere={valgteSpillere}
                    onSpillerToggleAction={handleSpillerToggle}
                    onFjernAlleAction={handleFjernAlle}
                />
                <BotSkjemaInputs
                    forseelser={forseelser}
                    belop={belop}
                    dato={dato}
                    erKampdag={erKampdag}
                    valgteSpillere={valgteSpillere}
                    onForseelseEndring={handleForseelseEndring}
                    onBelopEndring={setBelop}
                    onDatoEndring={setDato}
                    onKampdagEndring={setErKampdag}
                    onLeggTilBoter={handleLeggTilBoter}
                />
            </div>
        </div>
    )
}
