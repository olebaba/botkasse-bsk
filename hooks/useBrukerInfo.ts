import {useEffect, useState} from 'react';
import type {BrukerInfo} from "@/app/api/spillere/[brukernavn]/route.ts";
import {fetchBrukerInfo} from "@/lib/brukerService.ts";

export function useBrukerInfo(brukernavn: string) {
    const [brukerInfo, setBrukerInfo] = useState<BrukerInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);

    useEffect(() => {
        const fetchSpillere = async () => {
            const oppdaterteSpillere = await fetchBrukerInfo(brukernavn);
            setBrukerInfo(oppdaterteSpillere)
        };

        setLoading(true)
        fetchSpillere().then(() => setLoading(false));
        // eslint-disable-next-line
    }, []);

    return {brukerInfo, loading, error, setError};
}
