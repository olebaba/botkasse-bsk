'use client'
import TabellData from "@/app/komponenter/TabellData.tsx";
import React, {useState} from "react";
import {type Spiller} from "@/app/lib/spillereService.ts";
import VippsDialog from "@/app/komponenter/vippsDialog.tsx";
import {ListBoter} from "@/app/komponenter/ListBoter.tsx";
import Header from "@/app/komponenter/Header.tsx";
import {Knapp} from "@/app/komponenter/Knapp.tsx";

export default function SpillerBøter({spillere}: { spillere: Spiller[] }) {
    const [spillerVipps, setSpillerVipps] = useState<Spiller | undefined>(undefined)
    const [merInfoSpiller, setMerInfoSpiller] = useState<Spiller | undefined>(undefined)

    const kolonner = [
        {id: 'draktnummer', navn: 'Draktnummer'},
        {id: 'totalSum', navn: 'Total sum bøter'},
        {id: 'betaltSesong', navn: 'Betalt denne sesongen'},
        {id: 'betaltMaaned', navn: 'Betalt denne måneden'},
        {id: 'utestaaende', navn: 'Utestående beløp'},
        {id: 'status', navn: 'Status'},
    ];

    const [visKolonner, setVisKolonner] = useState<{ [index: string]: boolean }>({
        draktnummer: true,
        totalSum: false,
        betaltSesong: false,
        betaltMaaned: true,
        utestaaende: true,
        status: true,
    });

    const toggleKolonne = (kolonneId: string) => {
        setVisKolonner((prevState) => ({
            ...prevState,
            [kolonneId]: !prevState[kolonneId],
        }));
    };

    const [visFilter, setVisFilter] = useState(false)

    if (!spillere) return null;

    return (
        <>
            <VippsDialog tittel="Betal i vipps" spiller={spillerVipps} setSpiller={setSpillerVipps}/>
            <h1 className="text-3xl font-bold text-center mb-6">Spilleres bøter i BSK</h1>
            <button onClick={() => setVisFilter(!visFilter)}>Vis filter</button>
            {visFilter && (<div className="mb-4">
                {kolonner.map((kolonne) => (
                    <button
                        key={kolonne.id}
                        onClick={() => toggleKolonne(kolonne.id)}
                        className={`px-3 py-1 mr-2 mb-2 rounded ${
                            visKolonner[kolonne.id] ? 'bg-blue-500' : 'bg-gray-500'
                        } text-white`}
                    >
                        {visKolonner[kolonne.id] ? `Skjul ${kolonne.navn}` : `Vis ${kolonne.navn}`}
                    </button>
                ))}
            </div>)}

            <div>
                <table className="w-full bg-white border border-gray-200 shadow-lg text-sm md:text-base">
                    <thead className="bg-gray-50">
                    <tr className="hover:bg-gray-50">
                        {kolonner.map(
                            (kolonne) =>
                                visKolonner[kolonne.id] && (
                                    <th
                                        key={kolonne.id}
                                        className="py-2 px-4 left font-semibold text-gray-700 border-b text-center"
                                    >
                                        {kolonne.navn}
                                    </th>
                                )
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {spillere.map((spiller) => (
                        <>
                            <tr
                                key={spiller.draktnummer}
                                onClick={() => {
                                    if (merInfoSpiller == spiller) setMerInfoSpiller(undefined)
                                    else setMerInfoSpiller(spiller);
                                }}
                            >
                                <TabellData skalVises={visKolonner.draktnummer} verdi={spiller.draktnummer}
                                            erNok={false}/>
                                <TabellData skalVises={visKolonner.totalSum} verdi={spiller.totalSum} erNok={true}/>
                                <TabellData skalVises={visKolonner.betaltSesong} verdi={spiller.betaltSesong}
                                            erNok={true}/>
                                <TabellData skalVises={visKolonner.betaltMaaned} verdi={spiller.betaltMaaned}
                                            erNok={true}/>
                                <TabellData skalVises={visKolonner.utestaaende} verdi={spiller.totalSum} erNok={true}/>
                                {visKolonner.status && (
                                    <td className="py-2 px-4 border-b text-center">
                                  <span
                                      className={`${
                                          spiller.betaltAlle ? 'text-green-600' : 'text-red-600'
                                      } font-semibold`}
                                  >
                                    {spiller.betaltAlle ? 'Betalt' : 'Ikke betalt'}
                                  </span>
                                    </td>
                                )}
                            </tr>
                            {spiller == merInfoSpiller && (
                                <tr>
                                    <td colSpan={Object.keys(visKolonner).length} className="p-4 bg-yellow-100 border-b">
                                        <Header size={"small"} text={`Spiller nummer ${spiller.draktnummer}s bøter`}/>
                                        <Knapp
                                            tekst={"Betal bøter i Vipps"}
                                            className="bg-vipps-orange hover:bg-vipps-orange-dark text-white mb-4"
                                            onClick={() => setSpillerVipps(spiller)}
                                        />
                                        <ListBoter erBotsjef={false} spiller={spiller}/>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
