import React, { useState } from 'react'
import { lagSpiller, type Spiller } from '@/lib/spillereService.ts'
import { validerNySpiller } from '@/lib/spillerValidering.ts'
import { AlertTypes } from '@/komponenter/ui/AlertBanner.tsx'

export const useSpillerSkjema = (onSpillerLagtTil: (spiller: Spiller) => void) => {
    const [draktnummer, setDraktnummer] = useState('')
    const [navn, setNavn] = useState('')
    const [melding, setMelding] = useState<{ tekst: string; type: AlertTypes } | null>(null)
    const [lagrer, setLagrer] = useState(false)

    const handleLeggTilSpiller = async (e?: React.FormEvent) => {
        e?.preventDefault()

        const resultat = validerNySpiller({
            draktnummer: draktnummer.trim() === '' ? NaN : Number(draktnummer),
            navn,
        })
        if (!resultat.ok) {
            setMelding({ tekst: resultat.feil, type: AlertTypes.ERROR })
            return
        }

        setLagrer(true)
        try {
            const spiller = await lagSpiller(resultat.verdi.draktnummer, resultat.verdi.navn)
            onSpillerLagtTil(spiller)
            setMelding({ tekst: `${spiller.navn} (#${spiller.draktnummer}) er lagt til!`, type: AlertTypes.SUCCESS })
            setDraktnummer('')
            setNavn('')
        } catch (error) {
            setMelding({
                tekst: error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere.',
                type: AlertTypes.ERROR,
            })
        } finally {
            setLagrer(false)
        }
    }

    return { draktnummer, navn, melding, lagrer, setDraktnummer, setNavn, handleLeggTilSpiller }
}
