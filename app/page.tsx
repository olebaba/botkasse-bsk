'use client';

import {useSpillereOgNavn} from "@/app/hooks/useSpillereOgNavn";
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";

export default function Forside() {
    const {spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError} = useSpillereOgNavn();

    if (loading) return <p>Laster...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4 mt-24 overflow-scroll">
            <h3 className="text-xl mt-2">Hvilke bøter kan man få?</h3>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <SpillerBøter setError={setError} spillere={spillere} setSpillere={setSpillere}
                          setAlleNavn={setAlleNavn} alleNavn={alleNavn}/>
        </div>
    );
}
