import {hentSpillere, oppdaterSpiller, Spiller} from "@/app/lib/spillereService";
import {useEffect, useState} from "react";

interface OversiktProps {
    setError: (err: string) => void,
    spillere: Spiller[],
    setSpillere: (spillere: Spiller[]) => void,
    setAlleNavn: (value: { [p: number]: string }) => void
    alleNavn: { [key: number]: string }
}

export default function Oversikt({setError, spillere, setSpillere, setAlleNavn, alleNavn}: OversiktProps) {
    const oppdaterNavn = (draktnummer: number, navn: string) => {
        const oppdaterteNavn = {navn, [draktnummer]: navn};
        setAlleNavn(oppdaterteNavn);
        localStorage.setItem('spillernavn', JSON.stringify(oppdaterteNavn));
    };

    const markerBetalt = async (draktnummer: number) => {
        try {
            const spiller = spillere.find(s => s.draktnummer === draktnummer);
            if (spiller) {
                const oppdatertSpiller = await oppdaterSpiller(draktnummer, spiller.total_sum, !spiller.betalt_alle);
                setSpillere(spillere.map(s => (s.draktnummer === draktnummer ? oppdatertSpiller : s)));
            }
        } catch (error) {
            setError('Kunne ikke oppdatere spiller');
        }
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-center mb-6">Lagkasseoversikt</h1>
            <table className="min-w-full bg-white border border-gray-200 shadow-lg">
                <thead className="bg-gray-50">
                <tr>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Draktnummer</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Navn</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Total Sum Bøter</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Status</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Handling</th>
                </tr>
                </thead>
                <tbody>
                {spillere.map(spiller => (
                    <tr key={spiller.draktnummer} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">{spiller.draktnummer}</td>
                        <td className="py-2 px-4 border-b">
                            <input
                                type="text"
                                value={alleNavn[spiller.draktnummer] || ''}
                                placeholder="Legg til navn"
                                onChange={e => oppdaterNavn(spiller.draktnummer, e.target.value)}
                                className="border rounded px-2 py-1 w-full"
                            />
                        </td>
                        <td className="py-2 px-4 border-b">{spiller.total_sum} NOK</td>
                        <td className="py-2 px-4 border-b">
                <span
                    className={`${
                        spiller.betalt_alle ? 'text-green-600' : 'text-red-600'
                    } font-semibold`}
                >
                  {spiller.betalt_alle ? 'Betalt' : 'Ikke betalt'}
                </span>
                        </td>
                        <td className="py-2 px-4 border-b">
                            <button
                                onClick={() => markerBetalt(spiller.draktnummer)}
                                className={`px-3 py-1 rounded ${
                                    spiller.betalt_alle
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-green-500 text-white'
                                } hover:bg-opacity-80`}
                            >
                                {spiller.betalt_alle ? 'Marker som ikke betalt' : 'Marker som betalt'}
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    )
}