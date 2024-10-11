'use client'
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";
import AlertBanner from "@/app/komponenter/AlertBanner.tsx";
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import Header from "@/app/komponenter/Header.tsx";

export default function Forside() {
    const {spillereMedBoter} = useSpillere()
    const {forseelser} = useForseelser()

    return (
        <div className="container mx-auto p-4 mt-24">
            <AlertBanner
                message="Trykk på en rad for å se mer info!"
                type="info"
            />
            <Header className="mb-0" size="small" text="Hvilke bøter kan man få?" />
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <SpillerBøter spillere={spillereMedBoter} forseelser={forseelser}/>
        </div>
    );
}
