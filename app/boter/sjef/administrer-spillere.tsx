'use client'
import React from 'react'
import Header from '@/komponenter/ui/Header.tsx'
import AlertBanner from '@/komponenter/ui/AlertBanner.tsx'
import EnkelModal from '@/komponenter/ui/EnkelModal.tsx'
import SpillerCombobox from '@/komponenter/spillere/SpillerCombobox.tsx'
import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import { useSpillerRedigering } from '@/hooks/useSpillerRedigering.ts'
import type { Spiller } from '@/lib/spillereService.ts'

type Props = {
    spillere: Spiller[]
    onSpillerOppdatert: (gammelId: string, spiller: Spiller) => void
    onSpillerSlettet: (spillerId: string) => void
}

const AdministrerSpillere = ({ spillere, onSpillerOppdatert, onSpillerSlettet }: Props) => {
    const {
        valgtSpiller,
        navn,
        visNavn,
        melding,
        lagrer,
        visSlettBekreftelse,
        setNavn,
        setVisNavn,
        velgSpiller,
        handleLagre,
        apneSlettBekreftelse,
        lukkSlettBekreftelse,
        handleSlett,
    } = useSpillerRedigering({ spillere, onSpillerOppdatert, onSpillerSlettet })

    return (
        <div className="container mx-auto p-4">
            <Header size="medium" text="Administrer spillere" />
            <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <SpillerCombobox
                    spillere={spillere}
                    valgtSpiller={valgtSpiller}
                    onSpillerValgAction={velgSpiller}
                    label="Velg spiller"
                    placeholder="Søk etter spiller å redigere..."
                />

                {valgtSpiller && (
                    <form onSubmit={handleLagre} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label
                                    className="block text-gray-700 font-semibold mb-2"
                                    htmlFor="rediger-spiller-navn"
                                >
                                    Navn
                                </label>
                                <input
                                    type="text"
                                    id="rediger-spiller-navn"
                                    value={navn}
                                    onChange={(e) => setNavn(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    maxLength={100}
                                />
                            </div>

                            <p className="text-gray-600">Draktnummer: #{valgtSpiller.draktnummer}</p>

                            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="vis-spiller"
                                    checked={visNavn}
                                    onChange={(e) => setVisNavn(e.target.checked)}
                                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                                <label className="text-gray-700 font-medium cursor-pointer" htmlFor="vis-spiller">
                                    Vis spiller (med i lister og månedlig bot)
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                            <Knapp type="submit" tekst={lagrer ? 'Lagrer...' : 'Lagre endringer'} disabled={lagrer} />
                            <Knapp
                                variant="secondary"
                                tekst="Slett spiller"
                                onClick={apneSlettBekreftelse}
                                disabled={lagrer}
                            />
                        </div>
                    </form>
                )}
            </div>
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}

            <EnkelModal
                apen={visSlettBekreftelse}
                onClose={lukkSlettBekreftelse}
                tittel="Slett spiller"
                innhold={`Er du sikker på at du vil slette ${valgtSpiller?.navn} (#${valgtSpiller?.draktnummer})? Dette kan ikke angres.`}
            >
                <div className="flex justify-end gap-2">
                    <Knapp variant="secondary" tekst="Avbryt" onClick={lukkSlettBekreftelse} />
                    <Knapp tekst={lagrer ? 'Sletter...' : 'Slett'} onClick={handleSlett} disabled={lagrer} />
                </div>
            </EnkelModal>
        </div>
    )
}

export default AdministrerSpillere
