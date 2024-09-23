'use client';

import React, {useEffect, useState} from 'react';
import {Table} from "@/app/komponenter/table";
import Telefonnummer from "@/app/komponenter/Telefonnummer";

export type Forseelse = {
    id: number;
    navn: string;
    beløp: number;
    beskrivelse: string;
};

export default function Page() {
    const [botTyper, setBotTyper] = useState<Forseelse[]>([]);
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
        <div className="container mx-auto p-4 mt-28">
            <h1 className="text-3xl font-bold mb-6">Oversikt bøter</h1>
            <p>
                <b>Bøtesatser for sesongen 2024/2025</b>: Gjelder alle spillere med kontrakt.
                Beløpene dobles på kampdager, og ved uenigheter avgjøres saken i en rettssak der botsjefen har det siste
                ordet.
                Bøtene betales via Vipps til botsjefen innen utgangen av hver måned 🗓️
            </p>
            <p className="mt-2">
                Bøtene går til lagfester, så alle bidrag går kun tilbake til laget 🍻
            </p>
            <h2 className="text-2xl my-4">Kontaktinfo</h2>
            Trener: Bjørn Aasmund Fredsted,<Telefonnummer nummer="48 35 68 55"/>
            Botsjef: Ole Bastian Løchen, <Telefonnummer nummer="97 51 30 23"/>
            <Table botTyper={botTyper}/>
        </div>
    );
}