'use client';

import {useEffect, useState} from 'react';
import {hentSpillere, Spiller} from '@/app/lib/spillereService';
import LeggTilBot from "@/app/bøter/legg-til-bot";
import Oversikt from "@/app/bøter/oversikt";

export default function Forside() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
    const [spillere, setSpillere] = useState<Spiller[]>([]);
    const [allenavn, setAlleNavn] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        const fetchSpillereOgNavn = async () => {
            try {
                // Hent spillernavn fra lokal JSON-fil
                const navnResponse = await fetch('/spillernavn.json');
                const navnData = await navnResponse.json();
                const navnMap = navnData.reduce((acc: { [key: number]: string }, spiller: {
                    draktnummer: number,
                    navn: string
                }) => {
                    acc[spiller.draktnummer] = spiller.navn;
                    return acc;
                }, {});
                setAlleNavn(navnMap);

                // Hent spillere fra API
                const spillere = await hentSpillere();
                setSpillere(spillere);
            } catch (error) {
                setError('Kunne ikke hente data');
            } finally {
                setLoading(false);
            }
        };

        fetchSpillereOgNavn();
    }, []);

    if (loading) return <p>Laster...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <Oversikt setError={setError} spillere={spillere} setSpillere={setSpillere}
                      setAlleNavn={setAlleNavn} alleNavn={allenavn} />
            <LeggTilBot spillere={spillere}/>
        </div>
    );
}
