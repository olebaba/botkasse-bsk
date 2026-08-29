import React, { useState } from 'react'
import dayjs from '@/lib/dayjs'
import { lagBot } from '@/lib/forseelseService.ts'
import { AlertTypes } from '@/komponenter/ui/AlertBanner.tsx'

export function useBotSkjema() {
    const [valgteSpillere, setValgteSpillere] = useState<string[]>([])
    const [belop, setBelop] = useState(0)
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'))
    const [forseelsesId, setForseelsesId] = useState('')
    const [kommentar, setKommentar] = useState('')
    const [melding, setMelding] = useState<{
        tekst: string
        type: AlertTypes
    } | null>(null)
    const [erKampdag, setErKampdag] = useState(false)

    // Kampdag dobler beløpet. Justeres i selve toggle-handleren (ikke i en effekt)
    // for å unngå at beløpet kan bli dobbelt-multiplisert ved gjentatte effekt-kjøringer.
    const handleErKampdagEndring = (nyErKampdag: boolean) => {
        setErKampdag(nyErKampdag)
        setBelop((b) => (nyErKampdag ? b * 2 : b / 2))
    }

    const handleSpillerToggle = (spillerId: string) => {
        setValgteSpillere((prev) =>
            prev.includes(spillerId) ? prev.filter((id) => id !== spillerId) : [...prev, spillerId],
        )
    }

    const handleVelgAlle = (spillere: { id: string }[]) => {
        setValgteSpillere(spillere.map((spiller) => spiller.id))
    }

    const handleFjernAlle = () => {
        setValgteSpillere([])
    }

    const handleForseelseEndring = (forseelseId: string, nyttBelop: number) => {
        setForseelsesId(forseelseId)
        // Hvis kampdag er aktivt, dobler vi det nye beløpet
        setBelop(erKampdag ? nyttBelop * 2 : nyttBelop)
    }

    const handleLeggTilBoter = async (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault()
        }

        if (valgteSpillere.length === 0 || !belop || !dato || !forseelsesId) {
            setMelding({ tekst: 'Velg minst én spiller og fyll ut alle felter.', type: AlertTypes.ERROR })
            return
        }

        try {
            await Promise.all(
                valgteSpillere.map((spillerId) =>
                    lagBot(spillerId, Number(belop), dato, forseelsesId, kommentar || undefined),
                ),
            )
            setMelding({
                tekst: `${valgteSpillere.length + ' ' + (valgteSpillere.length === 1 ? 'bot' : 'bøter')} lagt til!`,
                type: AlertTypes.SUCCESS,
            })
            setValgteSpillere([])
            setKommentar('')
        } catch (error) {
            console.error(error)
            setMelding({
                tekst: 'Noe gikk galt, prøv igjen senere.',
                type: AlertTypes.ERROR,
            })
        }
    }

    return {
        valgteSpillere,
        belop,
        dato,
        forseelsesId,
        kommentar,
        melding,
        erKampdag,
        setBelop,
        setDato,
        setKommentar,
        handleErKampdagEndring,
        handleSpillerToggle,
        handleVelgAlle,
        handleFjernAlle,
        handleForseelseEndring,
        handleLeggTilBoter,
    }
}
