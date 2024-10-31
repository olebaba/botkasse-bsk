import {useEffect, useState} from 'react';
import {type Spiller, hentSpillere, hentBoterForAlleSpillere} from '@/lib/spillereService.ts';

export function useSpillereMedBoter() {
    const [spillereMedBoter, setSpillereMedBoter] = useState<Spiller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
    const [hentetSummer, setHentetSummer] = useState<boolean>(false);

    useEffect(() => {
        const fetchSpillere = async () => {
            if (!hentetSummer) {
                const spillere = await hentSpillere();
                const oppdaterteSpillere = await hentBoterForAlleSpillere(spillere);
                setSpillereMedBoter(oppdaterteSpillere)
                setHentetSummer(true);
            }
        };

        setLoading(true)
        fetchSpillere().then(() => setLoading(false));
        // eslint-disable-next-line
    }, []);

    return {spillereMedBoter, setSpillereMedBoter, loading, error, setError};
}
