'use client'
import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import AlertBanner from '@/komponenter/ui/AlertBanner.tsx'
import SpillerCombobox from '@/komponenter/spillere/SpillerCombobox.tsx'
import { UbetalteBoterSeksjon } from '@/komponenter/boter/UbetalteBoterSeksjon.tsx'
import { BetalteBoterSeksjon } from '@/komponenter/boter/BetalteBoterSeksjon.tsx'
import { SpillerStatus } from '@/komponenter/spillere/SpillerStatus.tsx'
import { useBoterBehandling } from '@/hooks/useBoterBehandling.ts'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'

export const MarkerBetalt = ({ spillere, forseelser }: { spillere: Spiller[]; forseelser: Forseelse[] }) => {
    const {
        valgtSpiller,
        valgteBoter,
        visBetalteBøter,
        melding,
        ubetalteBoter,
        betalteBoter,
        totalBelop,
        setVisBetalteBøter,
        handleSpillerValg,
        handleBotToggle,
        handleVelgToggle,
        handleMarkerBetalt,
        handleMarkerUbetalt,
    } = useBoterBehandling()

    const erAlleValgt = valgteBoter.size === ubetalteBoter.length

    return (
        <div className="container mx-auto p-4 space-y-6">
            <Header size="medium" text="Marker betalt bot" />
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <SpillerCombobox
                    spillere={spillere}
                    valgtSpiller={valgtSpiller}
                    onSpillerValgAction={handleSpillerValg}
                    placeholder="Søk på navn eller draktnummer..."
                    label="Søk og velg spiller"
                />
            </div>

            {valgtSpiller && ubetalteBoter.length > 0 && (
                <UbetalteBoterSeksjon
                    valgtSpiller={valgtSpiller}
                    ubetalteBoter={ubetalteBoter}
                    valgteBoter={valgteBoter}
                    totalBelop={totalBelop}
                    erAlleValgt={erAlleValgt}
                    forseelser={forseelser}
                    onBotToggle={handleBotToggle}
                    onVelgToggle={handleVelgToggle}
                    onMarkerBetalt={handleMarkerBetalt}
                />
            )}

            {valgtSpiller && betalteBoter.length > 0 && (
                <BetalteBoterSeksjon
                    valgtSpiller={valgtSpiller}
                    betalteBoter={betalteBoter}
                    visBetalteBøter={visBetalteBøter}
                    forseelser={forseelser}
                    onToggleVis={() => setVisBetalteBøter(!visBetalteBøter)}
                    onMarkerUbetalt={handleMarkerUbetalt}
                />
            )}

            {valgtSpiller && (
                <SpillerStatus
                    valgtSpiller={valgtSpiller}
                    harUbetalteBoter={ubetalteBoter.length > 0}
                    harBetalteBoter={betalteBoter.length > 0}
                />
            )}
        </div>
    )
}
