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
        <div className="bg-white rounded-lg border shadow-sm p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="font-semibold text-[20px] leading-tight text-slate-900">{forseelse?.navn}</div>
                <div className="text-[14px] text-slate-600">{dato}</div>
            </div>

            <div className="flex items-end justify-between">
                <div className="text-blue-700 font-semibold text-[28px] leading-none tracking-tight">
                    {bot.belop} kr
                </div>
                <span
                    className={
                        erBetalt
                            ? 'inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'inline-flex items-center rounded-full px-3 py-1 text-[13px] font-semibold bg-red-50 text-red-700 border border-red-200'
                    }
                >
                    {erBetalt ? 'Betalt' : 'Ikke betalt'}
                </span>
            </div>

            {harKommentar && (
                <div className="bg-blue-50 text-slate-800 rounded-md px-3 py-2 text-[14px]">{bot.kommentar}</div>
            )}

            {kanEndreStatus && (
                <div className="pt-1">
                    <Knapp
                        className={erBetalt ? 'bg-red-600 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-600'}
                        tekst={erBetalt ? 'Sett ubetalt' : 'Sett betalt'}
                        onClick={onToggleBetalt}
                    />
                </div>
            )}
        </div>
    )
}

export default BotBoks
