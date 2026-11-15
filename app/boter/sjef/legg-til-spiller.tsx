'use client'
import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import AlertBanner from '@/komponenter/ui/AlertBanner.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import { useSpillerSkjema } from '@/hooks/useSpillerSkjema.ts'
import type { Spiller } from '@/lib/spillereService.ts'

const LeggTilSpiller = ({ onSpillerLagtTil }: { onSpillerLagtTil: (spiller: Spiller) => void }) => {
    const { draktnummer, navn, melding, lagrer, setDraktnummer, setNavn, handleLeggTilSpiller } =
        useSpillerSkjema(onSpillerLagtTil)

    return (
        <div className="container mx-auto p-4">
            <Header size="medium" text="Legg til spiller" />
            <form
                onSubmit={handleLeggTilSpiller}
                className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="nytt-draktnummer">
                            Draktnummer
                        </label>
                        <input
                            type="number"
                            id="nytt-draktnummer"
                            value={draktnummer}
                            onChange={(e) => setDraktnummer(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            min="1"
                            step="1"
                            inputMode="numeric"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="ny-spiller-navn">
                            Navn
                        </label>
                        <input
                            type="text"
                            id="ny-spiller-navn"
                            value={navn}
                            onChange={(e) => setNavn(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            maxLength={100}
                            placeholder="Fornavn Etternavn"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                    <Knapp type="submit" tekst={lagrer ? 'Lagrer...' : 'Legg til spiller'} disabled={lagrer} />
                </div>
            </form>
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}
        </div>
    )
}

export default LeggTilSpiller
