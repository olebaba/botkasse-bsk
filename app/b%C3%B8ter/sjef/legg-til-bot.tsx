'use client'
import dayjs from "dayjs";
import React, {useState} from "react";
import {lagBot} from "@/app/lib/forseelseService.ts";
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import {Dropdown} from "@/app/komponenter/Dropdown.tsx";

export default function LeggTilBot() {
    const {spillereMedBoter: spillere} = useSpillere()
    const {forseelser} = useForseelser()
    const [draktnummer, setDraktnummer] = useState<string | undefined>(undefined);
    const [beløp, setBeløp] = useState(0);
    const [dato, setDato] = useState(dayjs().format('YYYY-MM-DD'));
    const [forseelsesId, setForseelsesId] = useState('');
    const [melding, setMelding] = useState<string | null>(null);
    const [erKampdag, setErKampdag] = useState(false);


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
                <Dropdown
                    id={"draktnummer"}
                    label={"Draktnummer"}
                    options={spillere}
                    idKey={"draktnummer"}
                    placeholder={"Velg en spiller"}
                    onChange={(e) => setDraktnummer(e.target.value)}
                />
                <Dropdown
                    options={forseelser}
                    label="Type forseelse"
                    placeholder="Velg en forseelse"
                    id="forseelse"
                    onChange={(e) => {
                        setForseelsesId(e.target.value);
                        setBeløp(forseelser.find((forseelse) => forseelse.id.toString() == e.target.value)?.beløp || 0)
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
