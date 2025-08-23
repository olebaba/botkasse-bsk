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
    if (spiller.boter?.length === 0) return null

    useEffect(() => {
        const sorterBoter = [...spiller.boter].sort((a, b) => dayjs(a.dato).valueOf() - dayjs(b.dato).valueOf())
        setBoterForSpiller(sorterBoter)
    }, [spiller])

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
            {boterForSpiller?.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
                const dato = dayjs(bot.dato).format('DD.MM.YYYY')
                return (
                    <div key={bot.id} className="bg-white rounded shadow border p-3 flex flex-col gap-1">
                        <div className="font-semibold">{forseelse?.navn}</div>
                        <div><span className="font-medium">Dato:</span> {dato}</div>
                        <div><span className="font-medium">Beløp:</span> {bot.belop} kr</div>
                        <div>
                            <span className={`font-semibold ${bot.erBetalt ? 'text-green-600' : 'text-red-600'}`}>{bot.erBetalt ? 'Betalt' : 'Ikke betalt'}</span>
                        </div>
                        {erBotsjef && (
                            <div>
                                <Knapp
                                    className={bot.erBetalt ? 'bg-red-500 hover:bg-red-500' : ''}
                                    tekst={bot.erBetalt ? 'Sett ubetalt' : 'Sett betalt'}
                                    onClick={async () => {
                                        await handleMarkerBetalt(bot)
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
