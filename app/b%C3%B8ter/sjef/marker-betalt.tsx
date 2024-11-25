'use client'
import {ListBoter} from "@/komponenter/ListBoter.tsx";
import {Dropdown} from "@/komponenter/Dropdown.tsx";
import React, {useState} from "react";
import type {Spiller} from "@/lib/spillereService.ts";
import Header from "@/komponenter/Header.tsx";
import type {Forseelse} from "@/app/api/boter/typer/route.ts";
import AlertBanner, {AlertTypes} from "@/komponenter/AlertBanner.tsx";

export const MarkerBetalt = (
    {spillere, forseelser}: { spillere: Spiller[], forseelser: Forseelse[] }
) => {
    const [valgtSpiller, setValgspiller] = useState<Spiller>()
    const [melding, setMelding] = useState<{tekst: string, type: AlertTypes} | null>(null);

    const handterResultat = (melding: string, type: AlertTypes) => {
        setMelding({tekst: melding, type: type});
    }

    return (
        <div className="mx-auto p-4">
            <Header size="medium" text="Marker betalt bot"/>
            {melding &&
                <AlertBanner message={melding.tekst} type={melding.type}/>
            }
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
                               erBotsjef={true} visResultat={handterResultat}/>
                </>
            )}
        </div>
    )
}