'use client'
import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";
import AlertBanner from "@/app/komponenter/AlertBanner.tsx";
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";

export default function Forside() {
    const {spillereMedBoter} = useSpillere()
    const {forseelser} = useForseelser()

    return (
        <div className="container mx-auto p-4 mt-24">
            <AlertBanner
                message="Trykk på raden med ditt draknummer for å betale i Vipps! (Kun i Safari og Chrome)"
                type="info"
            />
            <h3 className="text-xl mt-2">Hvilke bøter kan man få?</h3>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <SpillerBøter spillere={spillereMedBoter} forseelser={forseelser}/>
        </div>
    );
}
