import type { Spiller } from '@/lib/spillereService.ts'
import { Knapp } from '@/komponenter/Knapp.tsx'
import { toggleBoterBetalt } from '@/lib/botService.ts'
import React, { useEffect, useState } from 'react'
import dayjs from '@/lib/dayjs.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import { AlertTypes } from '@/komponenter/AlertBanner.tsx'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

export const ListBoter = ({
    forseelser,
    spiller,
    erBotsjef,
    visResultat,
}: {
    forseelser: Forseelse[]
    spiller: Spiller
    erBotsjef: boolean
    visResultat?: (melding: string, type: AlertTypes) => void
}) => {
    const [boterForSpiller, setBoterForSpiller] = useState<Bot[]>([])
    const [visBetalte, setVisBetalte] = useState(false)
    const ubetalteBoter = boterForSpiller.filter((bot) => !bot.erBetalt)
    const betalteBoter = boterForSpiller.filter((bot) => bot.erBetalt)

    useEffect(() => {
        const sorterBoter = [...spiller.boter].sort((a, b) => dayjs(a.dato).valueOf() - dayjs(b.dato).valueOf())
        setBoterForSpiller(sorterBoter)
    }, [spiller])

    if (spiller.boter?.length === 0) return null

    const handleMarkerBetalt = async (bot: Bot) => {
        if (!visResultat) return
        try {
            const oppdatertBot: Bot = {
                ...bot,
                erBetalt: !bot.erBetalt,
            }
            const oppdaterteBoter = boterForSpiller.map((b) => (b.id === bot.id ? oppdatertBot : b))
            setBoterForSpiller(oppdaterteBoter)
            await toggleBoterBetalt([bot.id])
            visResultat(!bot.erBetalt ? 'Markerte bot som betalt' : 'Markerte som ikke betalt', AlertTypes.SUCCESS)
        } catch (error) {
            console.error(error)
            visResultat('Noe gikk galt, ble ikke markert', AlertTypes.ERROR)
        }
    }

    return (
        <div className="flex flex-col gap-2">
            {ubetalteBoter.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
                const dato = dayjs(bot.dato).format('DD.MM.YYYY')
                return (
                    <div key={bot.id} className="bg-white rounded shadow border p-3 flex flex-col gap-1">
                        <div className="font-semibold">{forseelse?.navn}</div>
                        <div><span className="font-medium">Dato:</span> {dato}</div>
                        <div><span className="font-medium">Beløp:</span> {bot.belop} kr</div>
                        <div>
                            <span className="font-semibold text-red-600">Ikke betalt</span>
                        </div>
                        {erBotsjef && (
                            <div>
                                <Knapp
                                    className={''}
                                    tekst={'Sett betalt'}
                                    onClick={() => handleMarkerBetalt(bot)}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
            {betalteBoter.length > 0 && (
                <button
                    className="text-blue-600 underline text-sm mt-2 self-start"
                    onClick={e => { e.stopPropagation(); setVisBetalte((v) => !v) }}
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
                            <div key={bot.id} className="bg-gray-100 rounded shadow border p-3 flex flex-col gap-1 opacity-80">
                                <div className="font-semibold">{forseelse?.navn}</div>
                                <div><span className="font-medium">Dato:</span> {dato}</div>
                                <div><span className="font-medium">Beløp:</span> {bot.belop} kr</div>
                                <div>
                                    <span className="font-semibold text-green-600">Betalt</span>
                                </div>
                                {erBotsjef && (
                                    <div>
                                        <Knapp
                                            className={'bg-red-500 hover:bg-red-500'}
                                            tekst={'Sett ubetalt'}
                                            onClick={() => handleMarkerBetalt(bot)}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
