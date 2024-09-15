'use client';

import React, { useEffect, useState } from 'react';

export type BotType = {
    id: number;
    navn: string;
    beløp: number;
    beskrivelse: string;
};

export default function Page() {
    const [botTyper, setBotTyper] = useState<BotType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBotTyper = async () => {
            const response = await fetch('/api/boter/typer');
            if (!response.ok) {
                throw new Error('Feil ved henting av bøtetyper');
            }
            const data = await response.json();
            setBotTyper(data);
        };

        fetchBotTyper()
            .catch((error) => {
                console.error(error);
                setError(error.message || 'Ukjent feil oppstod');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Laster oversikt over alle typer bøter...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Oversikt bøter</h1>
            <table className="min-w-full bg-white border border-gray-200 shadow-lg">
                <thead className="bg-gray-50">
                <tr>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Forseelse</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Standard Beløp (NOK)</th>
                    <th className="py-2 px-4 text-left font-semibold text-gray-700 border-b">Beskrivelse</th>
                </tr>
                </thead>
                <tbody>
                {botTyper.map((botType) => (
                    <tr key={botType.id} className="hover:bg-gray-100">
                        <td className="py-2 px-4 border-b">{botType.navn}</td>
                        <td className="py-2 px-4 border-b">{botType.beløp} NOK</td>
                        <td className="py-2 px-4 border-b">{botType.beskrivelse}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
