import type {Spiller} from "@/lib/spillereService.ts";
import {Knapp} from "@/komponenter/Knapp.tsx";
import {toggleBoterBetalt} from "@/lib/botService.ts";
import React, {useEffect, useState} from "react";
import dayjs from "@/lib/dayjs.ts";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";
import {AlertTypes} from "@/komponenter/AlertBanner.tsx";
import type {Bot} from "@/app/api/boter/[spiller_id]/route.ts";

export const ListBoter = ({forseelser, spiller, erBotsjef, visResultat}: {
    forseelser: Forseelse[];
    spiller: Spiller;
    erBotsjef: boolean;
    visResultat: (melding: string, type: AlertTypes) => void
}) => {
    const [boterForSpiller, setBoterForSpiller] = useState<Bot[]>([]);
    if (spiller.boter?.length === 0) return null;

    useEffect(() => {
        setBoterForSpiller(spiller.boter);
    }, [spiller]);

    const handleMarkerBetalt = async (bot: Bot): Promise<boolean> => {
        try {
            const oppdatertBot: Bot = {
                ...bot, erBetalt: !bot.erBetalt,
            }
            const oppdaterteBoter = boterForSpiller.map((b) =>
                b.id === bot.id ? oppdatertBot : b
            );
            setBoterForSpiller(oppdaterteBoter)
            await toggleBoterBetalt([bot.id])
            visResultat(!bot.erBetalt ? "Markerte bot som betalt" : "Markerte som ikke betalt", AlertTypes.SUCCESS)
            return true
        } catch (error) {
            console.error(error)
            visResultat("Noe gikk galt, ble ikke markert", AlertTypes.ERROR)
            return false
        }
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
            {boterForSpiller?.map((bot) => {
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
                                <Knapp
                                    className={bot.erBetalt ? "bg-red-500 hover:bg-red-500" : ""}
                                    tekst={bot.erBetalt ? "Sett ubetalt" : "Sett betalt"}
                                    onClick={async () => {
                                        await handleMarkerBetalt(bot);
                                    }}
                                />
                            </td>
                        )}
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
};
