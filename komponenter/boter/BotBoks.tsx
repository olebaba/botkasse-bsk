import { Knapp } from '@/komponenter/ui/Knapp.tsx'
import React from 'react'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'

interface BotBoksProps {
    bot: Bot
    forseelse?: Forseelse
    dato: string
    erBetalt: boolean
    kanEndreStatus: boolean
    onToggleBetalt?: () => void
}

const BotBoks: React.FC<BotBoksProps> = ({ bot, forseelse, dato, erBetalt, kanEndreStatus, onToggleBetalt }) => {
    const harKommentar = bot.kommentar && bot.kommentar.trim() !== ''

    return (
        <div
            className={
                erBetalt
                    ? 'bg-gray-100 rounded shadow border p-3 flex flex-col gap-1 opacity-80'
                    : 'bg-white rounded shadow border p-3 flex flex-col gap-1'
            }
        >
            <div className="font-semibold">{forseelse?.navn}</div>
            <div>
                <span className="font-medium">Dato:</span> {dato}
            </div>
            <div>
                <span className="font-medium">Beløp:</span> {bot.belop} kr
            </div>
            <div>
                <span className={erBetalt ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                    {erBetalt ? 'Betalt' : 'Ikke betalt'}
                </span>
            </div>
            {harKommentar && <div className="bg-blue-200 rounded p-1">{bot.kommentar}</div>}
            <div className="flex flex-row gap-2">
                {kanEndreStatus && (
                    <Knapp
                        className={erBetalt ? 'bg-red-500 hover:bg-red-500' : 'bg-green-600 hover:bg-green-600'}
                        tekst={erBetalt ? 'Sett ubetalt' : 'Sett betalt'}
                        onClick={onToggleBetalt}
                    />
                )}
            </div>
        </div>
    )
}

export default BotBoks
