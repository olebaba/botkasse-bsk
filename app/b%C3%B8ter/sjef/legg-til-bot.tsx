'use client'
import dayjs from "dayjs";
import React, {useEffect, useState} from "react";
import {lagBot} from "@/lib/forseelseService.ts";
import {Dropdown} from "@/komponenter/Dropdown.tsx";
import Header from "@/komponenter/Header.tsx";
import {Knapp} from "@/komponenter/Knapp.tsx";
import type {Spiller} from "@/lib/spillereService.ts";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";

export default function LeggTilBot({spillere, forseelser}: {spillere: Spiller[], forseelser: Forseelse[]}) {
    const [spillerId, setSpillerId] = useState<string | undefined>(undefined);
    const [belop, setBelop] = useState(0);
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [forseelsesId, setForseelsesId] = useState('');
    const [melding, setMelding] = useState<string | null>(null);
    const [erKampdag, setErKampdag] = useState(false);

    useEffect(() => {
        if (erKampdag) {
            setBelop(b => b * 2)
        } else {
            setBelop(b => b / 2)
        }
    }, [erKampdag]);

    const handleLeggTilBot = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!spillerId || !belop || !dato || !forseelsesId) {
            setMelding('Alle felter må fylles ut.');
            return;
        }

        try {
            await lagBot(spillerId, belop, dato, forseelsesId)

            setMelding('Bot lagt til!');
            setSpillerId(undefined);
            setBelop(0);
            setDato('');
            setForseelsesId('');
        } catch (error) {
            console.error(error);
            setMelding('Noe gikk galt, prøv igjen senere.');
        }
    };

    return (
        <div className="container mx-auto p-4 mt-28">
            <Header size="medium" text="Legg til bot for en spiller"/>
            {melding && <p className="mb-4 text-red-600">{melding}</p>}
            <form onSubmit={handleLeggTilBot}>
                <Dropdown
                    id={"draktnummer"}
                    label={"Draktnummer"}
                    options={spillere}
                    placeholder={"Velg en spiller"}
                    onChange={(e) => setSpillerId(e.target.value)}
                />
                <Dropdown
                    options={forseelser}
                    label="Type forseelse"
                    placeholder="Velg en forseelse"
                    id="forseelse"
                    onChange={(e) => {
                        setForseelsesId(e.target.value);
                        setBelop(forseelser.find((forseelse) => forseelse.id.toString() == e.target.value)?.beløp || 0)
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
                        value={belop}
                        onChange={(e) => setBelop(Number.parseFloat(e.target.value))}
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
                <Knapp tekst="Legg til bot"/>
            </form>
        </div>
    );
}
