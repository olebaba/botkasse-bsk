'use client'
import TabellData from "@/app/komponenter/TabellData.tsx";
import {useState} from "react";
import {type Spiller} from "@/app/lib/spillereService.ts";
import {generateVippsUrl} from "@/app/lib/vipps.ts";
import {useRouter} from "next/navigation";
import dayjs from "@/app/lib/dayjs.ts";

export default function SpillerBøter({spillere}: { spillere: Spiller[] }) {
    const router = useRouter()
    // Definer kolonner og visningstilstanden
    const kolonner = [
        {id: 'draktnummer', navn: 'Draktnummer'},
        {id: 'totalSum', navn: 'Total sum bøter'},
        {id: 'betaltSesong', navn: 'Betalt denne sesongen'},
        {id: 'betaltMaaned', navn: 'Betalt denne måneden'},
        {id: 'utestaaende', navn: 'Utestående beløp'},
        {id: 'status', navn: 'Status'},
    ];

    // Tilstand for å holde styr på hvilke kolonner som vises
    const [visKolonner, setVisKolonner] = useState<{ [index: string]: boolean }>({
        draktnummer: true,
        totalSum: false,
        betaltSesong: false,
        betaltMaaned: true,
        utestaaende: true,
        status: true,
    });

    // Funksjon for å toggle kolonnevisning
    const toggleKolonne = (kolonneId: string) => {
        setVisKolonner((prevState) => ({
            ...prevState,
            [kolonneId]: !prevState[kolonneId],
        }));
    };

    const [visFilter, setVisFilter] = useState(false)

    if (!spillere) return null;

    const betalIVipps = (spiller: Spiller) => {
        const vilBetale = confirm(`Betal i vipps?`)
        if (vilBetale) {
            const maaned = dayjs().format('MMMM');
            const belopOre = (spiller.totalSum ?? 0) * 100;
            const vippsUrl = generateVippsUrl('97513023', belopOre, `Bøter for måneden ${maaned}`)
            router.push(vippsUrl)
        }
    }

    return (
        <>
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

            <div className="overflow-scroll">
                <table className="min-w-full bg-white border border-gray-200 shadow-lg">
                    <thead className="bg-gray-50">
                    <tr>
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
                        <tr key={spiller.draktnummer} className="hover:bg-gray-100"
                            onClick={() => betalIVipps(spiller)}>
                            <TabellData skalVises={visKolonner.draktnummer} verdi={spiller.draktnummer} erNok={false}/>
                            <TabellData skalVises={visKolonner.totalSum} verdi={spiller.totalSum} erNok={true}/>
                            <TabellData skalVises={visKolonner.betaltSesong} verdi={spiller.betaltSesong} erNok={true}/>
                            <TabellData skalVises={visKolonner.betaltMaaned} verdi={spiller.betaltMaaned} erNok={true}/>
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
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
