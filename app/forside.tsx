'use client'
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";
import AlertBanner from "@/komponenter/AlertBanner.tsx";
import {useSpillereMedBoter} from "@/hooks/useSpillereMedBoter.ts";
import {useForseelser} from "@/hooks/useForseelser.ts";
import Header from "@/komponenter/Header.tsx";
import type {User} from "lucia";
import {beregnSum} from "@/lib/botBeregning.ts";

interface ForsideProps {
    bruker?: User
}

export default function Forside({bruker}: ForsideProps) {
    const {spillereMedBoter} = useSpillereMedBoter()
    const {forseelser} = useForseelser()

    const alleBetalteBoter = spillereMedBoter.flatMap(s => s.boter).filter(b => b.erBetalt)
    const sumBetalteBoter: number = beregnSum(alleBetalteBoter)

    return (
        <div className="container mx-auto p-4 mt-24">
            <AlertBanner
                message="Trykk på en rad for å se mer info!"
                type="info"
            />
            <Header className="!mb-0" size="small" text="Hvilke bøter kan man få?"/>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <Header className="mt-2" size="small" text={`Totalt innbetalt: ${sumBetalteBoter}kr 💰`}/>
            <SpillerBøter spillere={spillereMedBoter} forseelser={forseelser} bruker={bruker}/>
        </div>
    );
}
