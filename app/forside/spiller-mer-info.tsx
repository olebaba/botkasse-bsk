import type {Spiller} from "@/lib/spillereService.ts";
import Header from "@/komponenter/Header.tsx";
import {Knapp} from "@/komponenter/Knapp.tsx";
import {ListBoter} from "@/komponenter/ListBoter.tsx";
import React from "react";
import {beregnSum} from "@/lib/botBeregning.ts";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";

interface SpillerMerInfoProps {
    spiller: Spiller;
    kolonner: { id: string, navn: string }[]
    setSpillerVipps: (spiller: Spiller) => void;
    forseelser: Forseelse[]
}

export const SpillerMerInfo = ({spiller, kolonner, setSpillerVipps, forseelser}: SpillerMerInfoProps) => {

    return (
        <tr>
            <td colSpan={Object.keys(kolonner).length + 1}
                className="p-2 bg-yellow-100">
                <div className="p-2 bg-white rounded">
                    <Header size={"small"} text={`Spiller nummer ${spiller.id}s bøter`}/>
                    <div className="mb-2 font-semibold">
                        <p>Sum alle bøter: {beregnSum(spiller.boter)} kroner.</p>
                        <p>Betalt denne sesongen: {beregnSum(spiller.boter.filter(b => b.erBetalt))} kroner.</p>
                    </div>
                    <Knapp
                        tekst={"Betal bøter i Vipps"}
                        className="bg-vipps-orange hover:bg-vipps-orange-dark text-white mb-4"
                        onClick={() => setSpillerVipps(spiller)}
                    />
                    <ListBoter forseelser={forseelser} erBotsjef={false} spiller={spiller}/>
                </div>
            </td>
        </tr>
    )
}