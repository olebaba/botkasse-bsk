'use client'
import LeggTilBot from "@/app/b%C3%B8ter/sjef/legg-til-bot";
import {useSpillereOgNavn} from "@/app/hooks/useSpillereOgNavn";

export default function Page() {
    const {spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError} = useSpillereOgNavn();

    return (
        <LeggTilBot spillere={spillere} setSpillere={setSpillere} />
    )
}