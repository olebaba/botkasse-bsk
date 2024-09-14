'use client';

import { useState } from 'react';

type Spiller = {
    draktnummer: number;
    navn?: string;
};

export default function LeggTilBot({ spillere }: { spillere: Spiller[] }) {
    const [draktnummer, setDraktnummer] = useState<number | undefined>(undefined);
    const [beløp, setBeløp] = useState('');
    const [dato, setDato] = useState('');
    const [type, setType] = useState('');
    const [melding, setMelding] = useState<string | null>(null);

    const handleLeggTilBot = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!draktnummer || !beløp || !dato || !type) {
            setMelding('Alle felter må fylles ut.');
            return;
        }

        try {
            const response = await fetch('/api/boter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    draktnummer,
                    beløp: parseFloat(beløp),
                    dato,
                    type,
                }),
            });

            if (!response.ok) {
                throw new Error('Kunne ikke legge til bot.');
            }

            setMelding('Bot lagt til!');
            setDraktnummer(undefined);
            setBeløp('');
            setDato('');
            setType('');
        } catch (error) {
            setMelding('Noe gikk galt, prøv igjen senere.');
        }
    };

    return (
        <div className="container mx-auto p-4">
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
                        onChange={(e) => setDraktnummer(parseInt(e.target.value))}
                        className="border rounded px-3 py-2 w-full"
                    >
                        <option value="" disabled>
                            Velg en spiller
                        </option>
                        {spillere.map((spiller) => (
                            <option key={spiller.draktnummer} value={spiller.draktnummer}>
                                {spiller.draktnummer} - {spiller.navn}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="beløp">
                        Beløp (NOK)
                    </label>
                    <input
                        type="number"
                        id="beløp"
                        value={beløp}
                        onChange={(e) => setBeløp(e.target.value)}
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

                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="type">
                        Type forseelse
                    </label>
                    <input
                        type="text"
                        id="type"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="border rounded px-3 py-2 w-full"
                        placeholder="F.eks. Sen ankomst"
                    />
                </div>

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Legg til bot
                </button>
            </form>
        </div>
    );
}
