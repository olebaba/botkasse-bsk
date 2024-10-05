'use client'
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {fetchForseelser, lagBot} from "@/app/lib/forseelseService.ts";
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";

export default function LeggTilBot() {
    const {spillereMedBoter: spillere} = useSpillere()
    const [forseelser, setForseelser] = useState<Forseelse[]>([])
    const [draktnummer, setDraktnummer] = useState<string | undefined>(undefined);
    const [beløp, setBeløp] = useState(0);
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [forseelsesId, setForseelsesId] = useState('');
    const [melding, setMelding] = useState<string | null>(null);
    const [erKampdag, setErKampdag] = useState(false);

    useEffect(() => {
        const hentForseelser = async () => {
            const forseelser = await fetchForseelser()
            setForseelser(forseelser)
        }

        hentForseelser().then()
    }, []);

    const handleLeggTilBot = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!draktnummer || !beløp || !dato || !forseelsesId) {
            setMelding('Alle felter må fylles ut.');
            return;
        }

        try {
            await lagBot(draktnummer, beløp, dato, forseelsesId)

            setMelding('Bot lagt til!');
            setDraktnummer(undefined);
            setBeløp(0);
            setDato('');
            setForseelsesId('');
        } catch (error) {
            console.error(error);
            setMelding('Noe gikk galt, prøv igjen senere.');
        }
    };

    return (
        <div className="container mx-auto p-4 mt-28">
            <h2 className="text-2xl font-bold mb-4">Legg til bot for en spiller</h2>
            {melding && <p className="mb-4 text-red-600">{melding}</p>}
            <form onSubmit={handleLeggTilBot}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="draktnummer">
                        Draktnummer
                    </label>
                    <select
                        id="draktnummer"
                        value={draktnummer || ''}
                        onChange={(e) => setDraktnummer(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="" disabled>Velg en spiller</option>
                        {spillere.map((spiller) => (
                            <option key={spiller.draktnummer} value={spiller.draktnummer}>
                                {spiller.draktnummer} - {spiller.navn}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="type">
                        Type forseelse
                    </label>
                    <select
                        id="forseelse"
                        value={forseelsesId}
                        onChange={(e) => {
                            setForseelsesId(e.target.value);
                            setBeløp(forseelser.find((forseelse) => forseelse.id.toString() == e.target.value)?.beløp || 0)
                        }}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="" disabled>Velg en forseelse</option>
                        {forseelser.map((forseelse, index) => (
                            <option key={index} value={forseelse.id}>
                                {forseelse.navn}
                            </option>
                        ))}
                        <option value="Annet">Annet</option>
                    </select>
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
                        placeholder="F.eks. 100.00"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="beløp">
                        Beløp (NOK)
                    </label>
                    <input
                        type="number"
                        id="beløp"
                        value={beløp * (erKampdag ? 2 : 1)}
                        onChange={(e) => setBeløp(Number.parseFloat(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                        placeholder="F.eks. 100.00"
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

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Legg til bot
                </button>
            </form>
        </div>
    );
}
