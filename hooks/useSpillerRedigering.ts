import React, { useState } from 'react'
import { oppdaterSpiller, slettSpiller, type Spiller } from '@/lib/spillereService.ts'
import { validerSpillerOppdatering } from '@/lib/spillerValidering.ts'
import { AlertTypes } from '@/komponenter/ui/AlertBanner.tsx'

type Props = {
    spillere: Spiller[]
    onSpillerOppdatert: (gammelId: string, spiller: Spiller) => void
    onSpillerSlettet: (spillerId: string) => void
}

const tilFeilmelding = (error: unknown) =>
    error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere.'

export const useSpillerRedigering = ({ spillere, onSpillerOppdatert, onSpillerSlettet }: Props) => {
    const [valgtSpillerId, setValgtSpillerId] = useState<string | undefined>(undefined)
    const [navn, setNavn] = useState('')
    const [visNavn, setVisNavn] = useState(false)
    const [melding, setMelding] = useState<{ tekst: string; type: AlertTypes } | null>(null)
    const [lagrer, setLagrer] = useState(false)
    const [visSlettBekreftelse, setVisSlettBekreftelse] = useState(false)

    const valgtSpiller = spillere.find((s) => s.id === valgtSpillerId)

    const velgSpiller = (spiller: Spiller | undefined) => {
        setValgtSpillerId(spiller?.id)
        setNavn(spiller?.navn ?? '')
        setVisNavn(Boolean(spiller?.visNavn))
        setMelding(null)
    }

    const handleLagre = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!valgtSpiller) return

        const resultat = validerSpillerOppdatering({ spiller_id: Number(valgtSpiller.id), navn, visNavn })
        if (!resultat.ok) {
            setMelding({ tekst: resultat.feil, type: AlertTypes.ERROR })
            return
        }

        setLagrer(true)
        try {
            const oppdatert = await oppdaterSpiller(Number(valgtSpiller.id), { navn: resultat.verdi.navn, visNavn })
            onSpillerOppdatert(valgtSpiller.id, oppdatert)
            setValgtSpillerId(oppdatert.id)
            setMelding({ tekst: `${oppdatert.navn} er oppdatert.`, type: AlertTypes.SUCCESS })
        } catch (error) {
            setMelding({ tekst: tilFeilmelding(error), type: AlertTypes.ERROR })
        } finally {
            setLagrer(false)
        }
    }

    const apneSlettBekreftelse = () => setVisSlettBekreftelse(true)
    const lukkSlettBekreftelse = () => setVisSlettBekreftelse(false)

    const handleSlett = async () => {
        if (!valgtSpiller) return

        setLagrer(true)
        try {
            await slettSpiller(Number(valgtSpiller.id))
            onSpillerSlettet(valgtSpiller.id)
            velgSpiller(undefined)
            setMelding({ tekst: `${valgtSpiller.navn} er slettet.`, type: AlertTypes.SUCCESS })
        } catch (error) {
            setMelding({ tekst: tilFeilmelding(error), type: AlertTypes.ERROR })
        } finally {
            setVisSlettBekreftelse(false)
            setLagrer(false)
        }
    }

    return {
        valgtSpillerId,
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
    }
}
