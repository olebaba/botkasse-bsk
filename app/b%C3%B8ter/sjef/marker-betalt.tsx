'use client'
import {useSpillere} from "@/app/hooks/useSpillere.ts";
import {ListBoter} from "@/app/komponenter/ListBoter.tsx";
import {Dropdown} from "@/app/komponenter/Dropdown.tsx";
import {useState} from "react";
import type {Spiller} from "@/app/lib/spillereService.ts";
import Header from "@/app/komponenter/Header.tsx";

export const MarkerBetalt = () => {
    const {spillereMedBoter: spillere} = useSpillere()
    const [valgtSpiller, setValgspiller] = useState<Spiller>()

    return (
        <div className="mx-auto p-4">
            <Header size="medium" text="Marker betalt bot" />
            <Dropdown
                id={"spillere"}
                label={"Velg spiller"}
                options={spillere}
                placeholder={"Velg en spiller"}
                onChange={(e) => {
                    const spiller = spillere.find((spiller) => spiller.id == e.target.value)
                    setValgspiller(spiller)
                }}
            />
            {valgtSpiller && (
                <>
                    <Header size={"small"} text={`Bøter for spiller ${valgtSpiller.draktnummer}`}/>
                    <ListBoter key={valgtSpiller.draktnummer} spiller={valgtSpiller} erBotsjef={true}/>
                </>
            )}
        </div>
    )
}