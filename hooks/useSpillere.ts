import {useEffect, useState} from 'react';
import {type Spiller, hentSpillere} from '@/lib/spillereService.ts';

export function useSpillere(medBoter: boolean) {
    const [spillere, setSpillere] = useState<Spiller[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        setLoading(true)
        const fetchSpillere = async () => {
            const spillere = await hentSpillere(medBoter);
            setSpillere(spillere)
        };

        fetchSpillere().then(() => setLoading(false));
    }, [medBoter]);

    return {spillere, setSpillereMedBoter: setSpillere, loading, error, setError};
}
