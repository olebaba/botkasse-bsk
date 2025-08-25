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
    const [valgteSpillere, setValgteSpillere] = useState<string[]>([])
    const [belop, setBelop] = useState(0)
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'))
    const [forseelsesId, setForseelsesId] = useState('')
    const [melding, setMelding] = useState<{
        tekst: string
        type: AlertTypes
    } | null>(null)
    const [erKampdag, setErKampdag] = useState(false)
    const [soketerm, setSoketerm] = useState('')

    const filtreteSpillere = spillere.filter(spiller =>
        spiller.navn.toLowerCase().includes(soketerm.toLowerCase()) ||
        spiller.draktnummer?.toString().includes(soketerm)
    )

    useEffect(() => {
        if (erKampdag) {
            setBelop((b) => b * 2)
        } else {
            setBelop((b) => b / 2)
        }
    }, [erKampdag])

    const handleSpillerToggle = (spillerId: string) => {
        setValgteSpillere((prev) =>
            prev.includes(spillerId)
                ? prev.filter((id) => id !== spillerId)
                : [...prev, spillerId]
        )
    }

    const handleVelgAlle = () => {
        setValgteSpillere(filtreteSpillere.map((spiller) => spiller.id))
    }

    const handleFjernAlle = () => {
        setValgteSpillere([])
    }

    const handleLeggTilBoter = async (e: React.FormEvent) => {
        e.preventDefault()

        if (valgteSpillere.length === 0 || !belop || !dato || !forseelsesId) {
            setMelding({ tekst: 'Velg minst én spiller og fyll ut alle felter.', type: AlertTypes.ERROR })
            return
        }

        try {
            await Promise.all(
                valgteSpillere.map((spillerId) => lagBot(spillerId, Number(belop), dato, forseelsesId))
            )
            setMelding({
                tekst: `${valgteSpillere.length} bot(er) lagt til!`,
                type: AlertTypes.SUCCESS,
            })
            setValgteSpillere([])
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
            <Header size="medium" text="Legg til bot for flere spillere" />
            {melding && <AlertBanner message={melding.tekst} type={melding.type} />}
            <form onSubmit={handleLeggTilBoter}>
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
                    <label className="block text-gray-700 font-bold mb-2">
                        Velg spillere ({valgteSpillere.length} valgt)
                    </label>

                    <div className="mb-3">
                        <input
                            type="text"
                            placeholder="Søk etter spiller..."
                            value={soketerm}
                            onChange={(e) => setSoketerm(e.target.value)}
                            className="border rounded px-3 py-2 w-full mb-2"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                        <button
                            type="button"
                            onClick={handleVelgAlle}
                            className="px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex-1 sm:flex-none"
                        >
                            Velg alle ({filtreteSpillere.length})
                        </button>
                        <button
                            type="button"
                            onClick={handleFjernAlle}
                            className="px-3 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 flex-1 sm:flex-none"
                        >
                            Fjern alle
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-80 overflow-y-auto border rounded p-3 bg-gray-50">
                        {filtreteSpillere.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-4">
                                Ingen spillere funnet
                            </div>
                        ) : (
                            filtreteSpillere.map((spiller) => (
                                <label key={spiller.id} className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-white rounded">
                                    <input
                                        type="checkbox"
                                        checked={valgteSpillere.includes(spiller.id)}
                                        onChange={() => handleSpillerToggle(spiller.id)}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                    />
                                    <span className="text-sm flex-1">
                                        {spiller.navn}
                                        {spiller.draktnummer && (
                                            <span className="text-gray-500 ml-1">#{spiller.draktnummer}</span>
                                        )}
                                    </span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

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
                <Knapp tekst={`Legg til ${valgteSpillere.length} bot(er)`} />
            </form>
        </div>
    )
}
