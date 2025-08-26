import React from 'react'
import dayjs from '@/lib/dayjs.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import type { Bot } from '@/app/api/boter/[spiller_id]/route.ts'

interface BotKortProps {
    bot: Bot
    forseelse: Forseelse | undefined
    erValgt?: boolean
    onToggle?: () => void
    onMarkerUbetalt?: () => void
}

export const UbetaltBotKort = ({ bot, forseelse, erValgt, onToggle }: BotKortProps) => {
    const dato = dayjs(bot.dato).format('DD.MM.YYYY')

    return (
        <div
            className={`border rounded-lg p-4 transition-all cursor-pointer ${
                erValgt ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={onToggle}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        checked={erValgt}
                        onChange={onToggle}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">{forseelse?.navn}</div>
                        <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Dato:</span> {dato}
                        </div>
                        {bot.kommentar && (
                            <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">Kommentar:</span> {bot.kommentar}
                            </div>
                        )}
                        <div className="text-red-600 font-medium text-sm mt-1">Ikke betalt</div>
                    </div>
                </div>
                <div className="text-lg font-bold text-gray-900">{bot.belop} kr</div>
            </div>
        </div>
    )
}

export const BetaltBotKort = ({ bot, forseelse, onMarkerUbetalt }: BotKortProps) => {
    const dato = dayjs(bot.dato).format('DD.MM.YYYY')

    return (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 transition-all">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="font-semibold text-gray-900">{forseelse?.navn}</div>
                    <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Dato:</span> {dato}
                    </div>
                    {bot.kommentar && (
                        <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Kommentar:</span> {bot.kommentar}
                        </div>
                    )}
                    <div className="text-green-600 font-medium text-sm mt-1">Betalt</div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="text-lg font-bold text-gray-900">{bot.belop} kr</div>
                    <button
                        onClick={onMarkerUbetalt}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Marker ubetalt
                    </button>
                </div>
            </div>
        </div>
    )
}
