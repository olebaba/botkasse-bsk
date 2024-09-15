import {useState} from 'react';
import {oppdaterSpiller, Spiller} from "@/app/lib/spillereService";
import TabellData from "@/app/b%C3%B8ter/TabellData";

interface Props {
    setError: (err: string) => void,
    spillere: Spiller[],
    setSpillere: (spillere: Spiller[]) => void,
    setAlleNavn: (value: { [p: number]: string }) => void
    alleNavn: { [key: number]: string }
}

export default function SpillerBøter({setError, spillere, setSpillere, setAlleNavn, alleNavn}: Props) {
    const oppdaterNavn = (draktnummer: number, navn: string) => {
        const oppdaterteNavn = {navn, [draktnummer]: navn};
        setAlleNavn(oppdaterteNavn);
        localStorage.setItem('spillernavn', JSON.stringify(oppdaterteNavn));
    };

    const markerBetalt = async (draktnummer: number) => {
        try {
            const spiller = spillere.find(s => s.draktnummer === draktnummer);
            if (spiller) {
                const oppdatertSpiller = await oppdaterSpiller(draktnummer, spiller.totalSum, !spiller.betaltAlle);
                setSpillere(spillere.map(spiller => (spiller.draktnummer === draktnummer ? oppdatertSpiller : spiller)));
            }
        } catch (error) {
            setError('Kunne ikke oppdatere spiller');
        }
    };

    // Definer kolonner og visningstilstanden
    const kolonner = [
        {id: 'draktnummer', navn: 'Draktnummer'},
        {id: 'navn', navn: 'Navn'},
        {id: 'totalSum', navn: 'Total sum bøter'},
        {id: 'betaltSesong', navn: 'Betalt denne sesongen'},
        {id: 'betaltMaaned', navn: 'Betalt denne måneden'},
        {id: 'utestaaende', navn: 'Utestående beløp'},
        {id: 'status', navn: 'Status'},
        {id: 'handling', navn: 'Handling'}
    ];

    // Tilstand for å holde styr på hvilke kolonner som vises
    const [visKolonner, setVisKolonner] = useState<{ [index: string]: boolean }>({
        draktnummer: true,
        navn: false,
        totalSum: false,
        betaltSesong: false,
        betaltMaaned: true,
        utestaaende: true,
        status: true,
        handling: false,
    });

    // Funksjon for å toggle kolonnevisning
    const toggleKolonne = (kolonneId: string) => {
        setVisKolonner((prevState) => ({
            ...prevState,
            [kolonneId]: !prevState[kolonneId],
        }));
    };

    return (
        <>
            <h1 className="text-3xl font-bold text-center mb-6">Spilleres bøter i BSK</h1>
            <div className="mb-4">
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
            </div>

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
                    <tr key={spiller.draktnummer} className="hover:bg-gray-100">
                        <TabellData skalVises={visKolonner.draktnummer} verdi={spiller.draktnummer} erNok={false}/>
                        {visKolonner.navn && (
                            <td className="py-2 px-4 border-b">
                                <input
                                    type="text"
                                    value={alleNavn[spiller.draktnummer] || ''}
                                    placeholder="Legg til navn"
                                    onChange={(e) => oppdaterNavn(spiller.draktnummer, e.target.value)}
                                    className="border rounded px-2 py-1 w-full"
                                />
                            </td>
                        )}
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
                        {visKolonner.handling && (
                            <td className="py-2 px-4 border-b">
                                <button
                                    onClick={() => markerBetalt(spiller.draktnummer)}
                                    className={`px-3 py-1 rounded ${
                                        spiller.betaltAlle ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                    } hover:bg-opacity-80`}
                                >
                                    {spiller.betaltAlle ? 'Marker som ikke betalt' : 'Marker som betalt'}
                                </button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </>
    );
}
