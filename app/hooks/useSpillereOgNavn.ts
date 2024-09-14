import {useEffect, useState} from 'react';
import {Spiller, hentSpillere, hentSummerForSpiller} from '../lib/spillereService';

export function useSpillereOgNavn() {
    const [spillere, setSpillere] = useState<Spiller[]>([]);
    const [alleNavn, setAlleNavn] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<null | string>(null);
    const [hentetSummer, setHentetSummer] = useState<boolean>(false);

    // Først, hent spillere og navn
    useEffect(() => {
        const fetchSpillereOgNavn = async () => {
            const navnResponse = await fetch('/spillernavn.json');
            const navnData = await navnResponse.json();
            const navnMap = navnData.reduce((acc: { [key: number]: string }, spiller: Spiller) => {
                if (spiller.navn) {
                    acc[spiller.draktnummer] = spiller.navn;
                }
                return acc;
            }, {});
            setAlleNavn(navnMap);

            // Hent spillere fra API
            const spillere = await hentSpillere();
            setSpillere(spillere);
            return spillere;
        };

        const oppdaterSpillereMedBoter = async (spillere: Spiller[]) => {
            const spillereMedSummer = await Promise.all(
                spillere.map(async (spiller) => {
                    // Hent summer for hver spiller
                    const summerForSpiller = await hentSummerForSpiller(spiller.draktnummer)
                    console.log(summerForSpiller);

                    // Returner spilleren med de nye summerte verdiene
                    return {
                        ...spiller,
                        ...summerForSpiller,
                    };
                })
            );
            setSpillere(spillereMedSummer);
        };

        fetchSpillereOgNavn()
            .then((spillere) => {
                if (!hentetSummer && spillere.length > 0) {
                    oppdaterSpillereMedBoter(spillere)
                        .then(() => {
                            setHentetSummer(true)
                        })
                }
            })
            .catch((error) => {
                console.error(error);
                setError('Kunne ikke hente data');
            })
            .finally(() => {
                setLoading(false);
            })
    }, []);


    return {spillere, setSpillere, alleNavn, setAlleNavn, loading, error, setError};
}
