'use client'
import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import AlertBanner from '@/komponenter/ui/AlertBanner.tsx'
import EnkeltSpillerVelger from '@/komponenter/spillere/EnkeltSpillerVelger.tsx'
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

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <EnkeltSpillerVelger
                    spillere={spillere}
                    valgtSpillerId={valgtSpiller?.id}
                    onSpillerValg={(spillerId) => {
                        const valgt = spillere.find((s) => s.id === spillerId)
                        handleSpillerValg(valgt)
                    }}
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
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}

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
