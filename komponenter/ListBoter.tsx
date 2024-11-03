import type {Spiller} from "@/lib/spillereService.ts";
import {Knapp} from "@/komponenter/Knapp.tsx";
import {markerBoterBetalt} from "@/lib/botService.ts";
import React from "react";
import dayjs from "@/lib/dayjs.ts";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";

export const ListBoter = ({forseelser, spiller, erBotsjef}: {
    forseelser: Forseelse[];
    spiller: Spiller;
    erBotsjef: boolean
}) => {
    if (spiller.boter?.length === 0) return null;

    const handleMarkerBetalt = (bot: string) => {
        markerBoterBetalt([bot])
            .catch(e => {
                console.error(e);
            });
    };

    return (
        <table className="w-full bg-white shadow-md rounded-md mb-4">
            <thead>
            <tr className="text-left text-sm md:text-base text-gray-700 bg-gray-100">
                <th className="py-2 px-4">Bot</th>
                <th className="py-2 px-4">Dato</th>
                <th className="py-2 px-4">Beløp</th>
                <th className="py-2 px-4">Status</th>
                {erBotsjef && <th className="py-2 px-4">Handling</th>}
            </tr>
            </thead>
            <tbody>
            {spiller.boter?.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId);
                const dato = `${dayjs(bot.dato).format('DD.MM')}`
                return (
                    <tr key={bot.id} className="border-t border-gray-200">
                        <td className="py-2 px-4">{forseelse?.navn}</td>
                        <td className="py-2 px-4">{dato}</td>
                        <td className="py-2 px-4 text-right">{bot.belop}kr</td>
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
