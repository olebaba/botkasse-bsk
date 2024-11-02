'use client'
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";
import AlertBanner from "@/komponenter/AlertBanner.tsx";
import {useSpillere} from "@/hooks/useSpillere.ts";
import {useForseelser} from "@/hooks/useForseelser.ts";
import Header from "@/komponenter/Header.tsx";
import type {User} from "lucia";
import {beregnSum} from "@/lib/botBeregning.ts";

interface ForsideProps {
    bruker?: User
}

export default function Forside({bruker}: ForsideProps) {
    const {spillere} = useSpillere(true)
    const {forseelser} = useForseelser()

    const alleBetalteBoter = spillere.flatMap(s => s.boter).filter(b => b.erBetalt)
    const sumBetalteBoter: number = beregnSum(alleBetalteBoter)

    return (
        <div className="container mx-auto p-4 mt-24">
            <AlertBanner
                message="Trykk på menyen for å opprette bruker!"
                type="info"
            />
            <Header className="!mb-0" size="small" text="Hvilke bøter kan man få?"/>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <div className="flex flex-row">
                <Header className="mt-2 mr-2" size="small" text={`Totalt innbetalt:`}/>
                {!sumBetalteBoter && (<p className="mt-2 animate-spin-cool h-[20px] text-center object-cover">💰</p>)}
                {sumBetalteBoter > 0 && (<Header className="mt-2" size="small" text={`${sumBetalteBoter} kr 💰`}/>)}
            </div>
            <Header className="text-3xl font-bold text-center mb-6 mt-2" size="large" text="Spilleres bøter i BSK"/>
            <SpillerBøter spillere={spillere} forseelser={forseelser} bruker={bruker}/>
        </div>
    );
}
