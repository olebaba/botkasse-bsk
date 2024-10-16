'use client'
import {ListBoter} from "@/app/komponenter/ListBoter.tsx";
import {Dropdown} from "@/app/komponenter/Dropdown.tsx";
import {useState} from "react";
import type {Spiller} from "@/app/lib/spillereService.ts";
import Header from "@/app/komponenter/Header.tsx";
import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";

export const MarkerBetalt = ({spillere, forseelser}: { spillere: Spiller[], forseelser: Forseelse[] }) => {
    const [valgtSpiller, setValgspiller] = useState<Spiller>()

    return (
        <div className="mx-auto p-4">
            <Header size="medium" text="Marker betalt bot"/>
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
                    <ListBoter key={valgtSpiller.draktnummer} forseelser={forseelser} spiller={valgtSpiller}
                               erBotsjef={true}/>
                </>
            )}
        </div>
    )
}