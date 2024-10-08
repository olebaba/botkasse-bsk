import type {Spiller} from "@/app/lib/spillereService.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import {Knapp} from "@/app/komponenter/Knapp.tsx";
import {markerBoterBetalt} from "@/app/lib/botService.ts";
import React from "react";

export const ListBoter = ({spiller, erBotsjef}: { spiller: Spiller; erBotsjef: boolean }) => {
    const {forseelser} = useForseelser();
    if (spiller.boter?.length === 0) return null;

    const handleMarkerBetalt = (bot: string) => {
        markerBoterBetalt([bot])
            .catch(e => {
                console.error(e);
            });
    };

    return (
        <table className="min-w-full bg-white shadow-md rounded-md mb-4">
            <thead>
            <tr className="text-left text-sm md:text-base text-gray-700 bg-gray-100">
                <th className="py-2 px-4">Forseelse</th>
                <th className="py-2 px-4">Beløp</th>
                <th className="py-2 px-4">Status</th>
                {erBotsjef && <th className="py-2 px-4">Handling</th>}
            </tr>
            </thead>
            <tbody>
            {spiller.boter?.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId);
                return (
                    <tr key={bot.id} className="border-t border-gray-200">
                        <td className="py-2 px-4">{forseelse?.navn}</td>
                        <td className="py-2 px-4">{bot.belop} kroner</td>
                        <td className="py-2 px-4">
                            <span
                                className={`${
                                    bot.erBetalt ? "text-green-600" : "text-red-600"
                                } font-semibold`}
                            >
                                {bot.erBetalt ? "Betalt" : "Ikke betalt"}
                            </span>
                        </td>
                        {erBotsjef && (
                            <td className="py-2 px-4">
                                <Knapp tekst="Marker betalt" onClick={() => handleMarkerBetalt(bot.id)}/>
                            </td>
                        )}
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
};
