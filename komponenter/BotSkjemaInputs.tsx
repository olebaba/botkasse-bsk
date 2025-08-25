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
        <>
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

            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="kampdag">
                    Er kampdag (x2 beløp)
                </label>
                <input
                    type="checkbox"
                    id="kampdag"
                    checked={erKampdag}
                    onChange={(e) => onKampdagEndring(e.target.checked)}
                    className="border rounded px-3 py-2 left h-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="beløp">
                    Beløp (NOK)
                </label>
                <input
                    type="number"
                    id="beløp"
                    value={Number(belop).toFixed(1)}
                    onChange={(e) => onBelopEndring(parseFloat(e.target.value))}
                    className="border rounded px-3 py-2 w-full"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-bold mb-2" htmlFor="dato">
                    Dato
                </label>
                <input
                    type="date"
                    id="dato"
                    value={dato}
                    onChange={(e) => onDatoEndring(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                />
            </div>

            <Knapp tekst={`Legg til ${valgteSpillere.length} ${valgteSpillere.length === 1 ? 'bot' : 'bøter'}`} />
        </>
    )
}
