import { useState, useMemo } from 'react'
import { toggleBoterBetalt } from '@/lib/botService.ts'
import { AlertTypes } from '@/komponenter/ui/AlertBanner.tsx'
import dayjs from '@/lib/dayjs.ts'
import type { Spiller } from '@/lib/spillereService.ts'

export const useBoterBehandling = () => {
    const [valgtSpiller, setValgtSpiller] = useState<Spiller>()
    const [valgteBoter, setValgteBoter] = useState<Set<string>>(new Set())
    const [visBetalteBøter, setVisBetalteBøter] = useState(false)
    const [melding, setMelding] = useState<{ tekst: string; type: AlertTypes } | null>(null)

    const ubetalteBoter = useMemo(() => {
        if (!valgtSpiller) return []
        return (
            valgtSpiller.boter
                ?.filter((bot) => !bot.erBetalt)
                .sort((a, b) => dayjs(a.dato).valueOf() - dayjs(b.dato).valueOf()) || []
        )
    }, [valgtSpiller])

    const betalteBoter = useMemo(() => {
        if (!valgtSpiller) return []
        return (
            valgtSpiller.boter
                ?.filter((bot) => bot.erBetalt)
                .sort((a, b) => dayjs(b.dato).valueOf() - dayjs(a.dato).valueOf()) || []
        )
    }, [valgtSpiller])

    const totalBelop = useMemo(() => {
        return ubetalteBoter.filter((bot) => valgteBoter.has(bot.id)).reduce((sum, bot) => sum + bot.belop, 0)
    }, [ubetalteBoter, valgteBoter])

    const handleSpillerValg = (spiller: Spiller | undefined) => {
        setValgtSpiller(spiller)
        setValgteBoter(new Set())
        setMelding(null)
        setVisBetalteBøter(false)
    }

    const handleBotToggle = (botId: string) => {
        const nyeValgteBoter = new Set(valgteBoter)
        if (nyeValgteBoter.has(botId)) {
            nyeValgteBoter.delete(botId)
        } else {
            nyeValgteBoter.add(botId)
        }
        setValgteBoter(nyeValgteBoter)
    }

    const handleVelgToggle = () => {
        if (valgteBoter.size === ubetalteBoter.length) {
            setValgteBoter(new Set())
        } else {
            setValgteBoter(new Set(ubetalteBoter.map((bot) => bot.id)))
        }
    }

    const handleMarkerBetalt = async () => {
        if (valgteBoter.size === 0) {
            setMelding({ tekst: 'Velg minst én bot å markere som betalt', type: AlertTypes.ERROR })
            return
        }

        try {
            await toggleBoterBetalt(Array.from(valgteBoter))

            if (valgtSpiller) {
                const oppdatertSpiller = {
                    ...valgtSpiller,
                    boter: valgtSpiller.boter?.map((bot) =>
                        valgteBoter.has(bot.id) ? { ...bot, erBetalt: true } : bot,
                    ),
                }
                setValgtSpiller(oppdatertSpiller)
            }

            setMelding({
                tekst: `Markerte ${valgteBoter.size} ${valgteBoter.size === 1 ? 'bot' : 'bøter'} som betalt`,
                type: AlertTypes.SUCCESS,
            })
            setValgteBoter(new Set())
        } catch (error) {
            console.error(error)
            setMelding({ tekst: 'Noe gikk galt ved markering av bøter', type: AlertTypes.ERROR })
        }
    }

    const handleMarkerUbetalt = async (botId: string) => {
        try {
            await toggleBoterBetalt([botId])

            if (valgtSpiller) {
                const oppdatertSpiller = {
                    ...valgtSpiller,
                    boter: valgtSpiller.boter?.map((bot) => (bot.id === botId ? { ...bot, erBetalt: false } : bot)),
                }
                setValgtSpiller(oppdatertSpiller)
            }

            setMelding({ tekst: 'Markerte bot som ubetalt', type: AlertTypes.SUCCESS })
        } catch (error) {
            console.error(error)
            setMelding({ tekst: 'Noe gikk galt ved markering av bot', type: AlertTypes.ERROR })
        }
    }

    return {
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
    }
}
