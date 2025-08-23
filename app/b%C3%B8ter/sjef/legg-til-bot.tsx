'use client'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import { lagBot } from '@/lib/forseelseService.ts'
import { Dropdown } from '@/komponenter/Dropdown.tsx'
import Header from '@/komponenter/Header.tsx'
import { Knapp } from '@/komponenter/Knapp.tsx'
import type { Spiller } from '@/lib/spillereService.ts'
import type { Forseelse } from '@/app/api/boter/typer/route.ts'
import AlertBanner, { AlertTypes } from '@/komponenter/AlertBanner.tsx'

export default function LeggTilBot({ spillere, forseelser }: { spillere: Spiller[]; forseelser: Forseelse[] }) {
    const [spillerId, setSpillerId] = useState<string | undefined>(undefined)
    const [belop, setBelop] = useState(0)
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'))
    const [forseelsesId, setForseelsesId] = useState('')
    const [melding, setMelding] = useState<{
        tekst: string
        type: AlertTypes
    } | null>(null)
    const [erKampdag, setErKampdag] = useState(false)

    useEffect(() => {
        if (erKampdag) {
            setBelop((b) => b * 2)
        } else {
            setBelop((b) => b / 2)
        }
    }, [erKampdag])

    const handleLeggTilBot = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!spillerId || !belop || !dato || !forseelsesId) {
            setMelding({ tekst: 'Alle felter må fylles ut.', type: AlertTypes.ERROR })
            return
        }

        try {
            await lagBot(spillerId, Number(belop), dato, forseelsesId)
            setMelding({ tekst: 'Bot lagt til!', type: AlertTypes.SUCCESS })
        } catch (error) {
            console.error(error)
            setMelding({
                tekst: 'Noe gikk galt, prøv igjen senere.',
                type: AlertTypes.ERROR,
            })
        }
    }

    return (
        <div className="container mx-auto p-4 mt-28">
            <Header size="medium" text="Legg til bot for en spiller" />
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}
            <form onSubmit={handleLeggTilBot}>
                <Dropdown
                    id={'draktnummer'}
                    label={'Draktnummer'}
                    options={spillere}
                    placeholder={'Velg en spiller'}
                    onChange={(e) => setSpillerId(e.target.value)}
                />
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
                        setForseelsesId(forseelse.id)
                        setBelop(Number(forseelse.beløp) || 0)
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
                        onChange={(e) => setErKampdag(e.target.checked)}
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
                        onChange={(e) => setBelop(parseFloat(e.target.value))}
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
                        onChange={(e) => setDato(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    />
                </div>
                <Knapp tekst="Legg til bot" />
            </form>
        </div>
    )
}
