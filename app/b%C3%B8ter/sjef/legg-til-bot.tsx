import React, {useState} from 'react';
import {useForseelser} from "@/app/hooks/useForseelser";
import {Spiller} from "@/app/lib/spillereService";

export default function LeggTilBot({spillere, setSpillere}: {
    spillere: Spiller[],
    setSpillere: (value: (Spiller[])) => void
}) {
    const {forseelser} = useForseelser(); // Custom hook for bot-typer
    console.log(forseelser)
    const [draktnummer, setDraktnummer] = useState<number | undefined>(undefined);
    const [beløp, setBeløp] = useState('');
    const [dato, setDato] = useState('');
    const [forseelsesId, setForseelsesId] = useState('');
    const [melding, setMelding] = useState<string | null>(null);

    const oppdaterSpillerSummer = (draktnummer: number, ekstraBeløp: number) => {
        setSpillere(spillere.map((spiller) =>
            spiller.draktnummer === draktnummer
                ? {...spiller, totalSum: (+spiller.totalSum + +ekstraBeløp)}
                : spiller
        ));
    };

    const handleLeggTilBot = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!draktnummer || !beløp || !dato || !forseelsesId) {
            setMelding('Alle felter må fylles ut.');
            return;
        }

        try {
            const response = await fetch('/api/boter/' + draktnummer, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    beløp: parseFloat(beløp),
                    dato,
                    forseelsesId,
                }),
            });

            if (!response.ok) {
                throw new Error('Kunne ikke legge til bot.');
            }

            // Oppdater spillernes summer lokalt
            oppdaterSpillerSummer(draktnummer, parseFloat(beløp));

            setMelding('Bot lagt til!');
            setDraktnummer(undefined);
            setBeløp('');
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
                        onChange={(e) => setDraktnummer(parseInt(e.target.value))}
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
                    <select
                        id="forseelse"
                        value={forseelsesId}
                        onChange={(e) => {
                            setForseelsesId(e.target.value);
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

                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Legg til bot
                </button>
            </form>
        </div>
    );
}
