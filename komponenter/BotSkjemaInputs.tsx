import React from 'react'
import { Dropdown } from '@/komponenter/Dropdown.tsx'
import { Knapp } from '@/komponenter/Knapp.tsx'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'

interface BotSkjemaInputsProps {
    forseelser: Forseelse[]
    belop: number
    dato: string
    erKampdag: boolean
    valgteSpillere: string[]
    onForseelseEndring: (forseelseId: string, nyttBelop: number) => void
    onBelopEndring: (belop: number) => void
    onDatoEndring: (dato: string) => void
    onKampdagEndring: (erKampdag: boolean) => void
}

export default function BotSkjemaInputs({
    forseelser,
    belop,
    dato,
    erKampdag,
    valgteSpillere,
    onForseelseEndring,
    onBelopEndring,
    onDatoEndring,
    onKampdagEndring,
}: BotSkjemaInputsProps) {
    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-4">
                <Dropdown
                    options={forseelser}
                    label="Type forseelse"
                    placeholder="Velg en forseelse"
                    id="forseelse"
                    onChange={(e) => {
                        const forseelse = forseelser.find((forseelse) => forseelse.id.toString() == e.target.value)
                        if (!forseelse) {
                            console.warn('Fant ikke forseelse med id', e.target.value)
                            return
                        }
                        onForseelseEndring(forseelse.id, Number(forseelse.beløp) || 0)
                    }}
                />

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                        type="checkbox"
                        id="kampdag"
                        checked={erKampdag}
                        onChange={(e) => onKampdagEndring(e.target.checked)}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label className="text-gray-700 font-medium cursor-pointer" htmlFor="kampdag">
                        Er kampdag <span className="text-blue-600 font-semibold">(x2 beløp)</span>
                    </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="beløp">
                            Beløp (NOK)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                id="beløp"
                                value={Number(belop).toFixed(1)}
                                onChange={(e) => onBelopEndring(parseFloat(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                min="0"
                                step="0.1"
                            />
                            <span className="absolute right-3 top-3 text-gray-500 font-medium">kr</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2" htmlFor="dato">
                            Dato
                        </label>
                        <input
                            type="date"
                            id="dato"
                            value={dato}
                            onChange={(e) => onDatoEndring(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <Knapp tekst={`Legg til ${valgteSpillere.length} ${valgteSpillere.length === 1 ? 'bot' : 'bøter'}`} />
            </div>
        </div>
    )
}
