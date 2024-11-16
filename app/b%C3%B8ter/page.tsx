'use client'
import {BotListe} from "@/komponenter/botListe.tsx";
import {useEffect, useState} from "react";
import {Kontakter} from "@/komponenter/Kontakter.tsx";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";
import {fetchForseelser} from "@/lib/forseelseService.ts";

export default function Page() {
    const [forseelser, setForseelser] = useState<Forseelse[]>([])
    useEffect(() => {
        const hentForseelser = async () => {
            const forseelser = await fetchForseelser()
            setForseelser(forseelser)
        }

        hentForseelser().then()
    }, []);

    return (
        <div className="container mx-auto p-4 mt-28">
            <h1 className="text-3xl font-bold mb-6">Oversikt bøter</h1>
            <p>
                <b>Bøtesatser for sesongen 2024/2025</b>:
            </p>
            <ul className="list-disc ml-4">
                <li>Gjelder alle spillere med kontrakt ✍️</li>
                <li>Beløpene dobles på kampdager 🏑</li>
                <li>
                    Ved uenigheter avgjøres saken i en rettssak der botsjefen har det siste
                    ordet 🧑‍⚖️
                </li>
                <li>Bøtene betales via Vipps til botsjefen innen utgangen av hver måned 🗓️</li>
                <li>Bøtene går til lagfester, så alle bidrag går kun tilbake til laget 🍻</li>
            </ul>
            <BotListe forseelser={forseelser}/>
            <Kontakter/>
        </div>
    );
}