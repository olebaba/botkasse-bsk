'use client';

import LeggTilBot from "@/app/b%C3%B8ter/legg-til-bot";
import {useSpillereOgNavn} from "@/app/hooks/useSpillereOgNavn";
import BotTabell from "@/app/b%C3%B8ter/bot-tabell";
import Link from "next/link";

export default function Forside() {
    const {spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError} = useSpillereOgNavn();

    if (loading) return <p>Laster...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="container mx-auto p-4">
            <Link href={encodeURIComponent('bøter')}> Oversikt over bøter</Link>
            <BotTabell setError={setError} spillere={spillere} setSpillere={setSpillere}
                       setAlleNavn={setAlleNavn} alleNavn={alleNavn}/>
            <LeggTilBot spillere={spillere} setSpillere={setSpillere}/>
        </div>
    );
}
