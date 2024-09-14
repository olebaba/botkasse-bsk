'use client';

import LeggTilBot from "@/app/bøter/legg-til-bot";
import Oversikt from "@/app/bøter/oversikt";
import {useSpillereOgNavn} from "@/app/hooks/useSpillereOgNavn";

export default function Forside() {
    const { spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError } = useSpillereOgNavn();

    if (loading) return <p>Laster...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <Oversikt setError={setError} spillere={spillere} setSpillere={setSpillere}
                      setAlleNavn={setAlleNavn} alleNavn={alleNavn} />
            <LeggTilBot spillere={spillere}/>
        </div>
    );
}
