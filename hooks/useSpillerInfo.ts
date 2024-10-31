import {useEffect, useState} from 'react';
import {fetchSpillerInfo} from "@/lib/brukerService.ts";
import type {SpillerInfo} from "@/app/api/spillere/[id]/route.ts";

export function useSpillerInfo(brukernavn: string) {
    const [spillerInfo, setSpillerInfo] = useState<SpillerInfo>();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchSpillere = async () => {
            const oppdaterteSpillere = await fetchSpillerInfo(brukernavn);
            setSpillerInfo(oppdaterteSpillere)
        };

        setLoading(true)
        fetchSpillere().then(() => setLoading(false));
        // eslint-disable-next-line
    }, []);

    return {spillerInfo, loading, error, setError};
}
