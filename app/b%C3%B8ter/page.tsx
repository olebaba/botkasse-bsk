'use client'
import {Table} from "@/app/komponenter/table";
import Telefonnummer from "@/app/komponenter/Telefonnummer";
import {fetchForseelser} from "@/app/lib/forseelseService.ts";
import {useEffect, useState} from "react";

export type Forseelse = {
    id: number;
    navn: string;
    beløp: number;
    beskrivelse: string;
};

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
                <b>Bøtesatser for sesongen 2024/2025</b>: Gjelder alle spillere med kontrakt.
                Beløpene dobles på kampdager, og ved uenigheter avgjøres saken i en rettssak der botsjefen har det siste
                ordet.
                Bøtene betales via Vipps til botsjefen innen utgangen av hver måned 🗓️
            </p>
            <p className="mt-2">
                Bøtene går til lagfester, så alle bidrag går kun tilbake til laget 🍻
            </p>
            <h2 className="text-2xl my-4">Kontaktinfo</h2>
            Trener: Bjørn Aasmund Fredsted,<Telefonnummer nummer="48 35 68 55"/>
            Botsjef: Ole Bastian Løchen, <Telefonnummer nummer="97 51 30 23"/>
            <Table botTyper={forseelser}/>
        </div>
    );
}