'use client'
import TabellData from "@/komponenter/TabellData.tsx";
import React, {Fragment, useState} from "react";
import {type Spiller} from "@/lib/spillereService.ts";
import VippsDialog from "@/komponenter/vippsDialog.tsx";
import {ListBoter} from "@/komponenter/ListBoter.tsx";
import Header from "@/komponenter/Header.tsx";
import {Knapp} from "@/komponenter/Knapp.tsx";
import type {Forseelse} from "@/app/b%C3%B8ter/page.tsx";
import type {User} from "lucia";
import {useBrukerInfo} from "@/hooks/useBrukerInfo.ts";

export default function SpillerBøter({spillere, forseelser, bruker}: {
    spillere: Spiller[],
    forseelser: Forseelse[],
    bruker?: User
}) {
    const {brukerInfo} = useBrukerInfo(bruker?.brukernavn ?? "")
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)

    const kolonner = [
        {id: 'draktnummer', navn: 'Draktnummer'},
        {id: 'manglendeBelop', navn: 'Skal betales'},
    ];

    if (bruker) {
        kolonner[0] = {id: "navn", navn: "Spiller"}
        spillere.sort((a, b) => {
            if (a.id === brukerInfo?.spiller_id) return -1;
            if (b.id === brukerInfo?.spiller_id) return 1;
            return 0;
        })
    }

    if (!spillere) return null;

    return (
        <>
            <VippsDialog tittel="Betal i vipps" spiller={spillerVipps} setSpiller={setSpillerVipps}/>
            <h1 className="text-3xl font-bold text-center mb-6 mt-2">Spilleres bøter i BSK</h1>
            <div>
                <table className="w-full bg-white border border-gray-200 shadow-lg text-lg md:text-base">
                    <thead className="bg-gray-50">
                    <tr className="hover:bg-gray-50">
                        {kolonner.map(
                            (kolonne) => {
                                return <th
                                    key={kolonne.id}
                                    className="py-2 px-4 left font-semibold text-gray-700 border-b text-center"
                                >
                                    {kolonne.navn}
                                </th>;
                            }
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {spillere.map((spiller) => (
                        <Fragment key={spiller.id}>
                            <tr
                                onClick={() => {
                                    if (merInfoSpiller == spiller) setMerInfoSpiller(undefined)
                                    else setMerInfoSpiller(spiller);
                                }}
                            >
                                <TabellData verdi={bruker ? spiller.navn : spiller.id} erNok={false}/>
                                <TabellData verdi={spiller.totalSum} erNok={true}/>
                            </tr>
                            {spiller == merInfoSpiller && (
                                <tr>
                                    <td colSpan={Object.keys(kolonner).length}
                                        className="p-2 bg-yellow-100">
                                        <div className="p-2 bg-white rounded">
                                            <Header size={"small"} text={`Spiller nummer ${spiller.id}s bøter`}/>
                                            <div className="mb-2 font-semibold">
                                                <p>Sum alle
                                                    bøter: {spiller.totalSum + (spiller?.betaltSesong || 0)} kroner.</p>
                                                <p>Betalt denne sesongen: {spiller.betaltSesong} kroner.</p>
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
                            )}
                        </Fragment>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
