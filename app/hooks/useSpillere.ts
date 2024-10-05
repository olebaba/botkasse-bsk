import {useEffect, useState} from 'react';
import {type Spiller, hentSpillere, hentSummerForAlleSpillere} from '../lib/spillereService';

export function useSpillere() {
    const [spillereMedBoter, setSpillereMedBoter] = useState<Spiller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
    const [hentetSummer, setHentetSummer] = useState<boolean>(false);

    useEffect(() => {
        const fetchSpillere = async () => {
            if (!hentetSummer) {
                const spillere = await hentSpillere();
                const oppdaterteSpillere = await hentSummerForAlleSpillere(spillere);
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
