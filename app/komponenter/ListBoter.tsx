import type {Spiller} from "@/app/lib/spillereService.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import {Knapp} from "@/app/komponenter/Knapp.tsx";
import {markerBoterBetalt} from "@/app/lib/botService.ts";

export const ListBoter = ({spiller, erBotsjef}: { spiller: Spiller; erBotsjef: boolean }) => {
    const {forseelser} = useForseelser()
    if (spiller.boter?.length == 0) return null

    const handleMarkerBetalt = (bot: string) => {
        markerBoterBetalt([bot])
            .catch(e => {
                console.error(e)
            })
    }

    return (
        spiller.boter?.map((bot) => {
            const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
            return (
                <div key={bot.id} className="flex flex-col items-start p-4 bg-white shadow-md rounded-md mb-4">
                    <div className="text-sm md:text-base text-gray-700 mb-2">
                        <span className="font-semibold">Forseelse:</span> {forseelse?.navn},
                        <span className="font-semibold"> beløp:</span> {bot.belop} kroner
                    </div>
                    {erBotsjef && (
                        <Knapp tekst="Marker betalt" onClick={() => handleMarkerBetalt(bot.id)}/>
                    )}
                </div>
            )
        })
    )

}