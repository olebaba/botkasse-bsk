import { useEffect, useState } from 'react';
import { Spiller, hentSpillere } from '../lib/spillereService';

export function useSpillereOgNavn() {
    const [spillere, setSpillere] = useState<Spiller[]>([]);
    const [alleNavn, setAlleNavn] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchSpillereOgNavn = async () => {
            // Hent spillernavn fra lokal JSON-fil
            const navnResponse = await fetch('/spillernavn.json');
            const navnData = await navnResponse.json();
            const navnMap = navnData.reduce((acc: { [key: number]: string }, spiller: { draktnummer: number; navn: string }) => {
                acc[spiller.draktnummer] = spiller.navn;
                return acc;
            }, {});
            setAlleNavn(navnMap);

            // Hent spillere fra API
            const spillere = await hentSpillere();
            setSpillere(spillere);
        };

        fetchSpillereOgNavn()
            .catch((error) => {
                console.error(error)
                setError('Kunne ikke hente data');
            })
            .finally(() => {
                setLoading(false);
            })
    }, []);

    return { spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError };
}
