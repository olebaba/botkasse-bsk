'use client';

import {useSpillereOgNavn} from "@/app/hooks/useSpillereOgNavn";
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";

export default function Forside() {
    const {spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError} = useSpillereOgNavn();

    if (loading) return <p>Laster...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4 mt-28 overflow-scroll">
            <SpillerBøter setError={setError} spillere={spillere} setSpillere={setSpillere}
                          setAlleNavn={setAlleNavn} alleNavn={alleNavn}/>
        </div>
    );
}
