'use client'

import type { Spiller } from '@/lib/spillereService.ts'
import { toggleBoterBetalt } from '@/lib/botService.ts'
import React, { useEffect, useState } from 'react'
import dayjs from '@/lib/dayjs.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import { AlertTypes } from '@/komponenter/ui/AlertBanner.tsx'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'
import { filtrerBoterForSesong, filtrerBoterForSpesifikkSesong } from '@/lib/botBeregning'
import BotBoks from '@/komponenter/boter/BotBoks'

export const ListBoter = ({
    forseelser,
    spiller,
    erBotsjef,
    visResultatAction,
    visAlleSesonger = false,
    valgtSesong,
}: {
    forseelser: Forseelse[]
    spiller: Spiller
    erBotsjef: boolean
    visResultatAction: (melding: string, type: AlertTypes) => void
    visAlleSesonger?: boolean
    valgtSesong?: string
}) => {
    const [boterForSpiller, setBoterForSpiller] = useState<Bot[]>([])
    const [visBetalte, setVisBetalte] = useState(false)

    const filtrerteBoter = valgtSesong
        ? filtrerBoterForSpesifikkSesong(boterForSpiller, valgtSesong)
        : filtrerBoterForSesong(boterForSpiller, visAlleSesonger)

    const ubetalteBoter = filtrerteBoter.filter((bot) => !bot.erBetalt)
    const betalteBoter = filtrerteBoter.filter((bot) => bot.erBetalt)

    useEffect(() => {
        const sorterBoter = [...spiller.boter].sort((a, b) => dayjs(a.dato).valueOf() - dayjs(b.dato).valueOf())
        setBoterForSpiller(sorterBoter)
    }, [spiller])

    if (spiller.boter?.length === 0) return null

    const handleMarkerBetalt = async (bot: Bot) => {
        try {
            const oppdatertBot: Bot = {
                ...bot,
                erBetalt: !bot.erBetalt,
            }
            const oppdaterteBoter = boterForSpiller.map((b) => (b.id === bot.id ? oppdatertBot : b))
            setBoterForSpiller(oppdaterteBoter)
            await toggleBoterBetalt([bot.id])
            visResultatAction(
                !bot.erBetalt ? 'Markerte bot som betalt' : 'Markerte som ikke betalt',
                AlertTypes.SUCCESS,
            )
        } catch (error) {
            console.error(error)
            visResultatAction('Noe gikk galt, ble ikke markert', AlertTypes.ERROR)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {ubetalteBoter.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
                const dato = dayjs(bot.dato).format('DD.MM.YYYY')
                return (
                    <BotBoks
                        key={bot.id}
                        bot={bot}
                        forseelse={forseelse}
                        dato={dato}
                        erBetalt={false}
                        kanEndreStatus={erBotsjef}
                        onToggleBetalt={() => handleMarkerBetalt(bot)}
                    />
                )
            })}
            {betalteBoter.length > 0 && (
                <button
                    className="text-blue-600 underline text-sm mt-2 self-start"
                    onClick={(e) => {
                        e.stopPropagation()
                        setVisBetalte((v) => !v)
                    }}
                    tabIndex={0}
                >
                    {visBetalte ? 'Skjul betalte bøter' : `Vis betalte bøter (${betalteBoter.length})`}
                </button>
            )}
            {visBetalte && (
                <div className="flex flex-col gap-2">
                    {betalteBoter.map((bot) => {
                        const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
                        const dato = dayjs(bot.dato).format('DD.MM.YYYY')
                        return (
                            <BotBoks
                                key={bot.id}
                                bot={bot}
                                forseelse={forseelse}
                                dato={dato}
                                erBetalt={true}
                                kanEndreStatus={erBotsjef}
                                onToggleBetalt={() => handleMarkerBetalt(bot)}
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}
