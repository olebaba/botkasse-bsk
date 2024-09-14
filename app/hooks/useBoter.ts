import { useEffect, useState } from 'react';

export const useBoter = (draktnummer: number) => {
    const [sumSisteMaaned, setSumSisteMaaned] = useState<number | null>(null);
    const [sumSesong, setSumSesong] = useState<number | null>(null);
    const [utestaaendeSum, setUtestaaendeSum] = useState<number | null>(null);

    useEffect(() => {
        const fetchBoter = async () => {
            const response = await fetch(`/api/boter?draktnummer=${draktnummer}`);
            const data = await response.json();
            setSumSisteMaaned(data.sumSisteMaaned);
            setSumSesong(data.sumSesong);
            setUtestaaendeSum(data.utestaaendeSum);
        };

        fetchBoter()
            .catch((error) => {
                console.error(error);
            });
    }, [draktnummer]);

    return { sumSisteMaaned, sumSesong, utestaaendeSum };
};
