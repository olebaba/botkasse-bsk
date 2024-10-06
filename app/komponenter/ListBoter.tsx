import type {Spiller} from "@/app/lib/spillereService.ts";
import {useForseelser} from "@/app/hooks/useForseelser.ts";
import Header from "@/app/komponenter/Header.tsx";

export const ListBoter = ({spiller}: {spiller: Spiller}) => {
    const {forseelser} = useForseelser()
    return (
        <div>
            <Header size={"small"} text={`Bøter for spiller ${spiller.draktnummer}`} />
            {spiller.boter?.map((bot) => {
                const forseelse = forseelser.find((f) => f.id.toString() == bot.forseelseId)
                return <div key={bot.id}>Forseelse: {forseelse?.navn}, beløp: {bot.belop} kroner</div>
            })}
        </div>
    )
}