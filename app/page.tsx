import SpillerBøter from "@/app/b%C3%B8ter/spiller-bøter";
import Link from "next/link";
import {hentSpillere, hentSummerForAlleSpillere} from "@/app/lib/spillereService.ts";

export const dynamic = 'force-dynamic';

export default async function Forside() {
    const spillere = await hentSpillere()
    const spillereMedSummer = await hentSummerForAlleSpillere(spillere)

    return (
        <div className="container mx-auto p-4 mt-24">
            <h3 className="text-xl mt-2">Hvilke bøter kan man få?</h3>
            <Link href={encodeURIComponent("bøter")} className="text-blue-600">Sjekk oversikt her</Link>
            <SpillerBøter spillere={spillereMedSummer}/>
        </div>
    );
}
